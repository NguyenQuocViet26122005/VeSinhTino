# Register the command webhook after deployment. No token is printed or saved.
# An unrelated existing webhook is never replaced. No test messages are sent.
# Only Telegram is contacted; no authenticated website probe is performed.

function Register-TinoTrafficWebhook {
    param([string] $EnvironmentPath = (Join-Path $PSScriptRoot '..\.env'))
    $secureToken = $null
    $telegramBotToken = $null
    $webhookSecret = $null
    try {
        $secretMatch = [regex]::Match([System.IO.File]::ReadAllText($EnvironmentPath), '(?m)^TELEGRAM_WEBHOOK_SECRET=([A-Za-z0-9_-]{32,256})\r?$')
        if (!$secretMatch.Success) {
            Write-Host 'Local webhook secret was not found. Ask for setup guidance; do not paste a secret into chat.'
            return
        }
        $webhookSecret = $secretMatch.Groups[1].Value
        $secretMatch = $null
        $webhookUrl = 'https://vesinhtino.com/api/traffic-report'
        $secureToken = Read-Host 'Paste the existing Tino bot token, then press Enter (hidden)' -AsSecureString
        $telegramBotToken = ([System.Net.NetworkCredential]::new('', $secureToken)).Password.Trim()
        if ($telegramBotToken -notmatch '^[0-9]{6,20}:[A-Za-z0-9_-]{30,}$') {
            Write-Host 'Invalid bot token format. Nothing was changed.'
            return
        }
        $bot = Invoke-RestMethod -Method Post -Uri ('https://api.telegram.org/bot' + $telegramBotToken + '/getMe') -Body '{}' -ContentType 'application/json' -TimeoutSec 20 -MaximumRedirection 0 -ErrorAction Stop
        if ($bot.ok -ne $true -or !$bot.result.username) { throw 'Unable to identify bot.' }
        Write-Host ('Bot: @' + $bot.result.username)
        $hook = Invoke-RestMethod -Method Post -Uri ('https://api.telegram.org/bot' + $telegramBotToken + '/getWebhookInfo') -Body '{}' -ContentType 'application/json' -TimeoutSec 20 -MaximumRedirection 0 -ErrorAction Stop
        if ($hook.ok -ne $true) { throw 'Unable to inspect webhook.' }
        if ($hook.result.url -and $hook.result.url -cne $webhookUrl) {
            Write-Host 'Another webhook is active. Nothing was changed. Ask for setup guidance.'
            return
        }
        Write-Host 'Registration sends the local webhook secret to Telegram. Telegram will include it when delivering commands to your website.'
        $confirmation = Read-Host 'Check the bot username above. Type YES to register; any other input cancels'
        if ($confirmation -cne 'YES') { Write-Host 'Cancelled. Nothing was changed.'; return }
        $payload = @{ url = $webhookUrl; secret_token = $webhookSecret; allowed_updates = @('message'); drop_pending_updates = $false } | ConvertTo-Json -Compress
        $registered = Invoke-RestMethod -Method Post -Uri ('https://api.telegram.org/bot' + $telegramBotToken + '/setWebhook') -Body $payload -ContentType 'application/json' -TimeoutSec 20 -MaximumRedirection 0 -ErrorAction Stop
        if ($registered.ok -ne $true) { throw 'Registration was not confirmed.' }
        $verified = Invoke-RestMethod -Method Post -Uri ('https://api.telegram.org/bot' + $telegramBotToken + '/getWebhookInfo') -Body '{}' -ContentType 'application/json' -TimeoutSec 20 -MaximumRedirection 0 -ErrorAction Stop
        if ($verified.ok -ne $true -or $verified.result.url -cne $webhookUrl -or $verified.result.allowed_updates -notcontains 'message') { throw 'Registration could not be verified.' }
        Write-Host 'Webhook registered and verified. Each allowed account can now send /start and /baocao.'
        Write-Host 'No test messages were sent. Keep the token and webhook secret private.'
    } catch {
        # Never echo $_: request errors can contain the bot token or secret headers.
        Write-Host 'Setup could not be confirmed. Check deployment, matching webhook secret, connectivity and bot token; do not paste secrets or raw request errors into chat.'
    } finally {
        $telegramBotToken = $null
        $webhookSecret = $null
        $payload = $null
        if ($null -ne $secureToken) { $secureToken.Dispose() }
    }
}

if ($MyInvocation.InvocationName -ne '.') {
    Register-TinoTrafficWebhook
}
