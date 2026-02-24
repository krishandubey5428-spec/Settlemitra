# Settlemitra Website

Modern multi-page website for Settlemitra, a debt settlement company.

## Pages

- `index.html` — Home
- `about.html` — About Settlemitra
- `services.html` — Services and process
- `faq.html` — Frequently asked questions
- `contact.html` — Contact and consultation form

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

## Deploy live (GitHub Pages)

This repo now includes an auto-deploy workflow:

- `.github/workflows/deploy-pages.yml`

### Steps to publish

1. Push your latest code to the `main` branch.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Wait for the workflow **Deploy Settlemitra Site** to finish.

Your website URL will be:

`https://krishandubey5428-spec.github.io/Settlemitra/`

If your GitHub owner or repository name changes, this URL also changes accordingly.
