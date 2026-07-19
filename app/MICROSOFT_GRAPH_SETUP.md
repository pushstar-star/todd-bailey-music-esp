# Microsoft Graph HTML delivery

Todd Bailey Music ESP supports Outlook HTML delivery through Microsoft Graph. The existing Codex Outlook connection remains available for plain-text automation, but Microsoft does not expose that connector's OAuth token to the local web app.

To activate HTML and batched delivery:

1. Open the Microsoft Entra admin center and create an app registration for **Todd Bailey Music ESP**.
2. Record the **Directory (tenant) ID** and **Application (client) ID**.
3. Under **API permissions**, add Microsoft Graph → **Application permissions** → `Mail.Send`.
4. Grant administrator consent for the tenant.
5. Create a client secret and copy its **Value** immediately.
6. In the ESP, open **Settings**, choose **Microsoft Graph — HTML + batches**, and enter those three values.
7. Send a test campaign to yourself before selecting a live audience.

For production, keep secrets outside `settings.json`:

```bash
export MS_TENANT_ID="..."
export MS_CLIENT_ID="..."
export MS_CLIENT_SECRET="..."
npm start
```

Graph batches contain no more than 20 requests. Each recipient receives an individually addressed, personalized HTML message from `info@toddbaileymusic.com`; the platform never uses a bulk BCC.
