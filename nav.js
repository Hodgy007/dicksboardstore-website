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
  var productGrid = document.querySelector('.shop-main .products-grid');
  if (productGrid) {

    var allCards = Array.prototype.slice.call(productGrid.querySelectorAll('.product-card'));
    var countEl = document.querySelector('.shop-count strong');
    var activeCat = 'all';

    function updateCount(n) {
      if (countEl) countEl.textContent = n;
    }

    function applyFilters() {
      var checkedBrands = Array.prototype.slice.call(
        document.querySelectorAll('.filter-option input[id^="b-"]:checked')
      ).map(function(cb) { return cb.id.replace('b-', ''); });

      var checkedLevels = Array.prototype.slice.call(
        document.querySelectorAll('.filter-option input[id^="sl-"]:checked')
      ).map(function(cb) { return cb.id.replace('sl-', ''); });

      var priceSlider = document.querySelector('.price-range input[type="range"]');
      var maxPrice = priceSlider ? parseInt(priceSlider.value) : 800;

      var visible = 0;
      allCards.forEach(function(card) {
        var cat   = card.getAttribute('data-cat') || '';
        var brand = card.getAttribute('data-brand') || '';
        var price = parseInt(card.getAttribute('data-price') || '0');
        var level = card.getAttribute('data-level') || 'all';

        var show = (activeCat === 'all' || cat === activeCat) &&
                   (checkedBrands.length === 0 || checkedBrands.indexOf(brand) !== -1) &&
                   (checkedLevels.length === 0 || checkedLevels.indexOf(level) !== -1 || level === 'all') &&
                   price <= maxPrice;

        card.style.display = show ? '' : 'none';
        if (show) visible++;
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
        activeCat = this.getAttribute('data-cat');
        applyFilters();
      });
    });

    // Checkboxes filter on change
    document.querySelectorAll('.shop-sidebar input[type="checkbox"]').forEach(function(cb) {
      cb.addEventListener('change', applyFilters);
    });

    // Live price slider
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
