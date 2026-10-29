# Run locally; never paste a bot token into chat or a browser URL.
# This script only reads bot metadata and pending updates. It never sends a
# message, acknowledges updates with an offset, or changes/deletes a webhook.

function Get-TinoPrivateChatIds {
    param([object[]] $Updates)
    $chatIds = @{}
    foreach ($update in $Updates) {
        $message = $update.message
        if ($null -eq $message) { continue }
        $chatId = [string] $message.chat.id
        if ($message.chat.type -eq 'private' -and
            $message.from.is_bot -ne $true -and
            [string] $message.from.id -eq $chatId -and
            $chatId -match '^[1-9][0-9]{0,19}$') {
            $chatIds[$chatId] = $true
        }
    }
    return @($chatIds.Keys | Sort-Object)
}

function Show-TinoTelegramChatIds {
    $secureToken = $null
    $telegramBotToken = $null
    try {
        Write-Host 'Bot token is entered privately; it will not be printed or saved.'
        $secureToken = Read-Host 'Paste the existing bot token, then press Enter' -AsSecureString
        $telegramBotToken = ([System.Net.NetworkCredential]::new('', $secureToken)).Password.Trim()
        if ($telegramBotToken -notmatch '^[0-9]{6,20}:[A-Za-z0-9_-]{30,}$') {
            Write-Host 'Invalid token format. Use the bot token, not its name or Chat ID.'
            return
        }

        # Keep transport errors private: PowerShell errors may include the token URL.
        $bot = Invoke-RestMethod -Method Post -Uri ('https://api.telegram.org/bot' + $telegramBotToken + '/getMe') -Body '{}' -ContentType 'application/json' -TimeoutSec 20 -MaximumRedirection 0 -ErrorAction Stop
        if ($bot.ok -ne $true -or !$bot.result.username) { throw 'Unable to identify bot.' }
        Write-Host ('Bot: @' + $bot.result.username)
        $hook = Invoke-RestMethod -Method Post -Uri ('https://api.telegram.org/bot' + $telegramBotToken + '/getWebhookInfo') -Body '{}' -ContentType 'application/json' -TimeoutSec 20 -MaximumRedirection 0 -ErrorAction Stop
        if ($hook.ok -ne $true) { throw 'Unable to inspect webhook.' }
        if ($hook.result.url) {
            Write-Host 'An existing webhook is active. Nothing was changed. Stop here and ask for setup guidance.'
            return
        }
        $updates = Invoke-RestMethod -Method Post -Uri ('https://api.telegram.org/bot' + $telegramBotToken + '/getUpdates') -Body '{"limit":100,"timeout":0}' -ContentType 'application/json' -TimeoutSec 20 -MaximumRedirection 0 -ErrorAction Stop
        if ($updates.ok -ne $true) { throw 'Unable to read updates.' }
        $chatIds = @(Get-TinoPrivateChatIds -Updates @($updates.result))
        if ($chatIds.Count -eq 0) {
            Write-Host 'No private Chat IDs found. Send /start to this bot from account 2 and run this script again.'
        } else {
            foreach ($chatId in $chatIds) { Write-Host ('Chat ID: ' + $chatId) }
            Write-Host 'Only private Chat IDs are listed. No message contents or token were printed.'
        }
    } catch {
        Write-Host 'Telegram could not be read. Check your connection and bot token; an existing polling service may also be active. No webhook was changed.'
    } finally {
        $telegramBotToken = $null
        if ($null -ne $secureToken) { $secureToken.Dispose() }
    }
}

if ($MyInvocation.InvocationName -ne '.') {
    Show-TinoTelegramChatIds
}
