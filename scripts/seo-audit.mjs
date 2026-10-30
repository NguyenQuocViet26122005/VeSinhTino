import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

console.log('--- LOCAL BUILD SEO CHECKS ---');

const baseDir = path.resolve('dist');
assert(fs.existsSync(baseDir), 'dist/ directory does not exist. Run npm run build first.');

// 1. Collect all HTML files in dist/ recursively
const htmlFiles = [];
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name.endsWith('.html')) {
      htmlFiles.push(fullPath);
    }
  }
}
walk(baseDir);

console.log(`Found ${htmlFiles.length} HTML files in ${baseDir}\n`);
assert(htmlFiles.length >= 20, `Expected at least 20 HTML files, found ${htmlFiles.length}`);

let auditedPages = 0;
let jsonLdBlocksCount = 0;
const indexablePages = new Map();

for (const file of htmlFiles) {
  const relPath = path.relative(baseDir, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');
  console.log(`Checking [${relPath}]:`);

  // A. Canonical tag validation
  const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"[^>]*>/i);
  assert(canonicalMatch, `Missing canonical link tag in ${relPath}`);
  const canonicalUrl = canonicalMatch[1];
  assert(canonicalUrl.startsWith('https://vesinhtino.com/'), `Canonical must start with https://vesinhtino.com/ in ${relPath}, got: ${canonicalUrl}`);
  assert(!canonicalUrl.includes('localhost'), `Canonical must not contain localhost in ${relPath}`);
  assert(!canonicalUrl.includes('?'), `Canonical must not contain query strings in ${relPath}`);
  assert(!canonicalUrl.includes('#'), `Canonical must not contain fragments in ${relPath}`);

  // Route match check
  if (relPath === 'index.html') {
    assert.equal(canonicalUrl, 'https://vesinhtino.com/', `index.html canonical should be https://vesinhtino.com/`);
  } else if (relPath === '404.html') {
    assert.equal(canonicalUrl, 'https://vesinhtino.com/404/', `404 canonical should be https://vesinhtino.com/404/`);
  } else if (relPath.endsWith('/index.html')) {
    const expectedRoute = 'https://vesinhtino.com/' + relPath.replace(/\/index\.html$/, '/');
    assert.equal(canonicalUrl, expectedRoute, `Canonical URL mismatch in ${relPath}: expected ${expectedRoute}, got ${canonicalUrl}`);
  }
  console.log(`  ✓ Canonical: ${canonicalUrl}`);

  // B. Robots meta validation (Strict token matching with word boundaries)
  const robotsMatch = html.match(/<meta[^>]*name="robots"[^>]*content="([^"]+)"[^>]*>/i);
  assert(robotsMatch, `Missing robots meta tag in ${relPath}`);
  const robotsContent = robotsMatch[1].trim();

  if (relPath === '404.html') {
    assert(/\bnoindex\b/i.test(robotsContent), `404 page robots must contain 'noindex', got: ${robotsContent}`);
    console.log(`  ✓ Robots: ${robotsContent} (correctly noindexed)`);
  } else {
    assert(/\bindex\b/i.test(robotsContent), `Public page must have 'index' token in robots: ${relPath}`);
    assert(!/\bnoindex\b/i.test(robotsContent), `Public page must NOT have 'noindex' token in robots: ${relPath}`);
    assert(!indexablePages.has(canonicalUrl), `Duplicate indexable canonical: ${canonicalUrl}`);
    indexablePages.set(canonicalUrl, relPath);
    console.log(`  ✓ Robots: ${robotsContent}`);
  }

  // C. Title & Meta Description
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  assert(titleMatch && titleMatch[1].trim().length > 0, `Missing or empty <title> in ${relPath}`);
  const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
  assert(descMatch && descMatch[1].trim().length > 0, `Missing or empty meta description in ${relPath}`);
  console.log(`  ✓ Title: "${titleMatch[1].trim().slice(0, 45)}..."`);

  // D. Exactly one H1
  const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  assert.equal(h1Matches.length, 1, `Expected exactly 1 H1 in ${relPath}, found ${h1Matches.length}`);
  const h1Text = h1Matches[0][1].replace(/<[^>]+>/g, '').trim();
  assert(h1Text.length > 0, `H1 must not be empty in ${relPath}`);
  console.log(`  ✓ H1: "${h1Text.slice(0, 45)}..."`);

  // E. JSON syntax and selected local schema regression checks, not a complete
  // Schema.org validator or a guarantee of Google rich-result eligibility.
  const schemaMatches = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  assert(schemaMatches.length > 0, `Expected at least 1 JSON-LD script block in ${relPath}`);

  for (let i = 0; i < schemaMatches.length; i++) {
    const rawJson = schemaMatches[i][1];
    let parsed;
    try {
      parsed = JSON.parse(rawJson);
    } catch (err) {
      assert.fail(`Invalid JSON in LD+JSON block ${i + 1} of ${relPath}: ${err.message}`);
    }
    jsonLdBlocksCount++;

    // Recursively inspect JSON-LD object
    function checkSchemaNode(node, pathStr = '$') {
      if (!node || typeof node !== 'object') return;

      if (Array.isArray(node)) {
        node.forEach((item, idx) => checkSchemaNode(item, `${pathStr}[${idx}]`));
        return;
      }

      // Check @type
      if (node['@type']) {
        assert.notEqual(
          node['@type'],
          'CleaningService',
          `Forbidden non-standard schema @type 'CleaningService' found at ${pathStr} in ${relPath}`
        );
      }

      // Disallow fake 7-day schedule openingHours
      assert.equal(
        node.openingHoursSpecification,
        undefined,
        `Fake OpeningHoursSpecification found at ${pathStr} in ${relPath}`
      );

      // Validate UnitPriceSpecification numeric prices
      if (node['@type'] === 'UnitPriceSpecification') {
        if (node.price !== undefined) {
          assert(
            typeof node.price === 'number' && !isNaN(node.price) && node.price > 0,
            `UnitPriceSpecification.price must be a positive number at ${pathStr} in ${relPath}, got ${node.price}`
          );
        }
        if (node.minPrice !== undefined) {
          assert(
            typeof node.minPrice === 'number' && !isNaN(node.minPrice) && node.minPrice > 0,
            `UnitPriceSpecification.minPrice must be a positive number at ${pathStr} in ${relPath}, got ${node.minPrice}`
          );
        }
        if (node.maxPrice !== undefined) {
          assert(
            typeof node.maxPrice === 'number' && !isNaN(node.maxPrice) && node.maxPrice > 0,
            `UnitPriceSpecification.maxPrice must be a positive number at ${pathStr} in ${relPath}, got ${node.maxPrice}`
          );
        }
        if (node.minPrice !== undefined && node.maxPrice !== undefined) {
          assert(
            node.minPrice <= node.maxPrice,
            `minPrice (${node.minPrice}) must be <= maxPrice (${node.maxPrice}) at ${pathStr} in ${relPath}`
          );
        }
      }

      // Check children
      for (const [k, v] of Object.entries(node)) {
        if (typeof v === 'object' && v !== null) {
          checkSchemaNode(v, `${pathStr}.${k}`);
        }
      }
    }

    checkSchemaNode(parsed);
  }

  // F. Known editorial regression patterns. Absence is not fact verification.
  const forbiddenPatterns = [
    /\b5–10\s*phút\b/i,
    /\b5-10\s*phút\b/i,
    /trong\s+vòng\s+5–10\s+phút/i,
    /trong\s+5\s+phút/i,
    /khảo\s+sát\s+(?:tận\s+nơi\s+)?miễn\s+phí/i,
    /tư\s+vấn\s+(?:&\s+khảo\s+sát\s+)?miễn\s+phí/i,
    /an\s+toàn\s+tuyệt\s+đối/i,
    /triệt\s+để\s+vi\s+khuẩn/i,
    /diệt\s+khuẩn\s+99\.9%/i,
    /hài\s+lòng\s+100%/i,
    /cam\s+kết\s+không\s+phát\s+sinh/i,
    /không\s+phát\s+sinh/i,
    /chi\s+phí\s+ẩn/i,
    /hoàn\s+tiền/i,
    /bồi\s+thường/i,
    /giảm\s+(?:giá\s+)?20%/i,
    /hơn\s+5\s+năm\s+đồng\s+hành/i,
    /hàng\s+ngàn\s+tổ\s+ấm/i,
    /tiêu\s+diệt\s+mạt\s+bụi/i,
    /không\s+hại\s+sức\s+khỏe/i
  ];

  for (const pat of forbiddenPatterns) {
    const match = html.match(pat);
    assert(!match, `Unverified claim token found matching ${pat} in ${relPath}: "${match ? match[0] : ''}"`);
  }

  auditedPages++;
}

// 2. Validate robots.txt
console.log('\nChecking dist/robots.txt:');
assert(fs.existsSync('dist/robots.txt'), 'dist/robots.txt missing');
const robotsTxt = fs.readFileSync('dist/robots.txt', 'utf8');
assert(robotsTxt.includes('Sitemap: https://vesinhtino.com/sitemap.xml'), 'robots.txt missing sitemap declaration');
assert(robotsTxt.includes('User-agent: *'), 'robots.txt missing User-agent declaration');
assert(robotsTxt.includes('Allow: /'), 'robots.txt missing Allow: / declaration');
console.log('  ✓ Selected robots.txt declarations found');

// 3. Validate sitemap.xml
console.log('\nChecking dist/sitemap.xml:');
assert(fs.existsSync('dist/sitemap.xml'), 'dist/sitemap.xml missing');
const sitemapXml = fs.readFileSync('dist/sitemap.xml', 'utf8').trim();
// Validate our static sitemap format, then cross-check every URL with the
// actual canonical/noindex information collected from the build above.
const root = sitemapXml.match(/^(?:<\?xml[^?]*\?>\s*)?<urlset\s+xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">([\s\S]*?)<\/urlset>$/);
assert(root, 'Unexpected or malformed static sitemap envelope');
const entries = [...root[1].matchAll(/<url>([\s\S]*?)<\/url>/g)];
assert.equal(root[1].replace(/<url>[\s\S]*?<\/url>/g, '').trim(), '', 'Unexpected content outside sitemap URL entries');
const sitemapUrls = new Set();
for (const [i, entry] of entries.entries()) {
  const locs = [...entry[1].matchAll(/<loc>([^<]+)<\/loc>/g)];
  assert.equal(locs.length, 1, `Sitemap entry ${i + 1} needs exactly one loc`);
  const residue = entry[1].replace(/<(loc|lastmod|changefreq|priority)>[^<]*<\/\1>/g, '').trim();
  assert.equal(residue, '', `Unexpected or malformed elements in sitemap entry ${i + 1}`);
  const loc = locs[0][1].trim();
  const url = new URL(loc);
  assert.equal(url.origin, 'https://vesinhtino.com', `Wrong sitemap origin: ${loc}`);
  assert(!url.search && !url.hash && !url.username && !url.password, `Unexpected sitemap URL fields: ${loc}`);
  assert(!sitemapUrls.has(loc), `Duplicate sitemap URL: ${loc}`);
  assert(indexablePages.has(loc), `Sitemap URL has no matching indexable canonical HTML: ${loc}`);
  sitemapUrls.add(loc);
}
assert.equal(sitemapUrls.size, indexablePages.size, 'Sitemap must cover exactly the indexable pages in this build');
for (const loc of indexablePages.keys()) assert(sitemapUrls.has(loc), `Indexable page missing from sitemap: ${loc}`);
console.log(`  ✓ ${sitemapUrls.size} unique sitemap URLs match indexable canonical HTML`);

console.log(`\n========================================`);
console.log(`CHECKS PASSED: ${auditedPages} HTML pages checked, ${jsonLdBlocksCount} JSON-LD blocks parsed and checked.`);
console.log('Selected canonical, robots, JSON-LD, price and sitemap checks passed.');
console.log('No configured claim patterns matched. This does not verify all business/health claims, Google indexing, rankings or rich-result eligibility.');
console.log(`========================================\n`);
