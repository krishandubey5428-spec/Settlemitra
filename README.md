# Settlemitra Website

Modern multi-page website for Settlemitra, a debt settlement company.

## Pages

- `index.html` — Home
- `about.html` — About Settlemitra
- `services.html` — Services and process
- `faq.html` — Frequently asked questions
- `contact.html` — Contact and consultation form
- `privacy.html` — Privacy Policy
- `terms.html` — Terms of Service
- `404.html` — Custom 404 error page

## Tech

- HTML5
- CSS3 (custom responsive design)
- Vanilla JavaScript

## Run locally

Open `index.html` directly in your browser, or run a local server:

```bash
python3 -m http.server 8080
```

Then visit:

`http://localhost:8080`

## Lead capture setup (Webhook + WhatsApp + Email)

The form system now supports:

- Webhook submission (primary)
- WhatsApp prefilled message link (fallback / quick handoff)
- Email prefilled message link (fallback)

### Configure credentials

Edit `script.js` and update:

- `webhookUrl` with your endpoint URL
- `whatsappNumber` in international format (example: `9198XXXXXXXX`)
- `businessEmail` with your inbox

```js
const defaultLeadConfig = {
	webhookUrl: 'https://your-webhook-url',
	whatsappNumber: '9198XXXXXXXX',
	businessEmail: 'support@settlemitra.com',
};
```

### Optional runtime config override

You can also set config before loading `script.js`:

```html
<script>
	window.SETTLEMITRA_CONFIG = {
		webhookUrl: 'https://your-webhook-url',
		whatsappNumber: '9198XXXXXXXX',
		businessEmail: 'support@settlemitra.com'
	};
</script>
```

When webhook is unavailable, users still get clickable WhatsApp and Email options with prefilled lead details.

## 🔗 Live Website

**Shareable Link:** [https://krishandubey5428-spec.github.io/Settlemitra/](https://krishandubey5428-spec.github.io/Settlemitra/)

## Deploy (GitHub Pages)

This repo includes an auto-deploy workflow (`.github/workflows/deploy-pages.yml`) that publishes to GitHub Pages on every push to `main`.

### One-time setup

1. In your GitHub repo, go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.

### Deploying

Every push to `main` triggers the workflow automatically. You can also trigger it manually from **Actions → Deploy Settlemitra Site → Run workflow**.

If your GitHub owner or repository name changes, the URL also changes accordingly.
