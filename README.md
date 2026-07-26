# Todd Bailey Music ESP

Local-first browser dashboard for Todd Bailey Music email marketing: contacts, audience lists, campaign building, scheduled sending, Microsoft Graph HTML delivery, suppression handling, analytics, and local JSON persistence.

## Run

```bash
cd app
npm start
```

Open `http://127.0.0.1:4173`.

On macOS, double-click `Run ESP Dashboard.command` from the project root to start the server and open the dashboard.

## Private Hosting

For a live private subdomain, set `ESP_AUTH_USER`, `ESP_AUTH_PASSWORD`, `HOST=0.0.0.0`, and `PORT` in the host environment. The dashboard and `/api/*` require the password; `/unsubscribe` and `/track/*` remain public for campaign recipients.

The app sends noindex headers and serves `robots.txt` with `Disallow: /`.

On GoDaddy cPanel Node.js hosting, use `app/app.js` as the startup file. It imports the real server at `app/server.js`.

## Data And Secrets

Live dashboard JSON in `app/data/*.json` is intentionally local-only and ignored by git, except `app/data/.gitkeep`.

Do not commit `app/data/settings.json`. It may contain Microsoft Graph runtime credentials. Use `app/settings.example.json` as the safe template.

## Tests

```bash
cd app
npm test
```
