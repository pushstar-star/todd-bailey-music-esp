# Todd Bailey Music ESP

Local-first browser dashboard for Todd Bailey Music email marketing: contacts, audience lists, campaign building, scheduled sending, Microsoft Graph HTML delivery, suppression handling, analytics, and local JSON persistence.

## Run

```bash
cd app
npm start
```

Open `http://127.0.0.1:4173`.

On macOS, double-click `Run ESP Dashboard.command` from the project root to start the server and open the dashboard.

## Data And Secrets

Live dashboard JSON in `app/data/*.json` is intentionally local-only and ignored by git, except `app/data/.gitkeep`.

Do not commit `app/data/settings.json`. It may contain Microsoft Graph runtime credentials. Use `app/settings.example.json` as the safe template.

## Tests

```bash
cd app
npm test
```
