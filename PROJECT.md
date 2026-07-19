# Todd Bailey Music ESP

## Project status

This workspace contains a working local browser-based email service platform at `app/`.

- Product name: Todd Bailey Music ESP
- Local URL: `http://127.0.0.1:4173`
- Sender: `Todd Bailey <info@toddbaileymusic.com>`
- Audience: 1,860 unique contacts
- Lists: 25
- Contact/list memberships: 3,988
- Automated tests: 7 passing

## Implemented features

- Contact search, filtering, create/edit, permission status, CSV import, and duplicate prevention
- Create/edit audience lists and assign contacts to multiple lists
- Campaign targeting by one or more lists with cross-list recipient deduplication
- Responsive block-based HTML email builder with personalization tags
- Editable single compliance-footer block with live address and per-recipient unsubscribe link
- Editable social-profile block for website, Facebook, Instagram, YouTube, TikTok, and Spotify
- Required sender address and unsubscribe controls
- Microsoft Graph HTML delivery using personalized one-to-one messages
- Microsoft Graph JSON batching of up to 20 send requests per API call
- Resend, SendGrid, safe test mode, and the original plain-text Outlook automation fallback

## Microsoft configuration

- Permission: Microsoft Graph `Mail.Send` application permission
- Authentication and `Mail.Send` token role were verified successfully on 2026-06-30.

Tenant/client IDs and the client secret are intentionally excluded from committed project files. The active local configuration is stored only in ignored `app/data/settings.json`. Because a client secret was pasted into chat during setup, rotate it after testing and enter the replacement directly in the application Settings page.

## Automations

- `todd-bailey-music-campaign-sender`: hourly fallback processor for plain-text Outlook outbox jobs
- Existing playlist automation: `playlist-outreach-daily-runner`

## Continue work

1. Open this workspace in Codex.
2. Read this `PROJECT.md`.
3. Double-click `Run ESP Dashboard.command` to start the local server and open `http://127.0.0.1:4173`.
4. Or start the application manually with `node app/server.js`.
5. Run tests with `node --test app/tests/*.test.mjs`.

Do not send live campaigns during development or testing. Use a single controlled test recipient first.
