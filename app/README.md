# Todd Bailey Music ESP

A local-first, browser-based email service platform for managing contacts, designing campaigns, and delivering through the connected Todd Bailey Music Outlook automation, Resend, or SendGrid.

## Start

Requires Node.js 20 or newer.

```bash
cd app
npm start
```

Open `http://127.0.0.1:4173`.

On macOS, you can also double-click `Run ESP Dashboard.command` in the project folder to start the server and open the dashboard.

For live email, deploy the app to an HTTPS URL and set **Settings → Public unsubscribe URL** to that public origin, for example `https://email.toddbaileymusic.com`. Do not use `localhost` for live sends; recipients need to reach the app’s `/unsubscribe` page from their own devices.

The supplied archive and follow-up imports have already been imported as 1,860 unique contacts across 25 lists. Duplicate email addresses are stored once while retaining all 3,988 list memberships. Imported records begin as **Needs review** and are not eligible for campaigns until their marketing permission is explicitly confirmed.

## What is included

- Audience dashboard with CRM fields, list/status filters, pagination, CSV import, and duplicate prevention
- 25 audience lists, list cards and counts, create/edit list controls, and bulk list assignment
- Add/edit contact forms with multi-list membership checkboxes
- Consent-aware contact statuses: Needs review, Subscribed, Unsubscribed, and Bounced
- Mailchimp-style responsive email builder with headings, text, images, buttons, dividers, columns, headers, and custom HTML
- Editable social-profile icons/links and a single editable compliance footer without duplicate sender footers
- Drag/reorder controls, color, spacing, alignment, mobile preview, merge tags, saveable drafts, and templates
- Personalization with `{{first_name}}`, `{{company}}`, and `{{brand_name}}`
- Campaign-level list selection with cross-list deduplication and an exact eligible-recipient count
- Guarded test/live delivery with typed confirmation and permission attestation
- Resend and SendGrid adapters, required mailing-address footer, and one-click unsubscribe handling
- Configurable public unsubscribe URL so campaign links do not point at localhost
- Local JSON persistence with API keys excluded from Git

## Outlook connection

The default sender is `Todd Bailey <info@toddbaileymusic.com>`, using the same connected Outlook mailbox as the Playlist Outreach automation. Campaigns queued through the connector are converted to plain text and sent one-to-one by the `Todd Bailey Music Campaign Sender` automation.

For native Outlook HTML delivery, choose **Microsoft Graph — HTML + batches** and configure a Microsoft Entra application with `Mail.Send` application permission and administrator consent. Graph delivery preserves the email builder’s HTML, personalization, and unsubscribe footer, batching up to 20 individual one-to-one messages in each Graph request. Set `MS_TENANT_ID`, `MS_CLIENT_ID`, and `MS_CLIENT_SECRET` as environment variables in production.

## Alternative sending setup

1. Open **Settings**.
2. Add your brand, verified From email, Reply-to address, and physical mailing address.
3. Add the public unsubscribe URL where this app is deployed.
4. Choose Resend or SendGrid and add its API key. For production, prefer setting `COURIERLY_API_KEY` in the environment.
5. Verify the sending domain with your provider and publish its SPF/DKIM records.
6. Review the imported audience and mark only contacts with documented marketing permission as Subscribed.
7. Keep test mode enabled until the campaign is ready, then switch to live mode.

## Tests

```bash
npm test
```

This is a strong local MVP. Production deployment should add authentication, encrypted secret storage, a managed database, job queues, provider webhooks for bounce/complaint tracking, rate limiting, and HTTPS.
