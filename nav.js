/* ============================================================
   DICK'S BOARD STORE — Shared Navigation JS
   ============================================================ */

(function () {
  'use strict';

  // ── Mobile hamburger toggle ──
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      this.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    // Close on nav link click
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ── Basket count (mock) ──
  let basketCount = 0;
  const basketBtns = document.querySelectorAll('.basket-btn');
  const addBtns = document.querySelectorAll('.btn-add, .btn-add-large');

  addBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      basketCount++;
      basketBtns.forEach(function (bb) {
        const counter = bb.querySelector('.basket-count');
        if (counter) counter.textContent = basketCount;
      });
      const orig = btn.textContent;
      btn.textContent = 'Added!';
      btn.style.background = '#2a9d4a';
      setTimeout(function () {
        btn.textContent = orig;
        btn.style.background = '';
      }, 1200);
    });
  });

  // ── Tab panels (product page) ──
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabBtns.forEach(function (b) { b.classList.remove('active'); });
      tabPanels.forEach(function (p) { p.classList.remove('active'); });
      this.classList.add('active');
      const target = document.getElementById(this.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // ── FAQ Accordion ──
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const answer = this.nextElementSibling;
      const isOpen = this.classList.contains('open');

      // Close all
      faqQuestions.forEach(function (q) {
        q.classList.remove('open');
        if (q.nextElementSibling) q.nextElementSibling.classList.remove('open');
      });

      // Toggle clicked
      if (!isOpen) {
        this.classList.add('open');
        answer.classList.add('open');
      }
    });
  });

  // ── Size buttons ──
  const sizeBtns = document.querySelectorAll('.size-btn:not(.out)');
  sizeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      sizeBtns.forEach(function (b) { b.classList.remove('selected'); });
      this.classList.add('selected');
    });
  });

  // ── Email signup ──
  const emailForm = document.querySelector('.email-form');
  if (emailForm) {
    emailForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = this.querySelector('input');
      if (input && input.value) {
        const btn = this.querySelector('button');
        btn.textContent = 'Subscribed!';
        btn.style.background = '#2a9d4a';
        input.value = '';
        setTimeout(function () {
          btn.textContent = 'Subscribe';
          btn.style.background = '';
        }, 3000);
      }
    });
  }

  // ── Contact / booking forms ──
  document.querySelectorAll('.contact-form, .booking-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = 'Message Sent!';
        btn.style.background = '#2a9d4a';
        form.reset();
        setTimeout(function () {
          btn.textContent = orig;
          btn.style.background = '';
        }, 3000);
      }
    });
  });

  // ── Thumbnail gallery (product page) ──
  const thumbs = document.querySelectorAll('.thumb');
  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      thumbs.forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  // ── Shop filters ──
  var allCards = document.querySelectorAll('.products-grid .product-card');
  var countEl = document.querySelector('.shop-count strong');

  function updateCount(visible) {
    if (countEl) countEl.textContent = visible;
  }

  function applyFilters() {
    // Get active category
    var activeCat = 'all';
    document.querySelectorAll('.cat-quick-btn').forEach(function(b) {
      if (b.classList.contains('btn-primary')) activeCat = b.dataset.cat;
    });

    // Get checked brands
    var checkedBrands = [];
    document.querySelectorAll('.filter-option input[id^="b-"]:checked').forEach(function(cb) {
      checkedBrands.push(cb.id.replace('b-', ''));
    });

    // Get checked skill levels
    var checkedLevels = [];
    document.querySelectorAll('.filter-option input[id^="sl-"]:checked').forEach(function(cb) {
      checkedLevels.push(cb.id.replace('sl-', ''));
    });

    // Get price range
    var maxPrice = 800;
    var priceRange = document.querySelector('.price-range input[type="range"]');
    var maxInput = document.querySelector('.price-inputs input:last-of-type');
    if (priceRange) maxPrice = parseInt(priceRange.value);
    if (maxInput && maxInput.value) maxPrice = parseInt(maxInput.value);

    var visible = 0;
    allCards.forEach(function(card) {
      var cat = card.dataset.cat || '';
      var brand = card.dataset.brand || '';
      var price = parseInt(card.dataset.price || 0);
      var level = card.dataset.level || 'all';

      var catMatch = activeCat === 'all' || cat === activeCat;
      var brandMatch = checkedBrands.length === 0 || checkedBrands.indexOf(brand) !== -1;
      var levelMatch = checkedLevels.length === 0 || checkedLevels.indexOf(level) !== -1 || level === 'all';
      var priceMatch = price <= maxPrice;

      if (catMatch && brandMatch && levelMatch && priceMatch) {
        card.style.display = '';
        visible++;
      } else {
        card.style.display = 'none';
      }
    });
    updateCount(visible);
  }

  // Category quick buttons
  document.querySelectorAll('.cat-quick-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.cat-quick-btn').forEach(function(b) {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline');
      });
      this.classList.remove('btn-outline');
      this.classList.add('btn-primary');
      applyFilters();
    });
  });

  // Apply filters button
  var applyBtn = document.querySelector('.shop-sidebar .btn-primary');
  if (applyBtn) {
    applyBtn.addEventListener('click', applyFilters);
  }

  // Live price range slider
  var priceSlider = document.querySelector('.price-range input[type="range"]');
  var maxPriceInput = document.querySelector('.price-inputs input:last-of-type');
  if (priceSlider) {
    priceSlider.addEventListener('input', function() {
      if (maxPriceInput) maxPriceInput.value = this.value;
      applyFilters();
    });
  }
  if (maxPriceInput) {
    maxPriceInput.addEventListener('input', function() {
      if (priceSlider) priceSlider.value = this.value;
      applyFilters();
    });
  }

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
