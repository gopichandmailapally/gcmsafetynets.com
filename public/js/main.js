'use strict';

document.addEventListener('DOMContentLoaded', function () {

  /* ===== MOBILE MENU ===== */
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.getElementById('mobileMenu');
  const headerEl = document.querySelector('.header');

  function setMenuTop() {
    if (!headerEl || !mobileMenu) return;
    const bottom = Math.round(headerEl.getBoundingClientRect().bottom);
    mobileMenu.style.top = bottom + 'px';
    mobileMenu.style.height = 'calc(100dvh - ' + bottom + 'px)';
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', isOpen);
      mobileMenu.setAttribute('aria-hidden', !isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      if (isOpen) setMenuTop();
    });
    window.addEventListener('scroll', function () {
      if (mobileMenu.classList.contains('open')) setMenuTop();
    }, { passive: true });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ===== FAQ ACCORDION ===== */
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      const item = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (el) { el.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ===== CONTACT FORM AJAX ===== */
  function handleForm(formEl) {
    if (!formEl) return;
    formEl.addEventListener('submit', async function (e) {
      e.preventDefault();
      const btn = formEl.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      const data = Object.fromEntries(new FormData(formEl).entries());

      try {
        const res = await fetch('/contact/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json();

        if (json.success) {
          const successEl = document.getElementById('formSuccess') || document.getElementById('heroFormSuccess');
          if (successEl) {
            formEl.style.display = 'none';
            successEl.style.display = 'block';
          } else {
            showToast('✅ ' + json.message, 'success');
            formEl.reset();
          }
        } else {
          showToast('❌ ' + json.message, 'error');
        }
      } catch (err) {
        showToast('❌ Something went wrong. Please call 9912399224.', 'error');
      } finally {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }

  handleForm(document.getElementById('heroForm'));
  handleForm(document.getElementById('pageForm'));
  handleForm(document.getElementById('mainContactForm'));

  /* ===== TOAST NOTIFICATION ===== */
  function showToast(message, type) {
    const existing = document.querySelector('.gcm-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'gcm-toast';
    toast.textContent = message;
    toast.style.cssText = [
      'position:fixed', 'top:80px', 'right:20px', 'z-index:9999',
      'padding:14px 20px', 'border-radius:8px', 'font-size:14px',
      'font-weight:600', 'max-width:360px', 'box-shadow:0 4px 16px rgba(0,0,0,.15)',
      'animation:fadeInRight .3s ease',
      type === 'success'
        ? 'background:#dcfce7;color:#15803d;border:1px solid #bbf7d0'
        : 'background:#fee2e2;color:#dc2626;border:1px solid #fecaca',
    ].join(';');

    const style = document.createElement('style');
    style.textContent = '@keyframes fadeInRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}';
    document.head.appendChild(style);

    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 5000);
  }

  /* ===== LAZY LOAD IMAGES ===== */
  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    document.querySelectorAll('img[data-src]').forEach(function (img) {
      imgObserver.observe(img);
    });
  }

  /* ===== STICKY HEADER SHADOW ===== */
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.style.boxShadow = window.scrollY > 10
        ? '0 2px 12px rgba(0,0,0,.12)'
        : '0 1px 4px rgba(0,0,0,.08)';
    }, { passive: true });
  }

  /* ===== SMOOTH SCROLL for anchor links ===== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ===== PHONE NUMBER CLICK TRACKING ===== */
  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'phone_call', { event_category: 'contact', event_label: a.href });
      }
    });
  });

  /* ===== WHATSAPP CLICK TRACKING ===== */
  document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'whatsapp_click', { event_category: 'contact', event_label: 'whatsapp' });
      }
    });
  });


  /* ===== DYNAMIC CONTEXTUAL WHATSAPP LINK ADAPTER ===== */
  (function adaptWhatsAppLinks() {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    let serviceName = '';
    let cityName = '';

    if (path) {
      const parts = path.split('/');
      if (parts.length === 2 && parts[0] !== 'services' && parts[0] !== 'blog') {
        // e.g. /anti-bird-net/indore or /balcony-safety-nets/mumbai
        serviceName = parts[0].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        cityName = parts[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      } else if (parts[0] === 'services' && parts[1]) {
        serviceName = parts[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      }
    }

    let customMsg = 'Hi GCM Safety Nets, I need a safety net quote. Please share details and schedule a free survey.';
    if (serviceName && cityName) {
      customMsg = `Hi GCM Safety Nets, I am looking for ${serviceName} installation in ${cityName}. Please share details and schedule a free site survey.`;
    } else if (serviceName) {
      customMsg = `Hi GCM Safety Nets, I am looking for ${serviceName} installation. Please share details and schedule a free site survey.`;
    }

    const waUrl = `https://wa.me/919912399224?text=${encodeURIComponent(customMsg)}`;

    // Target the 3 main header and floating buttons
    const keyWaSelectors = [
      '.top-bar-wa',
      '.header .btn-whatsapp',
      '.float-btn-wa'
    ];

    keyWaSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.href = waUrl;
      });
    });
  })();

});
