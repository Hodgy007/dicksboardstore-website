# Dick's Board Store — Website

Live site: https://hodgy007.github.io/dicksboardstore-website/

---

## How the site was built

This is a fully static HTML/CSS/JS website built as a high-converting replica and redesign of [dicksboardstore.co.uk](https://www.dicksboardstore.co.uk). No frameworks or build tools — just plain files served via GitHub Pages.

### Pages

| File | Description |
|---|---|
| `index.html` | Homepage — hero, trust bar, featured products, blog preview, email signup |
| `shop.html` | Full product catalogue with filters, sorting, and pagination |
| `product.html` | Template product detail page with image gallery, size selector, tabs |
| `about.html` | About the store — staff, values, location |
| `services.html` | Board tuning / servicing page |
| `blog.html` | Blog/articles page |
| `products/` | 728 individual product pages (auto-generated) |

### Styles & Scripts

- `style.css` — single shared stylesheet, mobile-first responsive design
- `nav.js` — single shared JS file: hamburger menu, basket counter, shop filters, pagination, FAQ accordion, tab panels, forms

### Product data

- `scrape-products.js` — Node.js script that crawled [dicksboardstore.co.uk](https://www.dicksboardstore.co.uk) and extracted 728 products (name, price, brand, category, images, description, URL)
- `products.json` — scraped product data (excluded from git via `.gitignore`)
- `generate-pages.js` — reads `products.json` and generates individual HTML product pages under `products/`
- `scrape-images.js` — crawled the live site and downloaded ~2,384 images into `images/`

### How to regenerate product pages

```bash
node scrape-products.js     # re-scrape live site → products.json
node generate-pages.js      # build products/ from products.json
```

### Local development

```bash
npx serve .
# open http://localhost:3000
```

### Deployment

Pushed to `main` branch → GitHub Actions auto-deploys to GitHub Pages.

---

## What is missing to go live as a real e-commerce store

The site is currently a **display-only catalogue** — users cannot actually purchase anything. Below is everything needed to take it live.

### 1. Payment processing (high priority)

The basket and "Add to basket" buttons are purely cosmetic (in-memory JS counter only). To accept real payments you need:

- **Stripe** or **PayPal** integration (or both)
- A checkout flow: basket page → address entry → card details → order confirmation
- Stripe Checkout is the fastest path — redirect users to a hosted Stripe page, no PCI compliance burden
- Estimated effort: **1–2 weeks** to build a working checkout with Stripe

### 2. Backend / server

Static files cannot process orders, store customer data, or talk to payment APIs securely. You need either:

- **A serverless backend** (e.g. Vercel/Netlify Functions, AWS Lambda) to handle Stripe webhooks and order creation — lowest cost, easiest to host
- **Or a full backend** (Node.js/Express, Python/Django, etc.) on a VPS or cloud host

### 3. Order management

- Database to store orders (Postgres, MySQL, or a simple hosted option like Supabase/PlanetScale)
- Admin panel to view orders, mark as dispatched, print packing slips
- Email confirmations to customers on order placed and dispatched (e.g. via SendGrid or Resend)

### 4. Inventory / stock management

- Product stock levels are not tracked — the site will happily let someone "buy" an out-of-stock item
- Need to either sync with an existing stock system or build a lightweight one
- Out-of-stock items should show as unavailable and block purchase

### 5. User accounts (optional but recommended)

- Customer login / register
- Order history
- Saved addresses
- Wishlist

### 6. Real product images

- Current images are scraped from the live site and may be low-res or incorrectly attributed
- Replace with properly licensed, high-quality product images before going live

### 7. Sizing / variant selection

- The size buttons are cosmetic — selecting a size does nothing
- Need to tie size/variant selection to specific SKUs and stock levels before checkout

### 8. Shipping rates

- No shipping calculation — a checkout flow needs to compute shipping cost based on destination and basket weight/value
- Integrate with Royal Mail, DPD, or a shipping calculator API

### 9. Legal pages

- Privacy Policy
- Terms & Conditions
- Cookie consent banner (required for UK/EU)
- Returns policy page

### 10. Domain & SSL

- Point a custom domain (e.g. `dicksboardstore.co.uk`) to the hosting
- GitHub Pages supports custom domains with free SSL via Let's Encrypt
- If moving to a backend host, set up SSL there instead

### 11. SEO & analytics

- Add Google Analytics or Plausible
- Submit sitemap to Google Search Console
- Add structured data (JSON-LD) for products so they appear in Google Shopping

---

## Fastest path to a working store

If the goal is to get selling as quickly as possible with minimal development:

1. **Use Shopify** — migrate products via CSV import, use a custom theme to match the current design. No backend to build, payments/inventory/shipping all handled. ~£30/month.
2. **Or Stripe + Netlify Functions** — keep the static site, add a Stripe Checkout redirect on "Buy Now", use a Netlify Function to create the Stripe session. Can be live in a few days for simple single-item purchases.
