#!/usr/bin/env node
/**
 * Image scraper for dicksboardstore.co.uk
 * Downloads all images from the site into ./images/
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const BASE_URL = 'https://www.dicksboardstore.co.uk';
const OUTPUT_DIR = path.join(__dirname, 'images');
const visited = new Set();
const imageUrls = new Set();

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function get(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,*/*'
      },
      timeout: 15000
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return get(new URL(res.headers.location, url).href).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data, contentType: res.headers['content-type'] || '' }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    const req = lib.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 20000
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(new URL(res.headers.location, url).href, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    req.on('error', err => { file.close(); if (fs.existsSync(dest)) fs.unlinkSync(dest); reject(err); });
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function extractLinks(html, base) {
  const links = [];
  // Internal page links
  const hrefRe = /href="([^"]+)"/g;
  let m;
  while ((m = hrefRe.exec(html)) !== null) {
    try {
      const u = new URL(m[1], base);
      if (u.hostname === new URL(base).hostname) links.push(u.href);
    } catch {}
  }
  return links;
}

function extractImages(html, base) {
  const imgs = [];
  // src attributes
  const srcRe = /src="([^"]+\.(jpg|jpeg|png|gif|webp|svg|avif)[^"]*)"/gi;
  let m;
  while ((m = srcRe.exec(html)) !== null) {
    try { imgs.push(new URL(m[1], base).href); } catch {}
  }
  // srcset
  const srcsetRe = /srcset="([^"]+)"/gi;
  while ((m = srcsetRe.exec(html)) !== null) {
    m[1].split(',').forEach(part => {
      const url = part.trim().split(/\s+/)[0];
      try { imgs.push(new URL(url, base).href); } catch {}
    });
  }
  // CSS background-image urls in style attributes
  const bgRe = /url\(['"]?([^'")\s]+\.(jpg|jpeg|png|gif|webp|svg|avif)[^'")\s]*)['"]?\)/gi;
  while ((m = bgRe.exec(html)) !== null) {
    try { imgs.push(new URL(m[1], base).href); } catch {}
  }
  return imgs;
}

function safeFilename(url) {
  const u = new URL(url);
  const ext = path.extname(u.pathname) || '.jpg';
  const name = u.pathname.replace(/\//g, '_').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
  return name || ('img_' + Date.now() + ext);
}

async function crawl(url, depth = 0) {
  if (depth > 3 || visited.has(url)) return;
  visited.add(url);

  try {
    const res = await get(url);
    if (!res.contentType.includes('text/html')) return;

    console.log(`[${visited.size}] Crawling: ${url}`);

    const imgs = extractImages(res.body, url);
    imgs.forEach(i => imageUrls.add(i));

    if (depth < 2) {
      const links = extractLinks(res.body, url);
      for (const link of links) {
        if (!visited.has(link)) await crawl(link, depth + 1);
      }
    }
  } catch (e) {
    console.log(`  Skipped ${url}: ${e.message}`);
  }
}

async function main() {
  console.log('=== Dick\'s Board Store Image Scraper ===\n');
  console.log('Phase 1: Crawling site...\n');

  await crawl(BASE_URL);

  console.log(`\nFound ${imageUrls.size} images across ${visited.size} pages`);
  console.log('\nPhase 2: Downloading images...\n');

  let downloaded = 0, skipped = 0, failed = 0;

  for (const imgUrl of imageUrls) {
    const filename = safeFilename(imgUrl);
    const dest = path.join(OUTPUT_DIR, filename);

    if (fs.existsSync(dest)) {
      skipped++;
      continue;
    }

    try {
      await downloadFile(imgUrl, dest);
      const size = fs.statSync(dest).size;
      if (size < 500) {
        fs.unlinkSync(dest); // skip tiny/broken images
        skipped++;
      } else {
        console.log(`  ✓ ${filename} (${Math.round(size/1024)}KB)`);
        downloaded++;
      }
    } catch (e) {
      console.log(`  ✗ ${filename}: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Skipped:    ${skipped}`);
  console.log(`Failed:     ${failed}`);
  console.log(`\nImages saved to: ${OUTPUT_DIR}`);
}

main().catch(console.error);
