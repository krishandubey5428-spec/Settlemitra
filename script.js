/* =========================================================
   Settlemitra – Main Script
   ========================================================= */
(() => {
  'use strict';

  /* -------------------------------------------------------
     1. Lead Configuration
     ------------------------------------------------------- */
  const defaultLeadConfig = {
    webhookUrl: '',
    whatsappNumber: '919000000000',
    businessEmail: 'support@settlemitra.com',
  };

  const leadConfig = {
    ...defaultLeadConfig,
    ...(window.SETTLEMITRA_CONFIG || {}),
  };

  /* -------------------------------------------------------
     2. Utility Helpers
     ------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const formatCurrency = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return 'Not provided';
    return `₹${number.toLocaleString('en-IN')}`;
  };

  /* -------------------------------------------------------
     3. Mobile Menu Toggle
     ------------------------------------------------------- */
  const initMobileMenu = () => {
    const menuButton = $('.menu-toggle');
    const nav = $('.site-nav');
    if (!menuButton || !nav) return;

    const toggle = (open) => {
      const isOpen = typeof open === 'boolean' ? open : !(menuButton.getAttribute('aria-expanded') === 'true');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      nav.classList.toggle('open', isOpen);
    };

    menuButton.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !menuButton.contains(e.target)) {
        toggle(false);
      }
    });

    // Close on nav link click
    $$('a', nav).forEach((link) => {
      link.addEventListener('click', () => toggle(false));
    });
  };

  /* -------------------------------------------------------
     4. Sticky Header
     ------------------------------------------------------- */
  const initStickyHeader = () => {
    const header = $('header');
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  };

  /* -------------------------------------------------------
     5. Scroll Animations (Intersection Observer)
     ------------------------------------------------------- */
  const initScrollAnimations = () => {
    const elements = $$('[data-animate]');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));
  };

  /* -------------------------------------------------------
     6. Animated Counters
     ------------------------------------------------------- */
  const initCounters = () => {
    const counters = $$('[data-counter]');
    if (!counters.length) return;

    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute('data-counter'), 10) || 0;
      const duration = 1500;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        el.textContent = Math.round(eased * target).toLocaleString('en-IN');
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    counters.forEach((el) => observer.observe(el));
  };

  /* -------------------------------------------------------
     7. Typewriter Effect
     ------------------------------------------------------- */
  const initTypewriter = () => {
    const el = $('[data-typewriter]');
    if (!el) return;

    const words = (el.getAttribute('data-typewriter-words') || '').split(',').map((w) => w.trim()).filter(Boolean);
    if (!words.length) return;

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseAfterWord = 1500;

    const tick = () => {
      const current = words[wordIndex];
      el.textContent = current.substring(0, charIndex);

      let delay = isDeleting ? deletingSpeed : typingSpeed;

      if (!isDeleting && charIndex === current.length) {
        delay = pauseAfterWord;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delay = typingSpeed;
      }

      charIndex += isDeleting ? -1 : 1;
      setTimeout(tick, delay);
    };

    tick();
  };

  /* -------------------------------------------------------
     8. Smooth Scroll for Anchor Links
     ------------------------------------------------------- */
  const initSmoothScroll = () => {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;

      const target = $(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  /* -------------------------------------------------------
     9. FAQ Accordion (single open at a time)
     ------------------------------------------------------- */
  const initFaqAccordion = () => {
    const faqList = $('.faq-list');
    if (!faqList) return;

    faqList.addEventListener('toggle', (e) => {
      if (!e.target.open) return;

      $$('details', faqList).forEach((details) => {
        if (details !== e.target && details.open) {
          details.open = false;
        }
      });
    }, true);
  };

  /* -------------------------------------------------------
     10. Active Nav Highlighting
     ------------------------------------------------------- */
  const initActiveNav = () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    $$('nav a, .site-nav a').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      const linkPage = href.split('/').pop().split('#')[0].split('?')[0];
      if (linkPage === currentPage) {
        link.classList.add('active');
      }
    });
  };

  /* -------------------------------------------------------
     11. Blog Search Filter
     ------------------------------------------------------- */
  const initBlogSearch = () => {
    const searchInput = $('[data-blog-search]');
    if (!searchInput) return;

    const cards = $$('.blog-card');
    if (!cards.length) return;

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      cards.forEach((card) => {
        const title = (card.querySelector('h2, h3, .blog-title') || {}).textContent || '';
        const desc = (card.querySelector('p, .blog-desc') || {}).textContent || '';
        const haystack = `${title} ${desc}`.toLowerCase();
        card.style.display = !query || haystack.includes(query) ? '' : 'none';
      });
    });
  };

  /* -------------------------------------------------------
     12. Blog Category Filter
     ------------------------------------------------------- */
  const initBlogCategoryFilter = () => {
    const buttons = $$('[data-category]');
    if (!buttons.length) return;

    const cards = $$('.blog-card');
    if (!cards.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-category').toLowerCase();

        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        cards.forEach((card) => {
          if (!category || category === 'all') {
            card.style.display = '';
          } else {
            const cardCat = (card.getAttribute('data-card-category') || '').toLowerCase();
            card.style.display = cardCat === category ? '' : 'none';
          }
        });
      });
    });
  };

  /* -------------------------------------------------------
     13. Back to Top Button
     ------------------------------------------------------- */
  const initBackToTop = () => {
    const btn = $('[data-back-to-top]');
    if (!btn) return;

    const onScroll = () => {
      btn.classList.toggle('visible', window.scrollY > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  /* -------------------------------------------------------
     14. Footer Year
     ------------------------------------------------------- */
  const initYear = () => {
    $$('[data-year]').forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  };

  /* -------------------------------------------------------
     15. Dropdown Navigation (hover on desktop, click on mobile)
     ------------------------------------------------------- */
  const initDropdownNav = () => {
    const dropdowns = $$('.nav-dropdown');
    if (!dropdowns.length) return;

    const isMobile = () => window.innerWidth < 768;

    dropdowns.forEach((dropdown) => {
      const trigger = dropdown.querySelector('.nav-dropdown-toggle');
      const menu = dropdown.querySelector('.nav-dropdown-menu');
      if (!trigger || !menu) return;

      // Desktop: hover
      dropdown.addEventListener('mouseenter', () => {
        if (!isMobile()) menu.classList.add('show');
      });
      dropdown.addEventListener('mouseleave', () => {
        if (!isMobile()) menu.classList.remove('show');
      });

      // Mobile: click
      trigger.addEventListener('click', (e) => {
        if (isMobile()) {
          e.preventDefault();
          menu.classList.toggle('show');
        }
      });
    });

    // Close dropdowns on outside click (mobile)
    document.addEventListener('click', (e) => {
      if (!isMobile()) return;
      dropdowns.forEach((dropdown) => {
        if (!dropdown.contains(e.target)) {
          const menu = dropdown.querySelector('.nav-dropdown-menu');
          if (menu) menu.classList.remove('show');
        }
      });
    });
  };

  /* -------------------------------------------------------
     16. Testimonial Auto-Scroll Carousel
     ------------------------------------------------------- */
  const initTestimonialCarousel = () => {
    const carousel = $('[data-testimonial-carousel]');
    if (!carousel) return;

    const items = $$('.testimonial-item', carousel);
    if (items.length < 2) return;

    let current = 0;
    const interval = parseInt(carousel.getAttribute('data-testimonial-interval'), 10) || 5000;

    const show = (index) => {
      items.forEach((item, i) => {
        item.classList.toggle('active', i === index);
      });
    };

    show(current);

    setInterval(() => {
      current = (current + 1) % items.length;
      show(current);
    }, interval);
  };

  /* -------------------------------------------------------
     17. Lazy Loading for Images
     ------------------------------------------------------- */
  const initLazyImages = () => {
    $$('img').forEach((img) => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });
  };

  /* -------------------------------------------------------
     18. Lead Capture – Build & Send
     ------------------------------------------------------- */
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
    } catch {
      return { sent: false, reason: 'error' };
    }
  };

  /* -------------------------------------------------------
     19. Floating WhatsApp Button
     ------------------------------------------------------- */
  const createFloatingWhatsAppButton = () => {
    if (!leadConfig.whatsappNumber) return;
    if ($('[data-wa-float]')) return;

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

  /* -------------------------------------------------------
     20. Form Handling
     ------------------------------------------------------- */
  const initForms = () => {
    $$('[data-form]').forEach((form) => {
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
  };

  /* -------------------------------------------------------
     Initialise Everything
     ------------------------------------------------------- */
  const init = () => {
    initMobileMenu();
    initStickyHeader();
    initScrollAnimations();
    initCounters();
    initTypewriter();
    initSmoothScroll();
    initFaqAccordion();
    initActiveNav();
    initBlogSearch();
    initBlogCategoryFilter();
    initBackToTop();
    initYear();
    initDropdownNav();
    initTestimonialCarousel();
    initLazyImages();
    createFloatingWhatsAppButton();
    initForms();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();