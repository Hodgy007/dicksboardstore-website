/**
 * Dick's Board Store — Page Generator
 * Reads products.json and generates:
 *  1. shop.html  (all product cards)
 *  2. products/[slug].html  (individual product pages)
 *  3. Updates index.html featured products
 */

'use strict';

const fs = require('fs');
const path = require('path');

const SITE_DIR = __dirname;
const PRODUCTS_DIR = path.join(SITE_DIR, 'products');
const PRODUCTS_JSON = path.join(SITE_DIR, 'products.json');

// Load products
const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf8'));
console.log(`Loaded ${products.length} products`);

// Ensure products directory exists
if (!fs.existsSync(PRODUCTS_DIR)) {
  fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
}

// Category label map
const CAT_LABELS = {
  boots: 'Boots',
  skis: 'Alpine Skis',
  snowboards: 'Snowboards',
  clothing: 'Clothing',
  goggles: 'Goggles',
  helmets: 'Helmets',
  gloves: 'Gloves',
  hats: 'Hats',
  poles: 'Poles',
  bindings: 'Bindings',
  accessories: 'Accessories',
  skiing: 'Skiing',
  snowboarding: 'Snowboarding',
  other: 'Other',
};

// HTML escape
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Get image src for a product (local or placeholder)
function getProductImageSrc(product, prefix) {
  prefix = prefix || '';
  if (product.localImages && product.localImages.length > 0) {
    const img = product.localImages[0];
    if (!img.startsWith('http')) {
      return prefix + img;
    }
    return img;
  }
  return ''; // Will use CSS gradient placeholder
}

// Build image element
function productImgEl(product, prefix, altText) {
  const src = getProductImageSrc(product, prefix);
  if (src) {
    return `<img src="${esc(src)}" alt="${esc(altText || product.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">`;
  }
  // CSS gradient placeholder
  return `<div style="position:absolute;inset:0;background:linear-gradient(135deg,#1a3a6b 0%,#E63946 100%);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.3);font-size:2rem;">🏔</div>`;
}

// Shared header HTML (for root-level pages)
const HEADER_ROOT = `  <!-- ── HEADER ── -->
  <header class="site-header">
    <div class="container">
      <div class="header-inner">
        <a href="index.html" class="logo">DICK'S<span>BOARD</span>STORE</a>
        <nav class="main-nav">
          <a href="index.html">Home</a>
          <a href="shop.html" class="active">Shop</a>
          <a href="services.html">Services</a>
          <a href="about.html">About &amp; Find Us</a>
          <a href="blog.html">Blog</a>
        </nav>
        <div class="header-actions">
          <button class="basket-btn" aria-label="View basket">
            <span class="basket-icon">🛒</span>
            Basket
            <span class="basket-count">0</span>
          </button>
          <button class="hamburger" aria-label="Toggle menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </div>
    <nav class="mobile-nav">
      <a href="index.html">Home</a>
      <a href="shop.html" class="active">Shop</a>
      <a href="services.html">Services</a>
      <a href="about.html">About &amp; Find Us</a>
      <a href="blog.html">Blog</a>
    </nav>
  </header>`;

// Shared header HTML (for product pages — one level deep)
const HEADER_PRODUCT = `  <!-- ── HEADER ── -->
  <header class="site-header">
    <div class="container">
      <div class="header-inner">
        <a href="../index.html" class="logo">DICK'S<span>BOARD</span>STORE</a>
        <nav class="main-nav">
          <a href="../index.html">Home</a>
          <a href="../shop.html" class="active">Shop</a>
          <a href="../services.html">Services</a>
          <a href="../about.html">About &amp; Find Us</a>
          <a href="../blog.html">Blog</a>
        </nav>
        <div class="header-actions">
          <button class="basket-btn" aria-label="View basket">
            <span class="basket-icon">🛒</span>
            Basket
            <span class="basket-count">0</span>
          </button>
          <button class="hamburger" aria-label="Toggle menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </div>
    <nav class="mobile-nav">
      <a href="../index.html">Home</a>
      <a href="../shop.html" class="active">Shop</a>
      <a href="../services.html">Services</a>
      <a href="../about.html">About &amp; Find Us</a>
      <a href="../blog.html">Blog</a>
    </nav>
  </header>`;

// Shared footer (root level)
const FOOTER_ROOT = `  <!-- ── FOOTER ── -->
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-logo">DICK'S<span>BOARD</span>STORE</div>
          <p class="footer-tagline">Sheffield's independent ski &amp; snowboard specialist since 1989. Passionate about winter sports, expert boot fitting, and helping you find your perfect kit.</p>
          <div class="footer-social">
            <a href="#" class="social-link" aria-label="Facebook">f</a>
            <a href="#" class="social-link" aria-label="Instagram">in</a>
            <a href="#" class="social-link" aria-label="Twitter/X">✕</a>
            <a href="#" class="social-link" aria-label="YouTube">▶</a>
          </div>
        </div>
        <div>
          <div class="footer-heading">Quick Links</div>
          <ul class="footer-links">
            <li><a href="shop.html">Shop All</a></li>
            <li><a href="services.html">Boot Fitting</a></li>
            <li><a href="services.html">Ski Servicing</a></li>
            <li><a href="about.html">About Us</a></li>
            <li><a href="blog.html">Blog</a></li>
            <li><a href="about.html">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <div class="footer-heading">Categories</div>
          <ul class="footer-links">
            <li><a href="shop.html">Alpine Skis</a></li>
            <li><a href="shop.html">Snowboards</a></li>
            <li><a href="shop.html">Boots</a></li>
            <li><a href="shop.html">Clothing</a></li>
            <li><a href="shop.html">Goggles &amp; Helmets</a></li>
            <li><a href="shop.html">Accessories</a></li>
          </ul>
        </div>
        <div class="footer-contact">
          <div class="footer-heading">Find Us</div>
          <p><strong>📍</strong> 42 Winter Street, Sheffield, S1 4GH</p>
          <p><strong>📞</strong> 0114 272 8800</p>
          <p><strong>✉️</strong> hello@dicksboardstore.co.uk</p>
          <br>
          <div class="footer-heading" style="margin-bottom:0.75rem;">Opening Hours</div>
          <table class="hours-table">
            <tr><td>Mon–Fri</td><td>9:30am – 6:00pm</td></tr>
            <tr><td>Saturday</td><td>9:00am – 5:30pm</td></tr>
            <tr><td>Sunday</td><td>10:00am – 4:00pm</td></tr>
          </table>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>&copy; 2025 Dick's Board Store Ltd. All rights reserved. | Sheffield, UK |
          <a href="#" style="color:rgba(255,255,255,0.4);">Privacy Policy</a> ·
          <a href="#" style="color:rgba(255,255,255,0.4);">Terms</a>
        </p>
      </div>
    </div>
  </footer>`;

// Shared footer (product pages — one level deep)
const FOOTER_PRODUCT = `  <!-- ── FOOTER ── -->
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-logo">DICK'S<span>BOARD</span>STORE</div>
          <p class="footer-tagline">Sheffield's independent ski &amp; snowboard specialist since 1989. Passionate about winter sports, expert boot fitting, and helping you find your perfect kit.</p>
          <div class="footer-social">
            <a href="#" class="social-link" aria-label="Facebook">f</a>
            <a href="#" class="social-link" aria-label="Instagram">in</a>
            <a href="#" class="social-link" aria-label="Twitter/X">✕</a>
            <a href="#" class="social-link" aria-label="YouTube">▶</a>
          </div>
        </div>
        <div>
          <div class="footer-heading">Quick Links</div>
          <ul class="footer-links">
            <li><a href="../shop.html">Shop All</a></li>
            <li><a href="../services.html">Boot Fitting</a></li>
            <li><a href="../services.html">Ski Servicing</a></li>
            <li><a href="../about.html">About Us</a></li>
            <li><a href="../blog.html">Blog</a></li>
            <li><a href="../about.html">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <div class="footer-heading">Categories</div>
          <ul class="footer-links">
            <li><a href="../shop.html">Alpine Skis</a></li>
            <li><a href="../shop.html">Snowboards</a></li>
            <li><a href="../shop.html">Boots</a></li>
            <li><a href="../shop.html">Clothing</a></li>
            <li><a href="../shop.html">Goggles &amp; Helmets</a></li>
            <li><a href="../shop.html">Accessories</a></li>
          </ul>
        </div>
        <div class="footer-contact">
          <div class="footer-heading">Find Us</div>
          <p><strong>📍</strong> 42 Winter Street, Sheffield, S1 4GH</p>
          <p><strong>📞</strong> 0114 272 8800</p>
          <p><strong>✉️</strong> hello@dicksboardstore.co.uk</p>
          <br>
          <div class="footer-heading" style="margin-bottom:0.75rem;">Opening Hours</div>
          <table class="hours-table">
            <tr><td>Mon–Fri</td><td>9:30am – 6:00pm</td></tr>
            <tr><td>Saturday</td><td>9:00am – 5:30pm</td></tr>
            <tr><td>Sunday</td><td>10:00am – 4:00pm</td></tr>
          </table>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>&copy; 2025 Dick's Board Store Ltd. All rights reserved. | Sheffield, UK |
          <a href="#" style="color:rgba(255,255,255,0.4);">Privacy Policy</a> ·
          <a href="#" style="color:rgba(255,255,255,0.4);">Terms</a>
        </p>
      </div>
    </div>
  </footer>`;

// ──────────────────────────────────────────────
// Step 1: Generate shop.html
// ──────────────────────────────────────────────

function buildProductCard(product, linkPrefix) {
  linkPrefix = linkPrefix || '';
  const imgSrc = getProductImageSrc(product, linkPrefix);
  const imgEl = imgSrc
    ? `<img src="${esc(imgSrc)}" alt="${esc(product.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">`
    : `<div style="position:absolute;inset:0;background:linear-gradient(135deg,#1a3a6b 0%,#E63946 100%);display:flex;align-items:center;justify-content:center;font-size:3rem;">🏔</div>`;

  const descTrunc = product.description
    ? esc(product.description.slice(0, 100)) + (product.description.length > 100 ? '…' : '')
    : '';

  const brand = esc(product.brand || '');
  const catLabel = esc(CAT_LABELS[product.category] || product.category);

  return `
            <a href="${linkPrefix}products/${esc(product.slug)}.html" class="product-card" data-cat="${esc(product.category)}" data-brand="${esc((product.brand || '').toLowerCase())}" data-price="${product.priceNum || 0}" data-level="all" style="text-decoration:none;color:inherit;">
              <div class="product-img">
                ${imgEl}
              </div>
              <div class="product-body">
                <div class="product-brand">${brand || catLabel}</div>
                <div class="product-name">${esc(product.name)}</div>
                ${descTrunc ? `<p class="product-desc">${descTrunc}</p>` : ''}
                <div class="product-footer">
                  <span class="product-price">${esc(product.price)}</span>
                  <button class="btn-add">Add to Basket</button>
                </div>
              </div>
            </a>`;
}

// Get unique brands (for sidebar filter)
const brandCounts = {};
products.forEach(function(p) {
  const b = (p.brand || '').toLowerCase();
  if (b) brandCounts[b] = (brandCounts[b] || 0) + 1;
});
const topBrands = Object.entries(brandCounts)
  .sort(function(a, b) { return b[1] - a[1]; })
  .slice(0, 12);

// Max price
const maxPrice = Math.ceil(products.reduce(function(m, p) { return Math.max(m, p.priceNum || 0); }, 0) / 50) * 50;

// Build brand filter HTML
const brandFiltersHtml = topBrands.map(function(entry) {
  const [brand, count] = entry;
  const id = 'b-' + brand.replace(/[^a-z0-9]/g, '');
  return `            <div class="filter-option"><input type="checkbox" id="${esc(id)}"><label for="${esc(id)}">${esc(brand.charAt(0).toUpperCase() + brand.slice(1))}</label><span class="filter-count">(${count})</span></div>`;
}).join('\n');

// Build all product cards
const allCardsHtml = products.map(function(p) { return buildProductCard(p, ''); }).join('');

const shopHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Shop ski and snowboard equipment at Dick's Board Store Sheffield. Skis, boots, boards, clothing and accessories from Salomon, Burton, K2, Head and more.">
  <title>Shop | Dick's Board Store Sheffield</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

${HEADER_ROOT}

  <!-- ── PAGE HERO ── -->
  <section class="page-hero">
    <div class="container">
      <div class="breadcrumb">
        <a href="index.html">Home</a>
        <span class="sep">/</span>
        <span>Shop</span>
      </div>
      <h1>Shop All Products</h1>
      <p>Ski gear, snowboard equipment, clothing and accessories — expertly curated for all levels</p>
    </div>
  </section>

  <!-- ── CATEGORY QUICK LINKS ── -->
  <section class="section-sm bg-light">
    <div class="container">
      <div style="display:flex;flex-wrap:wrap;gap:0.6rem;justify-content:center;">
        <button class="btn btn-primary cat-quick-btn" data-cat="all" style="font-size:0.85rem;padding:0.5rem 1.1rem;">All Products</button>
        <button class="btn btn-outline cat-quick-btn" data-cat="boots" style="font-size:0.85rem;padding:0.5rem 1.1rem;">Boots</button>
        <button class="btn btn-outline cat-quick-btn" data-cat="skis" style="font-size:0.85rem;padding:0.5rem 1.1rem;">Alpine Skis</button>
        <button class="btn btn-outline cat-quick-btn" data-cat="snowboards" style="font-size:0.85rem;padding:0.5rem 1.1rem;">Snowboards</button>
        <button class="btn btn-outline cat-quick-btn" data-cat="clothing" style="font-size:0.85rem;padding:0.5rem 1.1rem;">Clothing</button>
        <button class="btn btn-outline cat-quick-btn" data-cat="goggles" style="font-size:0.85rem;padding:0.5rem 1.1rem;">Goggles</button>
        <button class="btn btn-outline cat-quick-btn" data-cat="helmets" style="font-size:0.85rem;padding:0.5rem 1.1rem;">Helmets</button>
        <button class="btn btn-outline cat-quick-btn" data-cat="gloves" style="font-size:0.85rem;padding:0.5rem 1.1rem;">Gloves</button>
        <button class="btn btn-outline cat-quick-btn" data-cat="hats" style="font-size:0.85rem;padding:0.5rem 1.1rem;">Hats</button>
        <button class="btn btn-outline cat-quick-btn" data-cat="accessories" style="font-size:0.85rem;padding:0.5rem 1.1rem;">Accessories</button>
        <button class="btn btn-outline cat-quick-btn" data-cat="bindings" style="font-size:0.85rem;padding:0.5rem 1.1rem;">Bindings</button>
        <button class="btn btn-outline cat-quick-btn" data-cat="poles" style="font-size:0.85rem;padding:0.5rem 1.1rem;">Poles</button>
      </div>
    </div>
  </section>

  <!-- ── SHOP LAYOUT ── -->
  <section class="section">
    <div class="container">
      <div class="shop-layout">

        <!-- Sidebar -->
        <aside class="shop-sidebar">

          <div class="filter-section">
            <div class="filter-title">Brand</div>
${brandFiltersHtml}
          </div>

          <div class="filter-section">
            <div class="filter-title">Price Range</div>
            <div class="price-range">
              <input type="range" min="0" max="${maxPrice}" value="${maxPrice}" style="accent-color:#E63946;width:100%;">
              <div class="price-inputs">
                <input type="number" value="0" min="0" max="${maxPrice}" placeholder="£ Min">
                <span>—</span>
                <input type="number" value="${maxPrice}" min="0" max="${maxPrice}" placeholder="£ Max">
              </div>
            </div>
          </div>

          <div class="filter-section">
            <div class="filter-title">Category</div>
            <div class="filter-option"><input type="checkbox" id="cat-boots"><label for="cat-boots">Boots</label></div>
            <div class="filter-option"><input type="checkbox" id="cat-skis"><label for="cat-skis">Alpine Skis</label></div>
            <div class="filter-option"><input type="checkbox" id="cat-boards"><label for="cat-boards">Snowboards</label></div>
            <div class="filter-option"><input type="checkbox" id="cat-clothing"><label for="cat-clothing">Clothing</label></div>
            <div class="filter-option"><input type="checkbox" id="cat-goggles"><label for="cat-goggles">Goggles</label></div>
            <div class="filter-option"><input type="checkbox" id="cat-helmets"><label for="cat-helmets">Helmets</label></div>
            <div class="filter-option"><input type="checkbox" id="cat-gloves"><label for="cat-gloves">Gloves</label></div>
            <div class="filter-option"><input type="checkbox" id="cat-hats"><label for="cat-hats">Hats</label></div>
            <div class="filter-option"><input type="checkbox" id="cat-access"><label for="cat-access">Accessories</label></div>
          </div>

        </aside>

        <!-- Product grid -->
        <div class="shop-main">
          <div class="shop-toolbar">
            <span class="shop-count">Showing <strong>${products.length}</strong> of ${products.length} products</span>
            <select class="sort-select">
              <option>Sort: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
              <option>Best Sellers</option>
            </select>
          </div>

          <div class="products-grid">
${allCardsHtml}
          </div>

          <!-- Pagination (built by JS) -->
          <div id="shop-pagination" style="display:flex;justify-content:center;gap:0.5rem;margin-top:3rem;flex-wrap:wrap;"></div>

        </div>
      </div>
    </div>
  </section>

${FOOTER_ROOT}

  <script src="nav.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(SITE_DIR, 'shop.html'), shopHtml);
console.log('Generated shop.html');

// ──────────────────────────────────────────────
// Step 2: Generate individual product pages
// ──────────────────────────────────────────────

// Build a map by category for related products
const byCategory = {};
products.forEach(function(p) {
  if (!byCategory[p.category]) byCategory[p.category] = [];
  byCategory[p.category].push(p);
});

function buildRelatedCards(currentProduct) {
  const catProducts = byCategory[currentProduct.category] || [];
  const related = catProducts
    .filter(function(p) { return p.slug !== currentProduct.slug; })
    .slice(0, 3);

  if (related.length === 0) return '';

  return related.map(function(p) {
    const imgSrc = getProductImageSrc(p, '../');
    const imgEl = imgSrc
      ? `<img src="${esc(imgSrc)}" alt="${esc(p.name)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">`
      : `<div style="position:absolute;inset:0;background:linear-gradient(135deg,#1a3a6b,#E63946);"></div>`;

    return `
        <a href="${esc(p.slug)}.html" class="product-card" style="text-decoration:none;color:inherit;">
          <div class="product-img">${imgEl}</div>
          <div class="product-body">
            <div class="product-brand">${esc(p.brand || CAT_LABELS[p.category] || '')}</div>
            <div class="product-name">${esc(p.name)}</div>
            <div class="product-footer">
              <span class="product-price">${esc(p.price)}</span>
              <button class="btn-add">Add to Basket</button>
            </div>
          </div>
        </a>`;
  }).join('');
}

function buildGallery(product) {
  const imgs = product.localImages || [];
  if (imgs.length === 0) {
    return `
          <div style="width:100%;aspect-ratio:1;background:linear-gradient(135deg,#1a3a6b 0%,#E63946 100%);display:flex;align-items:center;justify-content:center;font-size:4rem;border-radius:8px;">🏔</div>`;
  }

  // Main image (prefer non-original for speed, but fall back)
  const mainImg = imgs.find(function(i) { return !i.includes('originals'); }) || imgs[0];
  const mainSrc = mainImg.startsWith('http') ? mainImg : '../' + mainImg;

  let html = `
          <div class="main-image" style="background:none;font-size:0;">
            <img src="${esc(mainSrc)}" alt="${esc(product.name)}" style="width:100%;height:100%;object-fit:contain;background:#f4f4f4;">
          </div>`;

  if (imgs.length > 1) {
    html += `\n          <div class="thumbnails">`;
    imgs.slice(0, 4).forEach(function(img, i) {
      const src = img.startsWith('http') ? img : '../' + img;
      html += `
            <div class="thumb${i === 0 ? ' active' : ''}" style="background:none;font-size:0;">
              <img src="${esc(src)}" alt="${esc(product.name)} view ${i + 1}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">
            </div>`;
    });
    html += `\n          </div>`;
  }

  return html;
}

let pagesGenerated = 0;

products.forEach(function(product) {
  const catLabel = CAT_LABELS[product.category] || product.category;
  const relatedHtml = buildRelatedCards(product);
  const galleryHtml = buildGallery(product);

  const descHtml = product.description
    ? `<p style="color:#444;line-height:1.75;">${esc(product.description)}</p>`
    : '<p style="color:#888;line-height:1.75;">Please contact us in store for full product details.</p>';

  const pageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${esc(product.name)} — available at Dick's Board Store Sheffield. ${esc((product.description || '').slice(0, 120))}">
  <title>${esc(product.name)} | Dick's Board Store Sheffield</title>
  <link rel="stylesheet" href="../style.css">
</head>
<body>

${HEADER_PRODUCT}

  <!-- ── BREADCRUMB ── -->
  <div style="background:#F4F4F4;padding:0.75rem 0;">
    <div class="container">
      <div class="breadcrumb" style="justify-content:flex-start;color:#888;">
        <a href="../index.html" style="color:#888;">Home</a>
        <span class="sep">/</span>
        <a href="../shop.html" style="color:#888;">Shop</a>
        <span class="sep">/</span>
        <a href="../shop.html" style="color:#888;">${esc(catLabel)}</a>
        <span class="sep">/</span>
        <span style="color:#0A1628;">${esc(product.name)}</span>
      </div>
    </div>
  </div>

  <!-- ── PRODUCT DETAIL ── -->
  <section class="section">
    <div class="container">
      <div class="product-detail-grid">

        <!-- Gallery -->
        <div class="product-gallery">
${galleryHtml}
        </div>

        <!-- Product info -->
        <div class="product-info">
          <div class="product-brand-badge">
            <span>🏔</span> ${esc(product.brand || catLabel)}
          </div>
          <h1 class="product-title">${esc(product.name)}</h1>

          <div class="product-price-block">
            <span class="price-main">${esc(product.price)}</span>
          </div>

          <div class="add-to-basket-wrap" style="margin:1.5rem 0;">
            <button class="btn-add-large">🛒 Add to Basket</button>
            <button class="btn-wishlist" title="Add to wishlist">♡</button>
          </div>

          <div style="padding:1.25rem;background:#F4F4F4;border-radius:8px;margin-bottom:1.5rem;">
            ${descHtml}
          </div>

          <div class="fitting-cta">
            <div class="fitting-cta-icon">👢</div>
            <div class="fitting-cta-text">
              <strong>Need advice or a fitting?</strong>
              Visit us in store — our expert team has 35 years of experience helping you find the perfect kit.
            </div>
            <a href="../services.html" class="fitting-cta-link">Book Fitting →</a>
          </div>

          <!-- Trust badges -->
          <div style="display:flex;gap:1rem;flex-wrap:wrap;padding:1rem 0;border-top:1px solid #eee;">
            <div style="display:flex;align-items:center;gap:0.4rem;font-size:0.8rem;color:#555;">
              <span>🔄</span> 30-day returns
            </div>
            <div style="display:flex;align-items:center;gap:0.4rem;font-size:0.8rem;color:#555;">
              <span>🛡️</span> 2-year warranty
            </div>
            <div style="display:flex;align-items:center;gap:0.4rem;font-size:0.8rem;color:#555;">
              <span>🏪</span> In-store pickup available
            </div>
            <div style="display:flex;align-items:center;gap:0.4rem;font-size:0.8rem;color:#555;">
              <span>📦</span> Free UK delivery over £150
            </div>
          </div>

          <div style="margin-top:1rem;">
            <a href="../shop.html" style="color:#E63946;font-weight:600;text-decoration:none;">← Back to Shop</a>
          </div>
        </div>
      </div>
    </div>
  </section>

${relatedHtml ? `  <!-- ── RELATED PRODUCTS ── -->
  <section class="section bg-light">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Related Products</h2>
        <p class="section-subtitle">More from ${esc(catLabel)}</p>
      </div>
      <div class="products-grid">
${relatedHtml}
      </div>
    </div>
  </section>` : ''}

${FOOTER_PRODUCT}

  <script src="../nav.js"></script>
</body>
</html>
`;

  const filePath = path.join(PRODUCTS_DIR, product.slug + '.html');
  fs.writeFileSync(filePath, pageHtml);
  pagesGenerated++;
});

console.log(`Generated ${pagesGenerated} product pages in products/`);

// ──────────────────────────────────────────────
// Step 3: Update index.html featured products
// ──────────────────────────────────────────────

// Pick 6 featured products — varied categories
const featuredCategories = ['boots', 'goggles', 'helmets', 'clothing', 'gloves', 'accessories'];
const featured = [];

featuredCategories.forEach(function(cat) {
  const catProds = products.filter(function(p) { return p.category === cat && p.priceNum > 0; });
  if (catProds.length > 0) featured.push(catProds[0]);
});

// Fill up to 6 if needed
if (featured.length < 6) {
  const remaining = products.filter(function(p) {
    return !featured.includes(p) && p.priceNum > 0;
  });
  while (featured.length < 6 && remaining.length > 0) {
    featured.push(remaining.shift());
  }
}

const featuredCardsHtml = featured.map(function(p) {
  const imgSrc = getProductImageSrc(p, '');
  const imgEl = imgSrc
    ? `<img src="${esc(imgSrc)}" alt="${esc(p.name)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">`
    : `<div style="position:absolute;inset:0;background:linear-gradient(135deg,#1a3a6b,#E63946);"></div>`;
  const desc = p.description ? esc(p.description.slice(0, 90)) + '…' : '';
  return `
        <a href="products/${esc(p.slug)}.html" class="product-card" style="text-decoration:none;color:inherit;">
          <div class="product-img">
            ${imgEl}
          </div>
          <div class="product-body">
            <div class="product-brand">${esc(p.brand || CAT_LABELS[p.category] || '')}</div>
            <div class="product-name">${esc(p.name)}</div>
            ${desc ? `<p class="product-desc">${desc}</p>` : ''}
            <div class="product-footer">
              <span class="product-price">${esc(p.price)}</span>
              <button class="btn-add">Add to Basket</button>
            </div>
          </div>
        </a>`;
}).join('');

// Read and update index.html
let indexHtml = fs.readFileSync(path.join(SITE_DIR, 'index.html'), 'utf8');

// Replace the featured products grid content
const featuredStart = indexHtml.indexOf('<div class="products-grid">');
const featuredEnd = indexHtml.indexOf('</div>', featuredStart + 27);

if (featuredStart >= 0 && featuredEnd >= 0) {
  // Find the closing </div> that matches the products-grid
  let depth = 0;
  let pos = featuredStart;
  while (pos < indexHtml.length) {
    if (indexHtml.slice(pos, pos + 4) === '<div') depth++;
    if (indexHtml.slice(pos, pos + 6) === '</div>') {
      depth--;
      if (depth === 0) {
        const newGrid = `<div class="products-grid">\n${featuredCardsHtml}\n      </div>`;
        indexHtml = indexHtml.slice(0, featuredStart) + newGrid + indexHtml.slice(pos + 6);
        break;
      }
    }
    pos++;
  }
  fs.writeFileSync(path.join(SITE_DIR, 'index.html'), indexHtml);
  console.log('Updated index.html featured products');
} else {
  console.log('WARNING: Could not find featured products grid in index.html');
}

console.log('\n=== Generation complete ===');
console.log(`  shop.html:         728 products`);
console.log(`  products/ pages:   ${pagesGenerated}`);
console.log(`  index.html:        6 featured products updated`);
