const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });
}

// Scroll-based header shadow
const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10 ? '0 4px 24px rgba(0,0,0,0.18)' : '';
  }, { passive: true });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

const yearEls = document.querySelectorAll('[data-year]');
yearEls.forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

const defaultLeadConfig = {
  webhookUrl: '',
  whatsappNumber: '919999999999',
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