# Todd Bailey Music ESP

Local-first email service platform for Todd Bailey Music.

## Current Source Of Truth

The live local project is currently at:

`/Users/toddmac/Documents/Codex/todd-bailey-music-esp/app`

A sanitized local snapshot was created at:

`/Users/toddmac/Documents/Codex/todd-bailey-music-esp/_snapshots/todd-bailey-music-esp-sanitized-20260719T0015.tar.gz`

## Important Secret Handling

Do not commit `app/data/settings.json`. It contains runtime Microsoft Graph configuration and may contain a client secret. Use `app/settings.example.json` as the safe committed template.

The Microsoft Graph client secret that appeared in the local settings file should be rotated.

## Files That Must Be Versioned

The project should commit app source plus state JSON that drives the dashboard:

- `app/server.js`
- `app/public/index.html`
- `app/public/app.js`
- `app/public/styles.css`
- `app/data/campaigns.json`
- `app/data/events.json`
- `app/data/contacts.json`
- `app/data/lists.json`
- `app/data/outbox.json`
- `app/settings.example.json`
- scripts and tests

## Current Local Git Blocker

The local macOS environment cannot run `git` because Xcode command line tools are not configured. To push the full local project from the machine:

```bash
xcode-select --install
cd /Users/toddmac/Documents/Codex/todd-bailey-music-esp
git init
git add .
git reset app/data/settings.json app/esp-server.log app/esp-server.pid '*.zip'
git commit -m "Initial Todd Bailey Music ESP project"
git branch -M main
git remote add origin https://github.com/pushstar-star/todd-bailey-music-esp.git
git push -u origin main
```
