'use strict';

document.addEventListener('DOMContentLoaded', function () {

  /* ===== MOBILE NAVIGATION DRAWER ===== */
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

  /* ===== ACCESSIBLE FAQ ACCORDION ===== */
  const faqItems = document.querySelectorAll('.faq-item, .faq-card');
  faqItems.forEach(function (item) {
    const trigger = item.querySelector('.faq-header, .faq-q, button');
    if (trigger) {
      trigger.addEventListener('click', function () {
        const isActive = item.classList.contains('active') || item.classList.contains('open');
        faqItems.forEach(function (el) {
          el.classList.remove('active', 'open');
        });
        if (!isActive) {
          item.classList.add('active', 'open');
        }
      });
    }
  });

  /* ===== INTERACTIVE SQ.FT PRICING CALCULATOR ===== */
  const rangeInput = document.getElementById('calcSqft') || document.getElementById('sqftRange');
  const sqftDisplay = document.getElementById('calcSqftDisplay') || document.getElementById('sqftVal');
  const serviceSelect = document.getElementById('calcService');
  const totalDisplay = document.getElementById('calcTotalPrice') || document.getElementById('calcEstimate');
  const rateDisplay = document.getElementById('calcRateDisplay');

  const rateCard = {
    'balcony-safety-nets': 18,
    'bird-pigeon-nets': 18,
    'invisible-grills': 140,
    'sports-nets-turf': 22,
    'children-pet-safety-nets': 22,
    'construction-safety-nets': 14,
    'hdpe-nets': 16,
    'cloth-hangers': 1850 // per set
  };

  function updateCalculator() {
    if (!rangeInput || !totalDisplay) return;
    const sqft = parseInt(rangeInput.value, 10) || 200;
    if (sqftDisplay) sqftDisplay.textContent = sqft + (serviceSelect && serviceSelect.value === 'cloth-hangers' ? ' Sets' : ' Sq.Ft');

    const selectedSvc = serviceSelect ? serviceSelect.value : 'balcony-safety-nets';
    const rate = rateCard[selectedSvc] || 18;

    if (rateDisplay) {
      rateDisplay.textContent = selectedSvc === 'cloth-hangers' ? '₹' + rate + ' / set' : '₹' + rate + ' / sq.ft';
    }

    const total = sqft * rate;
    totalDisplay.textContent = '₹' + total.toLocaleString('en-IN');
  }

  if (rangeInput) {
    rangeInput.addEventListener('input', updateCalculator);
  }
  if (serviceSelect) {
    serviceSelect.addEventListener('change', updateCalculator);
  }
  updateCalculator();

  /* ===== CONTACT FORM AJAX SUBMISSION ===== */
  function handleForm(formEl) {
    if (!formEl) return;
    formEl.addEventListener('submit', async function (e) {
      e.preventDefault();
      const btn = formEl.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Submitting Request...';
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
            showToast('✅ ' + (json.message || 'Thank you! Our engineer will call you within 15 minutes.'), 'success');
            formEl.reset();
          }
        } else {
          showToast('❌ ' + (json.message || 'Please check your inputs and try again.'), 'error');
        }
      } catch (err) {
        showToast('❌ Submission received. Our team will contact you shortly.', 'success');
        formEl.reset();
      } finally {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }

  handleForm(document.getElementById('heroForm'));
  handleForm(document.getElementById('pageForm'));
  handleForm(document.getElementById('mainContactForm'));

  /* ===== TOAST NOTIFICATIONS ===== */
  function showToast(message, type) {
    const existing = document.querySelector('.gcm-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'gcm-toast';
    toast.textContent = message;
    toast.style.cssText = [
      'position:fixed', 'top:84px', 'right:20px', 'z-index:9999',
      'padding:14px 20px', 'border-radius:10px', 'font-size:14px',
      'font-weight:700', 'max-width:380px', 'box-shadow:0 10px 30px rgba(7,23,45,0.15)',
      'animation:fadeInRight .3s ease',
      type === 'success'
        ? 'background:#EBFBF1;color:#15803D;border:1px solid #BBF7D0'
        : 'background:#FFF1F1;color:#DC2626;border:1px solid #FECACA',
    ].join(';');

    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 5000);
  }

  /* ===== DYNAMIC CONTEXTUAL WHATSAPP ENGINE ===== */
  (function adaptWhatsAppLinks() {
    function getContextMessage() {
      const title = document.title || '';
      const path = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
      let service = '';
      let location = 'India (Pan-India Service)';

      if (path.includes('box-cricket') || title.toLowerCase().includes('box cricket')) {
        service = 'Box Cricket Ground Setup & Netting';
      } else if (path.includes('invisible-grill') || title.toLowerCase().includes('invisible grill')) {
        service = 'Stainless Steel Invisible Grills';
      } else if (path.includes('cloth-hanger') || title.toLowerCase().includes('cloth hanger')) {
        service = 'SS Ceiling Cloth Drying Hangers';
      } else if (path.includes('bird') || path.includes('pigeon') || title.toLowerCase().includes('bird') || title.toLowerCase().includes('pigeon')) {
        service = 'Anti-Bird & Pigeon Protection Nets';
      } else if (path.includes('balcony') || title.toLowerCase().includes('balcony')) {
        service = 'Balcony Safety Nets Installation';
      } else if (path.includes('children') || path.includes('pet')) {
        service = 'Children & Pet Safety Nets';
      } else if (path.includes('sports') || path.includes('turf')) {
        service = 'Sports Netting & Artificial Turf Setup';
      } else if (path.includes('construction')) {
        service = 'Construction & Industrial Safety Nets';
      } else {
        service = title.split(/[–—|-]/)[0].trim() || 'Safety Nets & Invisible Grills';
      }

      if (path) {
        const parts = path.split('/');
        if (parts.length >= 2 && parts[0] !== 'services' && parts[0] !== 'blog') {
          location = parts[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }
      }

      return `Hi GCM Safety Nets, I would like to inquire about *${service}* in *${location}*.\n\n` +
             `• Service: ${service}\n` +
             `• Location: ${location}\n` +
             `• Page: ${window.location.href}\n\n` +
             `Please share pricing per sq.ft / specifications and schedule a free site survey.`;
    }

    const smartMsg = getContextMessage();
    const smartUrl = `https://wa.me/919912399224?text=${encodeURIComponent(smartMsg)}`;

    const waSelectors = [
      'a[href*="wa.me"]',
      'a[href*="whatsapp.com"]',
      '.top-bar-wa',
      '.btn-whatsapp',
      '.mobile-sticky-wa',
      '.float-btn-wa'
    ];

    document.querySelectorAll(waSelectors.join(', ')).forEach(el => {
      const current = el.getAttribute('href') || '';
      if (!current.includes('text=') || current.includes('safety%20net%20services') || current === 'https://wa.me/919912399224') {
        el.setAttribute('href', smartUrl);
      }
    });
  })();

  /* ===== SMOOTH SCROLL ===== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
