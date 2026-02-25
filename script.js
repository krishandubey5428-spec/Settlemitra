const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });
}

const yearEls = document.querySelectorAll('[data-year]');
yearEls.forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

const defaultLeadConfig = {
  webhookUrl: '',
  whatsappNumber: '919000000000',
  businessEmail: 'support@settlemitra.com',
};

const leadConfig = {
  ...defaultLeadConfig,
  ...(window.SETTLEMITRA_CONFIG || {}),
};

const formatCurrency = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return 'Not provided';
  return `₹${number.toLocaleString('en-IN')}`;
};

const buildLeadObject = (formData) => ({
  sourcePage: window.location.pathname.split('/').pop() || 'index.html',
  submittedAt: new Date().toISOString(),
  name: (formData.get('name') || '').toString().trim(),
  phone: (formData.get('phone') || '').toString().trim(),
  email: (formData.get('email') || '').toString().trim(),
  city: (formData.get('city') || '').toString().trim(),
  debt: (formData.get('debt') || '').toString().trim(),
  message: (formData.get('message') || '').toString().trim(),
});

const buildLeadText = (lead) => {
  const lines = [
    'New Settlemitra Lead',
    `Name: ${lead.name || 'Not provided'}`,
    `Phone: ${lead.phone || 'Not provided'}`,
    `Email: ${lead.email || 'Not provided'}`,
    `City: ${lead.city || 'Not provided'}`,
    `Debt: ${formatCurrency(lead.debt)}`,
    `Message: ${lead.message || 'Not provided'}`,
    `Source: ${lead.sourcePage}`,
    `Submitted At: ${lead.submittedAt}`,
  ];
  return lines.join('\n');
};

const getWhatsAppLink = (lead) => {
  if (!leadConfig.whatsappNumber) return '';
  const text = encodeURIComponent(buildLeadText(lead));
  return `https://wa.me/${leadConfig.whatsappNumber}?text=${text}`;
};

const createFloatingWhatsAppButton = () => {
  if (!leadConfig.whatsappNumber) return;
  if (document.querySelector('[data-wa-float]')) return;

  const defaultText = encodeURIComponent('Hi Settlemitra, I need help with debt settlement.');
  const link = document.createElement('a');
  link.href = `https://wa.me/${leadConfig.whatsappNumber}?text=${defaultText}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.className = 'wa-float';
  link.setAttribute('aria-label', 'Chat on WhatsApp');
  link.setAttribute('data-wa-float', 'true');
  link.innerHTML = '<span class="wa-float-icon">💬</span><span>WhatsApp</span>';
  document.body.appendChild(link);
};

const getEmailLink = (lead) => {
  if (!leadConfig.businessEmail) return '';
  const subject = encodeURIComponent(`New Settlemitra Lead: ${lead.name || lead.phone || 'Inquiry'}`);
  const body = encodeURIComponent(buildLeadText(lead));
  return `mailto:${leadConfig.businessEmail}?subject=${subject}&body=${body}`;
};

const submitToWebhook = async (lead) => {
  if (!leadConfig.webhookUrl) return { sent: false, reason: 'not-configured' };

  try {
    const response = await fetch(leadConfig.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
    return { sent: response.ok, reason: response.ok ? 'success' : 'failed' };
  } catch (error) {
    return { sent: false, reason: 'error' };
  }
};

createFloatingWhatsAppButton();

const forms = document.querySelectorAll('[data-form]');
forms.forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const message = form.querySelector('.form-message');
    const formData = new FormData(form);
    const name = (formData.get('name') || '').toString().trim();
    const phone = (formData.get('phone') || '').toString().trim();

    if (name.length < 2) {
      if (message) message.textContent = 'Please enter a valid name.';
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      if (message) message.textContent = 'Please enter a valid 10-digit phone number.';
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    if (message) message.textContent = 'Submitting your request...';

    const lead = buildLeadObject(formData);
    const webhookResult = await submitToWebhook(lead);
    const whatsappLink = getWhatsAppLink(lead);
    const emailLink = getEmailLink(lead);

    const actions = [
      whatsappLink ? `<a href="${whatsappLink}" target="_blank" rel="noopener noreferrer">Continue on WhatsApp</a>` : '',
      emailLink ? `<a href="${emailLink}">Send by Email</a>` : '',
    ].filter(Boolean);

    if (message) {
      if (webhookResult.sent) {
        message.innerHTML = `Thank you. Your request has been received.${actions.length ? ` ${actions.join(' · ')}` : ''}`;
      } else {
        message.innerHTML = `Your details are ready.${actions.length ? ` ${actions.join(' · ')}` : ' Please call us directly.'}`;
      }
    }

    form.reset();
    if (submitButton) submitButton.disabled = false;
  });
});

/* ── New Features ─────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* 1. Scroll Animation Observer */
  var animateEls = document.querySelectorAll('.animate');
  if (animateEls.length) {
    var animObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            animObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    animateEls.forEach(function (el) { animObs.observe(el); });
  }

  /* 2. Counter Animation */
  var counterEls = document.querySelectorAll('[data-count]');
  if (counterEls.length) {
    var counterObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          counterObs.unobserve(entry.target);
          var target = parseInt(entry.target.getAttribute('data-count'), 10) || 0;
          var duration = 2000;
          var start = performance.now();
          function step(now) {
            var progress = Math.min((now - start) / duration, 1);
            entry.target.textContent = Math.floor(progress * target);
            if (progress < 1) requestAnimationFrame(step);
            else entry.target.textContent = target;
          }
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.15 }
    );
    counterEls.forEach(function (el) { counterObs.observe(el); });
  }

  /* 3. Typewriter Effect */
  var typewriterEls = document.querySelectorAll('[data-typewriter]');
  typewriterEls.forEach(function (el) {
    var text = el.getAttribute('data-typewriter') || el.textContent;
    el.textContent = '';
    el.style.borderRight = '2px solid currentColor';
    var i = 0;
    function type() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        setTimeout(type, 80);
      } else {
        // blink cursor then remove
        setTimeout(function () { el.style.borderRight = 'none'; }, 2500);
      }
    }
    var twObs = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          twObs.unobserve(el);
          type();
        }
      },
      { threshold: 0.15 }
    );
    twObs.observe(el);
  });

  /* 4. Smooth Scroll for Anchor Links */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var header = document.querySelector('.site-header');
      var offset = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* 5. Header Scroll Effect */
  var siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    window.addEventListener('scroll', function () {
      if (window.pageYOffset > 50) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* 6. Dropdown Navigation */
  var dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  var isMobile = function () { return window.innerWidth < 768; };
  dropdownToggles.forEach(function (toggle) {
    var menu = toggle.nextElementSibling;
    if (!menu || !menu.classList.contains('dropdown-menu')) return;

    toggle.addEventListener('click', function (e) {
      if (isMobile()) {
        e.preventDefault();
        menu.classList.toggle('open');
      }
    });

    toggle.parentElement.addEventListener('mouseenter', function () {
      if (!isMobile()) menu.classList.add('open');
    });
    toggle.parentElement.addEventListener('mouseleave', function () {
      if (!isMobile()) menu.classList.remove('open');
    });
  });

  /* 7. Blog Search */
  var blogSearch = document.querySelector('[data-blog-search]');
  if (blogSearch) {
    blogSearch.addEventListener('input', function () {
      var query = this.value.toLowerCase().trim();
      document.querySelectorAll('.blog-card').forEach(function (card) {
        var title = (card.querySelector('h2, h3, .blog-title') || {}).textContent || '';
        var excerpt = (card.querySelector('p, .blog-excerpt') || {}).textContent || '';
        var haystack = (title + ' ' + excerpt).toLowerCase();
        card.style.display = haystack.includes(query) ? '' : 'none';
      });
    });
  }

  /* 8. Back to Top Button */
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.textContent = '↑';
  btn.style.cssText =
    'position:fixed;bottom:2rem;right:2rem;width:3rem;height:3rem;border-radius:50%;' +
    'border:none;background:#1a73e8;color:#fff;font-size:1.25rem;cursor:pointer;' +
    'opacity:0;pointer-events:none;transition:opacity .3s;z-index:999;';
  document.body.appendChild(btn);

  window.addEventListener('scroll', function () {
    if (window.pageYOffset > 400) {
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    } else {
      btn.style.opacity = '0';
      btn.style.pointerEvents = 'none';
    }
  }, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();