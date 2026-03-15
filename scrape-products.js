/**
 * Dick's Board Store — Product Scraper
 * Uses only built-in Node.js modules: https, http, fs, path, url
 *
 * Site structure:
 *  - Category pages: https://www.dicksboardstore.co.uk/ski-boots
 *    Products listed as <li> items with relative href like "slug-name"
 *  - Product pages: https://www.dicksboardstore.co.uk/slug-name
 *    Has H1, .description, .price, images at /data/product_images/
 */

'use strict';

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const urlModule = require('url');

const BASE_URL = 'https://www.dicksboardstore.co.uk';
const OUTPUT_FILE = path.join(__dirname, 'products.json');
const IMAGES_DIR = path.join(__dirname, 'images');
const DELAY_MS = 150;

const CATEGORY_PAGES = [
  { url: 'https://www.dicksboardstore.co.uk/ski-boots',          cat: 'boots',      label: 'Ski Boots' },
  { url: 'https://www.dicksboardstore.co.uk/skis',               cat: 'skis',       label: 'Alpine Skis' },
  { url: 'https://www.dicksboardstore.co.uk/ski-goggles',        cat: 'goggles',    label: 'Ski Goggles' },
  { url: 'https://www.dicksboardstore.co.uk/ski-poles',          cat: 'poles',      label: 'Ski Poles' },
  { url: 'https://www.dicksboardstore.co.uk/ski-helmets',        cat: 'helmets',    label: 'Ski Helmets' },
  { url: 'https://www.dicksboardstore.co.uk/snowboards',         cat: 'snowboards', label: 'Snowboards' },
  { url: 'https://www.dicksboardstore.co.uk/snowboard-boots',    cat: 'boots',      label: 'Snowboard Boots' },
  { url: 'https://www.dicksboardstore.co.uk/snowboard-bindings', cat: 'bindings',   label: 'Snowboard Bindings' },
  { url: 'https://www.dicksboardstore.co.uk/snowboard-goggles',  cat: 'goggles',    label: 'Snowboard Goggles' },
  { url: 'https://www.dicksboardstore.co.uk/snowboard-helmets',  cat: 'helmets',    label: 'Snowboard Helmets' },
  { url: 'https://www.dicksboardstore.co.uk/jackets',            cat: 'clothing',   label: 'Jackets' },
  { url: 'https://www.dicksboardstore.co.uk/pants',              cat: 'clothing',   label: 'Pants' },
  { url: 'https://www.dicksboardstore.co.uk/tops',               cat: 'clothing',   label: 'Tops' },
  { url: 'https://www.dicksboardstore.co.uk/goggles',            cat: 'goggles',    label: 'Goggles' },
  { url: 'https://www.dicksboardstore.co.uk/gloves',             cat: 'gloves',     label: 'Gloves' },
  { url: 'https://www.dicksboardstore.co.uk/hats',               cat: 'hats',       label: 'Hats' },
  { url: 'https://www.dicksboardstore.co.uk/footwear-and-accessories', cat: 'accessories', label: 'Accessories' },
  { url: 'https://www.dicksboardstore.co.uk/skiing',             cat: 'skiing',     label: 'Skiing' },
  { url: 'https://www.dicksboardstore.co.uk/snowboarding',       cat: 'snowboarding', label: 'Snowboarding' },
];

// Ensure images dir exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

function fetchUrl(urlStr, redirectCount) {
  redirectCount = redirectCount || 0;
  if (redirectCount > 5) return Promise.reject(new Error('Too many redirects: ' + urlStr));

  return new Promise(function(resolve, reject) {
    try {
      const parsed = new URL(urlStr);
      const lib = parsed.protocol === 'https:' ? https : http;

      const options = {
        hostname: parsed.hostname,
        path: parsed.pathname + (parsed.search || ''),
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-GB,en;q=0.9',
          'Accept-Encoding': 'identity',
          'Connection': 'keep-alive',
        },
        timeout: 20000,
      };

      const req = lib.request(options, function(res) {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let loc = res.headers.location;
          if (!loc.startsWith('http')) {
            loc = parsed.protocol + '//' + parsed.hostname + (loc.startsWith('/') ? '' : '/') + loc;
          }
          res.resume();
          resolve(fetchUrl(loc, redirectCount + 1));
          return;
        }
        const chunks = [];
        res.on('data', function(chunk) { chunks.push(chunk); });
        res.on('end', function() {
          resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8'), url: urlStr });
        });
      });

      req.on('error', reject);
      req.on('timeout', function() { req.destroy(); reject(new Error('Timeout: ' + urlStr)); });
      req.end();
    } catch(e) {
      reject(e);
    }
  });
}

function downloadImage(imageUrl, destPath) {
  if (fs.existsSync(destPath)) {
    return Promise.resolve(true);
  }

  return new Promise(function(resolve, reject) {
    try {
      const parsed = new URL(imageUrl);
      const lib = parsed.protocol === 'https:' ? https : http;

      const options = {
        hostname: parsed.hostname,
        path: parsed.pathname + (parsed.search || ''),
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 Chrome/120',
          'Referer': BASE_URL,
        },
        timeout: 30000,
      };

      const req = lib.request(options, function(res) {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          let loc = res.headers.location;
          if (!loc.startsWith('http')) loc = BASE_URL + loc;
          resolve(downloadImage(loc, destPath));
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error('HTTP ' + res.statusCode));
          return;
        }
        const chunks = [];
        res.on('data', function(c) { chunks.push(c); });
        res.on('end', function() {
          try { fs.writeFileSync(destPath, Buffer.concat(chunks)); resolve(true); }
          catch(e) { reject(e); }
        });
      });

      req.on('error', reject);
      req.on('timeout', function() { req.destroy(); reject(new Error('Image download timeout')); });
      req.end();
    } catch(e) {
      reject(e);
    }
  });
}

function slugify(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// Make a safe local filename from a path
function safeFilename(imgPath) {
  // Remove query strings and sanitize
  let name = imgPath.split('?')[0];
  // Replace directory separators and special chars
  name = name.replace(/^\//, '').replace(/\//g, '_').replace(/[^a-zA-Z0-9._\-]/g, '_');
  if (name.length > 150) name = name.slice(name.length - 150);
  return name;
}

// Extract product slugs from a category page
function extractProductSlugs(html) {
  const slugs = new Set();

  // The product list uses <li> items with <a href="slug"> pattern
  // Pattern: href="slug-name" class="image"  or  href="slug-name">\nProductName\n
  const re1 = /href="([a-z0-9][a-z0-9\-]+[a-z0-9])"\s*class="image"/g;
  let m;
  while ((m = re1.exec(html)) !== null) {
    const slug = m[1];
    // Filter out nav items (they're short category names)
    if (slug.length > 8 && !isNavSlug(slug)) {
      slugs.add(slug);
    }
  }

  // Also find slugs from the product list items more broadly
  // <li data-id="..."><div class="image-wrapper"><a href="slug"
  const re2 = /data-id="\d+"[\s\S]{1,200}?href="([a-z0-9][a-z0-9\-]+[a-z0-9])"/g;
  while ((m = re2.exec(html)) !== null) {
    const slug = m[1];
    if (slug.length > 8 && !isNavSlug(slug)) {
      slugs.add(slug);
    }
  }

  return Array.from(slugs);
}

const NAV_SLUGS = new Set([
  'skiing', 'ski-boots', 'ski-goggles', 'ski-poles', 'ski-helmets',
  'snowboarding', 'snowboards', 'snowboard-boots', 'snowboard-bindings',
  'snowboard-goggles', 'snowboard-helmets', 'clothing', 'jackets', 'pants',
  'tops', 'footwear-and-accessories', 'goggles', 'gloves', 'hats', 'checkout',
  'find-us', 'shipping', 'privacy', 'terms', 'voucher', 'body-armour',
  'underwear', 'footwear', 'sunglasses', 'helmets', 'luggage-and-bags',
  'sledges', 'bits-and-bobs', 'servicing-and-repairs', 'greeting-cards',
  'fish-eyes', 'leather-gloves', 'vast-change-robes', 'all-in-one', 'skirts',
]);

function isNavSlug(slug) {
  return NAV_SLUGS.has(slug);
}

// Extract brand from known brand list
const KNOWN_BRANDS = [
  'Salomon', 'Burton', 'K2', 'Head', 'Atomic', 'Rossignol',
  'POC', 'Oakley', 'Hestra', 'Scott', 'Icepeak', 'Luhta',
  'Capita', 'Lib Tech', 'Jones', 'Rome', 'DC', 'Vans',
  'ThirtyTwo', 'Nitro', 'Ride', 'GNU', 'Bataleon',
  'Arbor', 'Volcom', 'Quiksilver', 'Roxy',
  'Spyder', 'Phenix', 'Protest', 'Picture', 'Dakine',
  'Smith', 'Anon', 'Dragon', 'Uvex', 'Bollé', 'Julbo',
  'Marker', 'Tyrolia', 'Dynastar', 'Fischer', 'Nordica',
  'Tecnica', 'Lange', 'Dalbello', 'Scarpa', 'Dynafit',
  'Black Diamond', 'Mammut', 'Ortovox', 'Icebreaker',
  'Smartwool', 'Holden', 'Airblaster', 'Coal', 'Celtek',
  'Norrona', 'Peak Performance', 'Bogner', 'Colmar',
  'Descente', 'Haglofs', 'Kjus', 'Millet', 'Phenix',
  'Rehall', 'Trespass', 'Westbeach',
];

function extractBrand(name, html) {
  // Check brand image alt text
  const brandImgM = html.match(/class="brand"[^>]*alt="([^"]+)"/i) ||
                    html.match(/alt="([^"]+)"[^>]*class="brand"/i);
  if (brandImgM) return brandImgM[1].trim();

  // Check for brand in name
  for (const b of KNOWN_BRANDS) {
    if (name.toLowerCase().startsWith(b.toLowerCase() + ' ') ||
        name.toLowerCase().includes(' ' + b.toLowerCase() + ' ')) {
      return b;
    }
  }
  // First word often is brand
  const firstWord = name.split(' ')[0];
  if (firstWord.length > 1) return firstWord;

  return '';
}

// Parse a product page
function parseProductPage(html, slug, defaultCat) {
  const product = {
    url: BASE_URL + '/' + slug,
    slug: slug,
    name: '',
    price: 'POA',
    priceNum: 0,
    description: '',
    category: defaultCat || 'other',
    brand: '',
    images: [],
    localImages: [],
  };

  // Name from H1
  const h1M = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1M) {
    product.name = h1M[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Price: look for <strong class="price"> or similar
  const pricePatterns = [
    /<strong[^>]*class="price"[^>]*>[\s\S]*?&pound;\s*([\d,]+(?:\.\d{2})?)/i,
    /class="price"[^>]*>[\s\S]{0,100}?£\s*([\d,]+)/i,
    /&pound;\s*([\d,]+(?:\.\d{2})?)/,
    /£\s*([\d,]+(?:\.\d{2})?)/,
  ];
  for (const re of pricePatterns) {
    const m = html.match(re);
    if (m) {
      const num = parseFloat(m[1].replace(/,/g, ''));
      if (!isNaN(num) && num > 0) {
        product.priceNum = Math.round(num);
        product.price = '£' + product.priceNum;
        break;
      }
    }
  }

  // Description from .description div
  const descM = html.match(/class="description"[^>]*>([\s\S]*?)<\/div>/i);
  if (descM) {
    // Clean HTML
    let desc = descM[1].replace(/<a\s+href="[^"]*">/gi, '').replace(/<\/a>/gi, '');
    desc = desc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    product.description = desc.slice(0, 700);
  }

  // Brand
  product.brand = extractBrand(product.name, html);

  // Images: look for /data/product_images/ paths
  const imgRe = /src="(\/data\/product_images\/[^"]+)"/g;
  const imgs = new Set();
  let m;
  while ((m = imgRe.exec(html)) !== null) {
    const u = m[1].split('?')[0];
    if (!/placeholder|logo|icon/i.test(u)) imgs.add(u);
  }
  // Also check href for originals/larger images
  const imgHrefRe = /href="(\/data\/product_images\/originals\/[^"]+)"/g;
  while ((m = imgHrefRe.exec(html)) !== null) {
    const u = m[1].split('?')[0];
    imgs.add(u);
  }
  // Also find additional images from data-original
  const dataOrigRe = /data-original="(\/data\/product_images\/[^"]+)"/g;
  while ((m = dataOrigRe.exec(html)) !== null) {
    const u = m[1].split('?')[0];
    if (!/placeholder|logo|icon/i.test(u)) imgs.add(u);
  }

  product.images = Array.from(imgs).slice(0, 6).map(u => BASE_URL + u);

  // Generate clean slug from product name
  if (product.name) {
    product.slug = slugify(product.name);
    // If slug is too short or empty, keep original
    if (product.slug.length < 4) product.slug = slug;
  }

  return product;
}

async function scrapeAll() {
  console.log('=== Dick\'s Board Store Product Scraper ===\n');

  const visitedSlugs = new Set();
  const productQueue = []; // { slug, cat }
  const failedUrls = [];
  const products = [];
  const slugCount = {};

  // Step 1: Crawl category pages
  console.log('Step 1: Crawling category pages...\n');

  for (const catDef of CATEGORY_PAGES) {
    console.log(`  Crawling: ${catDef.url}`);
    let pageUrl = catDef.url;
    let pageNum = 0;
    const visitedPages = new Set();

    while (pageUrl && pageNum < 10) {
      pageNum++;
      if (visitedPages.has(pageUrl)) break;
      visitedPages.add(pageUrl);

      try {
        await sleep(DELAY_MS);
        const res = await fetchUrl(pageUrl);

        if (res.status !== 200) {
          console.log(`    HTTP ${res.status}`);
          break;
        }

        const slugs = extractProductSlugs(res.body);
        let newCount = 0;
        for (const slug of slugs) {
          if (!visitedSlugs.has(slug)) {
            visitedSlugs.add(slug);
            productQueue.push({ slug: slug, cat: catDef.cat });
            newCount++;
          }
        }
        console.log(`    Page ${pageNum}: ${slugs.length} products (+${newCount} new)`);

        // Check for next page
        // Pattern: href="?page=2" or href="ski-boots?page=2"
        const nextM = res.body.match(/href="([^"]*(?:\?|&)page=(\d+))"[^>]*>[^<]*(?:next|›|»|\d)/i) ||
                      res.body.match(/<a[^>]+class="[^"]*next[^"]*"[^>]+href="([^"]+)"/i);

        if (nextM) {
          let nextUrl = nextM[1];
          if (nextUrl.startsWith('/')) nextUrl = BASE_URL + nextUrl;
          else if (!nextUrl.startsWith('http')) nextUrl = catDef.url + (nextUrl.startsWith('?') ? '' : '/') + nextUrl;
          if (!visitedPages.has(nextUrl)) {
            pageUrl = nextUrl;
          } else {
            break;
          }
        } else {
          break;
        }
      } catch(err) {
        console.log(`    Error: ${err.message}`);
        break;
      }
    }
  }

  console.log(`\nTotal unique product slugs found: ${productQueue.length}\n`);

  // Step 2: Scrape product pages
  console.log('Step 2: Scraping product pages...\n');

  let scraped = 0;
  let skipped = 0;

  for (const item of productQueue) {
    const productUrl = BASE_URL + '/' + item.slug;

    try {
      await sleep(DELAY_MS);
      const res = await fetchUrl(productUrl);

      if (res.status !== 200) {
        skipped++;
        if (skipped <= 5) console.log(`  SKIP (${res.status}): ${item.slug}`);
        continue;
      }

      // Must have H1 to be a product page
      if (!/<h1/i.test(res.body)) {
        skipped++;
        continue;
      }

      const product = parseProductPage(res.body, item.slug, item.cat);

      if (!product.name || product.name.length < 3) {
        skipped++;
        continue;
      }

      // Deduplicate slugs
      let finalSlug = product.slug;
      if (slugCount[finalSlug]) {
        slugCount[finalSlug]++;
        finalSlug = finalSlug + '-' + slugCount[finalSlug];
      } else {
        slugCount[finalSlug] = 1;
      }
      product.slug = finalSlug;

      products.push(product);
      scraped++;

      if (scraped % 20 === 0) {
        process.stdout.write(`  ${scraped} products scraped...\n`);
      } else {
        process.stdout.write('.');
      }

    } catch(err) {
      failedUrls.push({ url: productUrl, error: err.message });
      if (failedUrls.length <= 5) console.log(`\n  Error: ${item.slug}: ${err.message}`);
    }
  }

  console.log(`\n\nScraped: ${scraped}, Skipped: ${skipped}, Errors: ${failedUrls.length}`);

  // Step 3: Download images
  console.log('\nStep 3: Downloading images...\n');

  let imgOk = 0;
  let imgFail = 0;

  for (const product of products) {
    const localImages = [];
    for (const imgUrl of product.images) {
      // Build local filename from the URL path
      const imgPath = imgUrl.replace(BASE_URL, '');
      const filename = safeFilename(imgPath);
      const destPath = path.join(IMAGES_DIR, filename);

      try {
        await sleep(50);
        await downloadImage(imgUrl, destPath);
        localImages.push('images/' + filename);
        imgOk++;
      } catch(err) {
        // Use full URL as fallback
        localImages.push(imgUrl);
        imgFail++;
      }
    }
    product.localImages = localImages;
  }

  console.log(`  Downloaded: ${imgOk}, Failed: ${imgFail}`);

  // Save
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2));
  console.log(`\nSaved ${products.length} products to products.json`);

  // Category breakdown
  const catCounts = {};
  products.forEach(function(p) {
    catCounts[p.category] = (catCounts[p.category] || 0) + 1;
  });
  console.log('\nCategory breakdown:');
  Object.entries(catCounts).sort((a,b) => b[1]-a[1]).forEach(([cat, n]) => {
    console.log(`  ${cat}: ${n}`);
  });

  if (failedUrls.length > 0) {
    console.log(`\nFailed (${failedUrls.length}):`);
    failedUrls.slice(0, 10).forEach(f => console.log(`  ${f.url}: ${f.error}`));
  }

  console.log('\n=== Done ===');
  return products;
}

scrapeAll().catch(function(err) {
  console.error('Fatal:', err);
  process.exit(1);
});
