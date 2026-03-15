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

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ── Cart (localStorage) ──
  function getCart() {
    try { return JSON.parse(localStorage.getItem('dbs_cart') || '[]'); } catch(e) { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem('dbs_cart', JSON.stringify(cart));
  }
  function cartTotal(cart) {
    return cart.reduce(function(sum, item) { return sum + item.price * item.qty; }, 0);
  }
  function cartItemCount(cart) {
    return cart.reduce(function(sum, item) { return sum + item.qty; }, 0);
  }
  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function addToCart(name, price, image, url) {
    var cart = getCart();
    var id = slugify(name);
    var existing = cart.find(function(i) { return i.id === id; });
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ id: id, name: name, price: price, image: image, url: url, qty: 1 });
    }
    saveCart(cart);
    updateCartUI();
    openCartDrawer();
  }

  function removeFromCart(id) {
    var cart = getCart().filter(function(i) { return i.id !== id; });
    saveCart(cart);
    updateCartUI();
    renderCartDrawerItems();
  }

  function changeQty(id, delta) {
    var cart = getCart();
    var item = cart.find(function(i) { return i.id === id; });
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(function(i) { return i.id !== id; });
    saveCart(cart);
    updateCartUI();
    renderCartDrawerItems();
  }

  function updateCartUI() {
    var count = cartItemCount(getCart());
    document.querySelectorAll('.basket-count').forEach(function(el) {
      el.textContent = count;
    });
  }

  // ── Cart Drawer ──
  var basePath = window.location.pathname.includes('/products/') ? '../' : '';

  var drawerHTML = '<div id="cart-drawer">' +
    '<div class="cart-overlay"></div>' +
    '<div class="cart-panel">' +
      '<div class="cart-panel-header">' +
        '<h3>Your Basket <span class="cart-item-count"></span></h3>' +
        '<button class="cart-close" aria-label="Close basket">&times;</button>' +
      '</div>' +
      '<div class="cart-panel-body"></div>' +
      '<div class="cart-panel-footer">' +
        '<div class="cart-total-row"><span>Total</span><strong class="cart-total-price"></strong></div>' +
        '<a href="' + basePath + 'basket.html" class="btn btn-primary" style="display:block;text-align:center;margin-top:1rem;">View Basket &amp; Checkout</a>' +
        '<p style="font-size:0.78rem;color:#888;text-align:center;margin-top:0.75rem;">Free UK delivery over £100</p>' +
      '</div>' +
    '</div>' +
  '</div>';

  document.body.insertAdjacentHTML('beforeend', drawerHTML);

  var cartDrawer = document.getElementById('cart-drawer');

  function openCartDrawer() {
    renderCartDrawerItems();
    cartDrawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    cartDrawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartDrawer.querySelector('.cart-close').addEventListener('click', closeCartDrawer);
  cartDrawer.querySelector('.cart-overlay').addEventListener('click', closeCartDrawer);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && cartDrawer.classList.contains('open')) closeCartDrawer();
  });

  function renderCartDrawerItems() {
    var cart = getCart();
    var body = cartDrawer.querySelector('.cart-panel-body');
    var countEl = cartDrawer.querySelector('.cart-item-count');
    var totalEl = cartDrawer.querySelector('.cart-total-price');

    countEl.textContent = '(' + cartItemCount(cart) + ')';
    totalEl.textContent = '£' + cartTotal(cart).toFixed(2);

    if (cart.length === 0) {
      body.innerHTML = '<div class="cart-empty"><span>🛒</span><p>Your basket is empty</p><a href="' + basePath + 'shop.html" class="btn btn-outline" style="margin-top:1rem;">Continue Shopping</a></div>';
      return;
    }

    body.innerHTML = cart.map(function(item) {
      return '<div class="cart-item" data-id="' + item.id + '">' +
        '<img class="cart-item-img" src="' + item.image + '" alt="' + item.name + '" onerror="this.style.display=\'none\'">' +
        '<div class="cart-item-details">' +
          '<a class="cart-item-name" href="' + item.url + '">' + item.name + '</a>' +
          '<div class="cart-item-price">£' + (item.price * item.qty).toFixed(2) + '</div>' +
          '<div class="cart-item-controls">' +
            '<button class="cart-qty-btn" data-id="' + item.id + '" data-delta="-1">−</button>' +
            '<span class="cart-qty">' + item.qty + '</span>' +
            '<button class="cart-qty-btn" data-id="' + item.id + '" data-delta="1">+</button>' +
            '<button class="cart-remove" data-id="' + item.id + '">Remove</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    body.querySelectorAll('.cart-qty-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        changeQty(this.dataset.id, parseInt(this.dataset.delta));
      });
    });
    body.querySelectorAll('.cart-remove').forEach(function(btn) {
      btn.addEventListener('click', function() {
        removeFromCart(this.dataset.id);
      });
    });
  }

  // Open drawer when basket button clicked
  document.querySelectorAll('.basket-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      openCartDrawer();
    });
  });

  // ── Add to Basket buttons ──
  function getProductInfoFromBtn(btn) {
    // Product detail page
    var titleEl = document.querySelector('.product-title');
    if (titleEl) {
      var name = titleEl.textContent.trim();
      var priceEl = document.querySelector('.price-main');
      var price = priceEl ? parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')) : 0;
      var imgEl = document.querySelector('.main-image img');
      var image = imgEl ? imgEl.src : '';
      var url = window.location.href;
      return { name: name, price: price, image: image, url: url };
    }

    // Shop grid card
    var card = btn.closest('.product-card');
    if (card) {
      var name = (card.querySelector('.product-name') || {}).textContent || '';
      var price = parseFloat(card.getAttribute('data-price') || '0');
      var imgEl = card.querySelector('img');
      // Use full-size image rather than thumb
      var image = imgEl ? imgEl.src.replace('/thumbs/', '/') : '';
      var url = card.href || card.getAttribute('href') || window.location.href;
      // Make URL absolute
      if (url && !url.startsWith('http')) url = window.location.origin + '/' + url;
      return { name: name, price: price, image: image, url: url };
    }

    return null;
  }

  document.querySelectorAll('.btn-add, .btn-add-large').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var info = getProductInfoFromBtn(this);
      if (!info || !info.name) return;

      addToCart(info.name, info.price, info.image, info.url);

      var orig = this.textContent;
      this.textContent = '✓ Added!';
      this.style.background = '#2a9d4a';
      var self = this;
      setTimeout(function() {
        self.textContent = orig;
        self.style.background = '';
      }, 1200);
    });
  });

  // Initialise count from localStorage on every page load
  updateCartUI();

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

      faqQuestions.forEach(function (q) {
        q.classList.remove('open');
        if (q.nextElementSibling) q.nextElementSibling.classList.remove('open');
      });

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
      // Update main image
      var thumbImg = this.querySelector('img');
      var mainImg = document.querySelector('.main-image img');
      if (thumbImg && mainImg) mainImg.src = thumbImg.src;
    });
  });

  // ── Shop filters + pagination ──
  var productGrid = document.querySelector('.shop-main .products-grid');
  if (productGrid) {

    var allCards = Array.prototype.slice.call(productGrid.querySelectorAll('.product-card'));
    var countEl = document.querySelector('.shop-count strong');
    var paginationEl = document.getElementById('shop-pagination');
    var activeCat = 'all';
    var currentPage = 1;
    var perPage = 12;

    var perPageSelect = document.getElementById('per-page-select');
    if (perPageSelect) {
      perPageSelect.addEventListener('change', function() {
        perPage = parseInt(this.value);
        currentPage = 1;
        renderPage();
      });
    }

    function getFilteredCards() {
      var checkedBrands = Array.prototype.slice.call(
        document.querySelectorAll('.filter-option input[id^="b-"]:checked')
      ).map(function(cb) { return cb.id.replace('b-', ''); });

      var checkedLevels = Array.prototype.slice.call(
        document.querySelectorAll('.filter-option input[id^="sl-"]:checked')
      ).map(function(cb) { return cb.id.replace('sl-', ''); });

      var priceSlider = document.querySelector('.price-range input[type="range"]');
      var maxPrice = priceSlider ? parseInt(priceSlider.value) : 800;

      return allCards.filter(function(card) {
        var cat   = card.getAttribute('data-cat') || '';
        var brand = card.getAttribute('data-brand') || '';
        var price = parseInt(card.getAttribute('data-price') || '0');
        var level = card.getAttribute('data-level') || 'all';

        return (activeCat === 'all' || cat === activeCat) &&
               (checkedBrands.length === 0 || checkedBrands.indexOf(brand) !== -1) &&
               (checkedLevels.length === 0 || checkedLevels.indexOf(level) !== -1 || level === 'all') &&
               price <= maxPrice;
      });
    }

    function updateFilterCounts(filtered) {
      var brandCounts = {};
      filtered.forEach(function(card) {
        var b = card.getAttribute('data-brand') || '';
        if (b) brandCounts[b] = (brandCounts[b] || 0) + 1;
      });

      document.querySelectorAll('.filter-option input[id^="b-"]').forEach(function(cb) {
        var brand = cb.id.replace('b-', '');
        var count = brandCounts[brand] || 0;
        var row = cb.parentElement;
        var countSpan = row.querySelector('.filter-count');
        if (countSpan) countSpan.textContent = '(' + count + ')';
        // Hide rows with 0 results unless they are checked
        row.style.display = (count === 0 && !cb.checked) ? 'none' : '';
      });
    }

    function renderPage() {
      var filtered = getFilteredCards();
      updateFilterCounts(filtered);
      var totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
      if (currentPage > totalPages) currentPage = 1;

      var start = (currentPage - 1) * perPage;
      var end = start + perPage;

      allCards.forEach(function(card) { card.style.display = 'none'; });
      filtered.slice(start, end).forEach(function(card) { card.style.display = ''; });

      if (countEl) countEl.textContent = filtered.length;

      if (paginationEl) {
        paginationEl.innerHTML = '';
        if (totalPages <= 1) return;

        function makePageBtn(label, page, isActive) {
          var btn = document.createElement('button');
          btn.textContent = label;
          btn.style.cssText = 'padding:0.6rem 1rem;border-radius:4px;font-family:\'Barlow Condensed\',sans-serif;font-weight:700;cursor:pointer;border:1px solid #ddd;';
          if (isActive) {
            btn.style.background = '#E63946';
            btn.style.color = '#fff';
            btn.style.border = 'none';
          } else {
            btn.style.background = '#fff';
            btn.style.color = '#0A1628';
          }
          btn.addEventListener('click', function() {
            currentPage = page;
            renderPage();
            productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
          return btn;
        }

        if (currentPage > 1) paginationEl.appendChild(makePageBtn('← Prev', currentPage - 1, false));
        paginationEl.appendChild(makePageBtn(currentPage, currentPage, true));
        if (currentPage + 1 <= totalPages) paginationEl.appendChild(makePageBtn(currentPage + 1, currentPage + 1, false));
        if (currentPage < totalPages) paginationEl.appendChild(makePageBtn('Next →', currentPage + 1, false));
      }
    }

    function applyFilters() {
      currentPage = 1;
      renderPage();
    }

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

    document.querySelectorAll('.shop-sidebar input[type="checkbox"]').forEach(function(cb) {
      cb.addEventListener('change', applyFilters);
    });

    var priceSlider = document.querySelector('.price-range input[type="range"]');
    var maxPriceInput = document.querySelector('.price-inputs input:last-of-type');
    if (priceSlider) {
      priceSlider.addEventListener('input', function() {
        if (maxPriceInput) maxPriceInput.value = this.value;
        applyFilters();
      });
    }

    renderPage();
    if (maxPriceInput) {
      maxPriceInput.addEventListener('input', function() {
        if (priceSlider) priceSlider.value = this.value;
        applyFilters();
      });
    }
  }

  // ── Image zoom modal (product pages) ──
  var imgModal = document.getElementById('img-modal');
  if (imgModal) {
    var modalImg = imgModal.querySelector('.img-modal-img');

    var mainImage = document.querySelector('.main-image img');
    if (mainImage) {
      mainImage.addEventListener('click', function() {
        modalImg.src = this.src;
        modalImg.alt = this.alt;
        imgModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    }

    imgModal.addEventListener('click', function(e) {
      if (e.target === imgModal || e.target.classList.contains('img-modal-close')) {
        imgModal.classList.remove('open');
        document.body.style.overflow = '';
        modalImg.src = '';
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && imgModal.classList.contains('open')) {
        imgModal.classList.remove('open');
        document.body.style.overflow = '';
        modalImg.src = '';
      }
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

  // ── Basket page renderer ──
  var basketPage = document.getElementById('basket-page');
  if (basketPage) {
    function renderBasketPage() {
      var cart = getCart();
      var itemsEl = basketPage.querySelector('.basket-items');
      var summaryEl = basketPage.querySelector('.basket-summary-values');

      if (cart.length === 0) {
        itemsEl.innerHTML = '<div class="cart-empty" style="padding:3rem;text-align:center;"><span style="font-size:3rem;">🛒</span><p style="margin:1rem 0;font-size:1.1rem;color:#555;">Your basket is empty</p><a href="shop.html" class="btn btn-primary">Continue Shopping</a></div>';
        if (summaryEl) summaryEl.innerHTML = '<div class="basket-total-row"><span>Total</span><strong>£0.00</strong></div>';
        return;
      }

      itemsEl.innerHTML = cart.map(function(item) {
        return '<div class="basket-row" data-id="' + item.id + '">' +
          '<img class="basket-row-img" src="' + item.image + '" alt="' + item.name + '" onerror="this.style.display=\'none\'">' +
          '<div class="basket-row-info">' +
            '<a class="basket-row-name" href="' + item.url + '">' + item.name + '</a>' +
            '<div class="basket-row-unit">£' + item.price.toFixed(2) + ' each</div>' +
          '</div>' +
          '<div class="basket-row-qty">' +
            '<button class="cart-qty-btn" data-id="' + item.id + '" data-delta="-1">−</button>' +
            '<span>' + item.qty + '</span>' +
            '<button class="cart-qty-btn" data-id="' + item.id + '" data-delta="1">+</button>' +
          '</div>' +
          '<div class="basket-row-price">£' + (item.price * item.qty).toFixed(2) + '</div>' +
          '<button class="basket-row-remove cart-remove" data-id="' + item.id + '" aria-label="Remove">✕</button>' +
        '</div>';
      }).join('');

      var subtotal = cartTotal(cart);
      var shipping = subtotal >= 100 ? 0 : 7.99;
      var total = subtotal + shipping;

      if (summaryEl) {
        summaryEl.innerHTML =
          '<div class="basket-total-row"><span>Subtotal</span><span>£' + subtotal.toFixed(2) + '</span></div>' +
          '<div class="basket-total-row"><span>Shipping</span><span>' + (shipping === 0 ? 'FREE' : '£' + shipping.toFixed(2)) + '</span></div>' +
          '<div class="basket-total-row basket-grand-total"><span>Total</span><strong>£' + total.toFixed(2) + '</strong></div>';
      }

      itemsEl.querySelectorAll('.cart-qty-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          changeQty(this.dataset.id, parseInt(this.dataset.delta));
          renderBasketPage();
        });
      });
      itemsEl.querySelectorAll('.cart-remove').forEach(function(btn) {
        btn.addEventListener('click', function() {
          removeFromCart(this.dataset.id);
          renderBasketPage();
        });
      });
    }
    renderBasketPage();
  }

})();
