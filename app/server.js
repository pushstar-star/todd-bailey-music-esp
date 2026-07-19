import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const dataDir = path.join(__dirname, "data");
const port = Number(process.env.PORT || 4173);

const paths = {
  contacts: path.join(dataDir, "contacts.json"),
  lists: path.join(dataDir, "lists.json"),
  campaigns: path.join(dataDir, "campaigns.json"),
  outbox: path.join(dataDir, "outbox.json"),
  settings: path.join(dataDir, "settings.json"),
  events: path.join(dataDir, "events.json")
};

const defaults = {
  contacts: [],
  lists: [],
  campaigns: [],
  outbox: [],
  settings: {
    brandName: "Todd Bailey Music",
    fromName: "Todd Bailey",
    fromEmail: "info@toddbaileymusic.com",
    replyTo: "info@toddbaileymusic.com",
    physicalAddress: "",
    publicBaseUrl: "",
    trackingEnabled: false,
    provider: "outlook",
    sendMode: "live",
    apiKey: "",
    graphTenantId: "",
    graphClientId: "",
    graphClientSecret: ""
  },
  events: []
};

async function readJson(name) {
  try {
    const value = JSON.parse(await fs.readFile(paths[name], "utf8"));
    if (
      value &&
      defaults[name] &&
      !Array.isArray(value) &&
      !Array.isArray(defaults[name])
    ) {
      return { ...defaults[name], ...value };
    }
    return value;
  } catch {
    return structuredClone(defaults[name]);
  }
}

async function writeJson(name, value) {
  await fs.mkdir(dataDir, { recursive: true });
  const temp = `${paths[name]}.tmp`;
  await fs.writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await fs.rename(temp, paths[name]);
}

function json(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(body));
}

async function body(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 12_000_000) throw new Error("Request is too large");
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function safeSettings(settings) {
  return {
    ...settings,
    apiKey: settings.apiKey ? "••••••••" : "",
    graphClientSecret: settings.graphClientSecret ? "••••••••" : ""
  };
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function htmlToText(value = "") {
  return String(value)
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>|<\/div>|<\/tr>|<\/h[1-6]>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function publicBaseUrl(settings) {
  const raw = String(process.env.PUBLIC_BASE_URL || settings.publicBaseUrl || "").trim();
  if (!raw) return "";
  try {
    const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return parsed.origin;
  } catch {
    return raw.replace(/\/+$/, "");
  }
}

function unsubscribeUrl(contact, settings, campaignId = "") {
  const base = publicBaseUrl(settings);
  if (!base) return "";
  const params = new URLSearchParams({ email: contact.email || "" });
  if (campaignId) params.set("cid", campaignId);
  return `${base}/unsubscribe?${params}`;
}

function personalize(value, contact, settings) {
  const vars = {
    first_name: contact.firstName || "there",
    last_name: contact.lastName || "",
    email: contact.email || "",
    company: contact.company || "",
    brand_name: settings.brandName || "",
    physical_address: settings.physicalAddress || "",
    unsubscribe_url: unsubscribeUrl(contact, settings)
  };
  return String(value || "").replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_, name) => vars[name] ?? "");
}

function withComplianceFooter(html, contact, settings, campaignId = "") {
  const unsubscribe = unsubscribeUrl(contact, settings, campaignId);
  if (/data-compliance-footer=["']true["']/i.test(String(html))) return html;
  return `${html}
    <div style="max-width:600px;margin:24px auto 0;padding:20px;color:#6b7280;font:12px/1.5 Arial,sans-serif;text-align:center">
      Sent by ${escapeHtml(settings.brandName)} · ${escapeHtml(settings.physicalAddress)}
      <br><a href="${unsubscribe}" style="color:#6b7280">Unsubscribe</a>
    </div>`;
}

function trackingUrl(type, { campaignId, contact, settings, destination = "" }) {
  const base = publicBaseUrl(settings);
  if (!base || !campaignId || !contact?.email) return "";
  const params = new URLSearchParams({
    cid: campaignId,
    email: contact.email
  });
  if (destination) params.set("url", destination);
  return `${base}/track/${type}?${params}`;
}

function addTracking(html, { campaignId, contact, settings }) {
  if (!campaignId || settings.trackingEnabled !== true) return html;
  let output = String(html || "").replace(/<a\b([^>]*?)href=(["'])(.*?)\2([^>]*)>/gi, (match, before, quote, href, after) => {
    if (!href || href.startsWith("#") || /^mailto:/i.test(href) || /\/unsubscribe(?:\?|$)/i.test(href) || /\/track\/click(?:\?|$)/i.test(href)) return match;
    const tracked = trackingUrl("click", { campaignId, contact, settings, destination: href });
    return tracked ? `<a${before}href=${quote}${tracked}${quote}${after}>` : match;
  });
  const open = trackingUrl("open", { campaignId, contact, settings });
  if (open) output += `<img src="${open}" width="1" height="1" alt="" style="display:none!important;width:1px;height:1px;border:0;overflow:hidden">`;
  return output;
}

async function queueOutlookJob({ campaignId = null, campaignName, contacts, subject, html, settings, kind = "campaign" }) {
  const outbox = await readJson("outbox");
  const job = {
    id: `out_${crypto.randomUUID()}`,
    kind,
    campaignId,
    campaignName,
    fromName: settings.fromName,
    fromEmail: settings.fromEmail,
    replyTo: settings.replyTo || settings.fromEmail,
    status: "queued",
    createdAt: new Date().toISOString(),
    recipients: contacts.map((contact) => ({
      contactId: contact.id || null,
      email: contact.email,
      name: [contact.firstName, contact.lastName].filter(Boolean).join(" "),
      subject: personalize(subject, contact, settings),
      text: `${htmlToText(personalize(html, contact, settings))}\n\n${settings.brandName}\n${settings.physicalAddress}\nTo unsubscribe, reply with “unsubscribe.”`,
      status: "queued"
    }))
  };
  outbox.push(job);
  await writeJson("outbox", outbox);
  return job;
}

async function deliver({ to, subject, html, settings }) {
  const apiKey =
    process.env.COURIERLY_API_KEY ||
    (settings.apiKey && settings.apiKey !== "••••••••" ? settings.apiKey : "");
  if (settings.provider === "test" || settings.sendMode !== "live") {
    return { id: `test_${crypto.randomUUID()}`, mode: "test" };
  }
  if (!apiKey) throw new Error("Add a provider API key in Settings or COURIERLY_API_KEY.");

  if (settings.provider === "resend") {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `${settings.fromName} <${settings.fromEmail}>`,
        to: [to],
        reply_to: settings.replyTo || settings.fromEmail,
        subject,
        html
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || `Resend returned ${response.status}.`);
    return { id: payload.id, mode: "live" };
  }

  if (settings.provider === "sendgrid") {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }], subject }],
        from: { email: settings.fromEmail, name: settings.fromName },
        reply_to: { email: settings.replyTo || settings.fromEmail },
        content: [{ type: "text/html", value: html }]
      })
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.errors?.[0]?.message || `SendGrid returned ${response.status}.`);
    }
    return { id: response.headers.get("x-message-id") || crypto.randomUUID(), mode: "live" };
  }
  throw new Error("Choose Test, Resend, or SendGrid as the delivery provider.");
}

async function getGraphAccessToken(settings) {
  const tenantId = process.env.MS_TENANT_ID || settings.graphTenantId;
  const clientId = process.env.MS_CLIENT_ID || settings.graphClientId;
  const clientSecret = process.env.MS_CLIENT_SECRET || (settings.graphClientSecret === "••••••••" ? "" : settings.graphClientSecret);
  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Microsoft Graph needs a tenant ID, client ID, and client secret with Mail.Send application permission.");
  }
  const form = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials"
  });
  const response = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || "Microsoft Graph authentication failed.");
  }
  return payload.access_token;
}

async function sendGraphHtmlBatch({ campaignId = null, contacts, subject, html, settings }) {
  const token = await getGraphAccessToken(settings);
  const results = [];
  for (let offset = 0; offset < contacts.length; offset += 20) {
    const chunk = contacts.slice(offset, offset + 20);
    const requests = chunk.map((contact, index) => ({
      id: String(index + 1),
      method: "POST",
      url: `/users/${encodeURIComponent(settings.fromEmail)}/sendMail`,
      headers: { "Content-Type": "application/json" },
      body: {
        message: {
          subject: personalize(subject, contact, settings),
          body: {
            contentType: "HTML",
            content: addTracking(withComplianceFooter(personalize(html, contact, settings), contact, settings, campaignId), { campaignId, contact, settings })
          },
          from: { emailAddress: { address: settings.fromEmail, name: settings.fromName } },
          replyTo: [{ emailAddress: { address: settings.replyTo || settings.fromEmail } }],
          toRecipients: [{ emailAddress: { address: contact.email, name: [contact.firstName, contact.lastName].filter(Boolean).join(" ") } }]
        },
        saveToSentItems: true
      }
    }));
    const response = await fetch("https://graph.microsoft.com/v1.0/$batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !Array.isArray(payload.responses)) {
      throw new Error(payload.error?.message || `Microsoft Graph batch delivery failed (${response.status}).`);
    }
    const byId = new Map(payload.responses.map((item) => [item.id, item]));
    chunk.forEach((contact, index) => {
      const result = byId.get(String(index + 1));
      results.push({
        contactId: contact.id || null,
        status: result?.status >= 200 && result?.status < 300 ? "delivered" : "failed",
        error: result?.body?.error?.message || null
      });
    });
  }
  return results;
}

function validateSend(settings) {
  const missing = [];
  if (!settings.fromName) missing.push("from name");
  if (!settings.fromEmail) missing.push("from email");
  if (!settings.physicalAddress) missing.push("physical mailing address");
  if (settings.sendMode === "live") {
    const base = publicBaseUrl(settings);
    if (!base) {
      missing.push("public unsubscribe URL");
    } else if (!/^https?:\/\//i.test(base)) {
      throw new Error("Public unsubscribe URL must start with http:// or https://.");
    } else if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(base)) {
      throw new Error("Public unsubscribe URL cannot use localhost for live sends. Use a deployed HTTPS URL recipients can open.");
    }
  }
  if (missing.length) throw new Error(`Complete Settings: ${missing.join(", ")}.`);
}

function campaignRecipients(campaign, contacts) {
  if (!campaign.listIds?.length) throw new Error("Choose at least one audience list for this campaign.");
  const targetedLists = new Set(campaign.listIds);
  const recipients = contacts.filter((contact) =>
    contact.status === "subscribed" &&
    (contact.listIds || []).some((listId) => targetedLists.has(listId))
  );
  if (!recipients.length) throw new Error("No subscribed contacts are eligible.");
  if (recipients.length > 2000) throw new Error("This local edition is capped at 2,000 recipients per send.");
  return recipients;
}

async function performCampaignDelivery({ settings, contacts, campaigns, events, campaign }) {
  validateSend(settings);
  const recipients = campaignRecipients(campaign, contacts);
  delete campaign.scheduledAt;
  delete campaign.scheduledCount;
  delete campaign.scheduleError;

  if (settings.provider === "outlook") {
    const job = await queueOutlookJob({
      campaignId: campaign.id,
      campaignName: campaign.name,
      contacts: recipients,
      subject: campaign.subject,
      html: campaign.html,
      settings
    });
    campaign.status = "queued";
    campaign.queuedAt = new Date().toISOString();
    campaign.queuedCount = recipients.length;
    events.unshift({
      id: `evt_${crypto.randomUUID()}`,
      campaignId: campaign.id,
      type: "outlook_queued",
      count: recipients.length,
      createdAt: campaign.queuedAt
    });
    await Promise.all([writeJson("campaigns", campaigns), writeJson("events", events)]);
    return { queued: recipients.length, failed: 0, mode: "outlook_queue", jobId: job.id };
  }

  if (settings.provider === "microsoft_graph") {
    const batch = await sendGraphHtmlBatch({
      campaignId: campaign.id,
      contacts: recipients,
      subject: campaign.subject,
      html: campaign.html,
      settings
    });
    const delivered = batch.filter((item) => item.status === "delivered").length;
    campaign.status = delivered ? "sent" : "failed";
    campaign.sentAt = new Date().toISOString();
    campaign.sentCount = delivered;
    events.unshift({
      id: `evt_${crypto.randomUUID()}`,
      campaignId: campaign.id,
      type: "graph_html_send",
      count: delivered,
      createdAt: campaign.sentAt
    });
    await Promise.all([writeJson("campaigns", campaigns), writeJson("events", events)]);
    return { delivered, failed: batch.length - delivered, mode: "microsoft_graph" };
  }

  const batch = [];
  for (const contact of recipients) {
    try {
      const result = await deliver({
        to: contact.email,
        subject: personalize(campaign.subject, contact, settings),
        html: addTracking(withComplianceFooter(personalize(campaign.html, contact, settings), contact, settings, campaign.id), { campaignId: campaign.id, contact, settings }),
        settings
      });
      batch.push({ contactId: contact.id, status: "delivered", providerId: result.id });
    } catch (error) {
      batch.push({ contactId: contact.id, status: "failed", error: error.message });
      if (settings.sendMode === "live") break;
    }
  }
  const delivered = batch.filter((item) => item.status === "delivered").length;
  campaign.status = settings.sendMode === "live" ? "sent" : "tested";
  campaign.sentAt = new Date().toISOString();
  campaign.sentCount = delivered;
  events.unshift({
    id: `evt_${crypto.randomUUID()}`,
    campaignId: campaign.id,
    type: settings.sendMode === "live" ? "send" : "test_send",
    count: delivered,
    createdAt: campaign.sentAt
  });
  await Promise.all([writeJson("campaigns", campaigns), writeJson("events", events)]);
  return { delivered, failed: batch.length - delivered, mode: settings.sendMode };
}

let scheduleCheckRunning = false;
async function processDueCampaigns() {
  if (scheduleCheckRunning) return;
  scheduleCheckRunning = true;
  try {
    const [settings, contacts, campaigns, events] = await Promise.all([
      readJson("settings"),
      readJson("contacts"),
      readJson("campaigns"),
      readJson("events")
    ]);
    const now = Date.now();
    const due = campaigns.filter((campaign) =>
      campaign.status === "scheduled" &&
      campaign.scheduledAt &&
      new Date(campaign.scheduledAt).getTime() <= now
    );
    for (const campaign of due) {
      try {
        await performCampaignDelivery({ settings, contacts, campaigns, events, campaign });
      } catch (error) {
        campaign.status = "failed";
        campaign.scheduleError = error.message;
        campaign.updatedAt = new Date().toISOString();
        events.unshift({
          id: `evt_${crypto.randomUUID()}`,
          campaignId: campaign.id,
          type: "schedule_failed",
          count: 0,
          error: error.message,
          createdAt: campaign.updatedAt
        });
        await Promise.all([writeJson("campaigns", campaigns), writeJson("events", events)]);
      }
    }
  } finally {
    scheduleCheckRunning = false;
  }
}

async function api(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/state") {
    const [contacts, lists, campaigns, settings, events] = await Promise.all([
      readJson("contacts"),
      readJson("lists"),
      readJson("campaigns"),
      readJson("settings"),
      readJson("events")
    ]);
    return json(res, 200, {
      contacts,
      lists,
      campaigns,
      settings: safeSettings(settings),
      events
    });
  }

  if (req.method === "POST" && url.pathname === "/api/contacts/import") {
    const payload = await body(req);
    const existing = await readJson("contacts");
    const emails = new Set(existing.map((contact) => contact.email.toLowerCase()));
    const added = [];
    for (const input of payload.contacts || []) {
      const email = String(input.email || "").trim().toLowerCase();
      if (!email.includes("@") || emails.has(email)) continue;
      emails.add(email);
      added.push({
        id: `ct_${crypto.randomUUID()}`,
        email,
        firstName: String(input.firstName || "").trim(),
        lastName: String(input.lastName || "").trim(),
        company: String(input.company || "").trim(),
        phone: String(input.phone || "").trim(),
        city: String(input.city || "").trim(),
        state: String(input.state || "").trim(),
        country: String(input.country || "").trim(),
        jobTitle: String(input.jobTitle || "").trim(),
        score: Number(input.score || 0),
        source: String(input.source || "CSV import"),
        status: "needs_review",
        tags: Array.isArray(input.tags) ? input.tags : ["CSV import"],
        listIds: payload.listId ? [payload.listId] : [],
        importedAt: new Date().toISOString()
      });
    }
    if (payload.listId) {
      for (const contact of existing) {
        const imported = (payload.contacts || []).find((item) => String(item.email || "").trim().toLowerCase() === contact.email.toLowerCase());
        if (imported && !contact.listIds?.includes(payload.listId)) {
          contact.listIds = [...(contact.listIds || []), payload.listId];
        }
      }
    }
    await writeJson("contacts", [...existing, ...added]);
    return json(res, 201, { added: added.length, skipped: (payload.contacts || []).length - added.length });
  }

  if (req.method === "POST" && url.pathname === "/api/contacts/status") {
    const payload = await body(req);
    const allowed = new Set(["subscribed", "needs_review", "unsubscribed", "bounced"]);
    if (!allowed.has(payload.status)) return json(res, 400, { error: "Invalid contact status." });
    const ids = new Set(payload.ids || []);
    const contacts = await readJson("contacts");
    let changed = 0;
    for (const contact of contacts) {
      if (ids.has(contact.id)) {
        contact.status = payload.status;
        contact.updatedAt = new Date().toISOString();
        changed += 1;
      }
    }
    await writeJson("contacts", contacts);
    return json(res, 200, { changed });
  }

  if (req.method === "POST" && url.pathname === "/api/contacts") {
    const payload = await body(req);
    const email = String(payload.email || "").trim().toLowerCase();
    if (!email.includes("@")) return json(res, 400, { error: "Enter a valid email address." });
    const contacts = await readJson("contacts");
    if (contacts.some((contact) => contact.email.toLowerCase() === email)) {
      return json(res, 409, { error: "A contact with this email already exists." });
    }
    const contact = {
      id: `ct_${crypto.randomUUID()}`,
      email,
      firstName: String(payload.firstName || "").trim(),
      lastName: String(payload.lastName || "").trim(),
      company: String(payload.company || "").trim(),
      phone: String(payload.phone || "").trim(),
      city: String(payload.city || "").trim(),
      state: String(payload.state || "").trim(),
      country: String(payload.country || "").trim(),
      jobTitle: String(payload.jobTitle || "").trim(),
      score: Number(payload.score || 0),
      source: "Manual entry",
      status: ["subscribed", "needs_review", "unsubscribed", "bounced"].includes(payload.status) ? payload.status : "needs_review",
      tags: ["Manual entry"],
      listIds: Array.isArray(payload.listIds) ? [...new Set(payload.listIds)] : [],
      importedAt: new Date().toISOString()
    };
    contacts.unshift(contact);
    await writeJson("contacts", contacts);
    return json(res, 201, contact);
  }

  const contactMatch = url.pathname.match(/^\/api\/contacts\/([^/]+)$/);
  if (req.method === "PUT" && contactMatch) {
    const payload = await body(req);
    const contacts = await readJson("contacts");
    const contact = contacts.find((item) => item.id === contactMatch[1]);
    if (!contact) return json(res, 404, { error: "Contact not found." });
    const email = String(payload.email ?? contact.email).trim().toLowerCase();
    if (!email.includes("@")) return json(res, 400, { error: "Enter a valid email address." });
    if (contacts.some((item) => item.id !== contact.id && item.email.toLowerCase() === email)) {
      return json(res, 409, { error: "Another contact already uses this email." });
    }
    Object.assign(contact, {
      email,
      firstName: String(payload.firstName ?? contact.firstName).trim(),
      lastName: String(payload.lastName ?? contact.lastName).trim(),
      company: String(payload.company ?? contact.company).trim(),
      phone: String(payload.phone ?? contact.phone).trim(),
      city: String(payload.city ?? contact.city).trim(),
      state: String(payload.state ?? contact.state).trim(),
      country: String(payload.country ?? contact.country).trim(),
      jobTitle: String(payload.jobTitle ?? contact.jobTitle).trim(),
      status: ["subscribed", "needs_review", "unsubscribed", "bounced"].includes(payload.status) ? payload.status : contact.status,
      listIds: Array.isArray(payload.listIds) ? [...new Set(payload.listIds)] : contact.listIds || [],
      updatedAt: new Date().toISOString()
    });
    await writeJson("contacts", contacts);
    return json(res, 200, contact);
  }

  if (req.method === "POST" && url.pathname === "/api/lists") {
    const payload = await body(req);
    const name = String(payload.name || "").trim();
    if (!name) return json(res, 400, { error: "List name is required." });
    const lists = await readJson("lists");
    const list = {
      id: `list_${crypto.randomUUID()}`,
      name,
      description: String(payload.description || "").trim(),
      color: /^#[0-9a-f]{6}$/i.test(payload.color || "") ? payload.color : "#176b4d",
      sourceFile: "",
      createdAt: new Date().toISOString()
    };
    lists.push(list);
    await writeJson("lists", lists);
    return json(res, 201, list);
  }

  const listMatch = url.pathname.match(/^\/api\/lists\/([^/]+)$/);
  if (req.method === "PUT" && listMatch) {
    const payload = await body(req);
    const lists = await readJson("lists");
    const list = lists.find((item) => item.id === listMatch[1]);
    if (!list) return json(res, 404, { error: "List not found." });
    list.name = String(payload.name ?? list.name).trim() || list.name;
    list.description = String(payload.description ?? list.description).trim();
    if (/^#[0-9a-f]{6}$/i.test(payload.color || "")) list.color = payload.color;
    list.updatedAt = new Date().toISOString();
    await writeJson("lists", lists);
    return json(res, 200, list);
  }

  if (req.method === "DELETE" && listMatch) {
    const lists = await readJson("lists");
    const index = lists.findIndex((item) => item.id === listMatch[1]);
    if (index < 0) return json(res, 404, { error: "List not found." });
    lists.splice(index, 1);
    const contacts = await readJson("contacts");
    for (const contact of contacts) contact.listIds = (contact.listIds || []).filter((id) => id !== listMatch[1]);
    await Promise.all([writeJson("lists", lists), writeJson("contacts", contacts)]);
    return json(res, 200, { deleted: true });
  }

  const memberMatch = url.pathname.match(/^\/api\/lists\/([^/]+)\/members$/);
  if (req.method === "POST" && memberMatch) {
    const payload = await body(req);
    const ids = new Set(payload.contactIds || []);
    const contacts = await readJson("contacts");
    let changed = 0;
    for (const contact of contacts) {
      if (!ids.has(contact.id)) continue;
      const current = new Set(contact.listIds || []);
      if (payload.action === "remove") current.delete(memberMatch[1]);
      else current.add(memberMatch[1]);
      contact.listIds = [...current];
      changed += 1;
    }
    await writeJson("contacts", contacts);
    return json(res, 200, { changed });
  }

  if (req.method === "POST" && url.pathname === "/api/campaigns") {
    const payload = await body(req);
    const campaigns = await readJson("campaigns");
    const campaign = {
      id: `cmp_${crypto.randomUUID()}`,
      name: payload.name || "Untitled campaign",
      subject: payload.subject || "",
      previewText: payload.previewText || "",
      emailBackground: payload.emailBackground || "#edf1ed",
      emailBorderColor: payload.emailBorderColor || "#dfe6e2",
      emailBorderWidth: Number(payload.emailBorderWidth || 0),
      emailBorderRadius: Number(payload.emailBorderRadius || 0),
      html: payload.html || "",
      blocks: payload.blocks || [],
      status: "draft",
      audience: "lists",
      listIds: Array.isArray(payload.listIds) ? payload.listIds : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sentCount: 0
    };
    campaigns.unshift(campaign);
    await writeJson("campaigns", campaigns);
    return json(res, 201, campaign);
  }

  const campaignMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)$/);
  if (req.method === "PUT" && campaignMatch) {
    const payload = await body(req);
    const campaigns = await readJson("campaigns");
    const campaign = campaigns.find((item) => item.id === campaignMatch[1]);
    if (!campaign) return json(res, 404, { error: "Campaign not found." });
    Object.assign(campaign, {
      name: payload.name ?? campaign.name,
      subject: payload.subject ?? campaign.subject,
      previewText: payload.previewText ?? campaign.previewText,
      emailBackground: payload.emailBackground ?? campaign.emailBackground ?? "#edf1ed",
      emailBorderColor: payload.emailBorderColor ?? campaign.emailBorderColor ?? "#dfe6e2",
      emailBorderWidth: Number(payload.emailBorderWidth ?? campaign.emailBorderWidth ?? 0),
      emailBorderRadius: Number(payload.emailBorderRadius ?? campaign.emailBorderRadius ?? 0),
      html: payload.html ?? campaign.html,
      blocks: payload.blocks ?? campaign.blocks,
      audience: "lists",
      listIds: Array.isArray(payload.listIds) ? payload.listIds : campaign.listIds || [],
      updatedAt: new Date().toISOString()
    });
    await writeJson("campaigns", campaigns);
    return json(res, 200, campaign);
  }

  if (req.method === "POST" && url.pathname === "/api/send/test") {
    const payload = await body(req);
    const settings = await readJson("settings");
    validateSend(settings);
    const contact = {
      email: payload.to,
      firstName: payload.firstName || "Friend",
      lastName: "",
      company: ""
    };
    const result = settings.provider === "microsoft_graph"
      ? await sendGraphHtmlBatch({ contacts: [contact], subject: payload.subject, html: payload.html, settings })
          .then((items) => {
            if (items[0]?.status !== "delivered") throw new Error(items[0]?.error || "Microsoft Graph test send failed.");
            return { id: `graph_${crypto.randomUUID()}`, mode: "microsoft_graph" };
          })
      : settings.provider === "outlook"
      ? {
          id: (await queueOutlookJob({
            campaignName: "Campaign test",
            contacts: [contact],
            subject: payload.subject,
            html: payload.html,
            settings,
            kind: "test"
          })).id,
          mode: "outlook_queue"
        }
      : await deliver({
          to: contact.email,
          subject: personalize(payload.subject, contact, settings),
          html: withComplianceFooter(personalize(payload.html, contact, settings), contact, settings),
          settings
        });
    return json(res, 200, { ok: true, result });
  }

  const sendMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)\/send$/);
  if (req.method === "POST" && sendMatch) {
    const payload = await body(req);
    if (payload.confirmation !== "SEND" || payload.permissionConfirmed !== true) {
      return json(res, 400, { error: "Confirm permission and type SEND before delivery." });
    }
    const [settings, contacts, campaigns, events] = await Promise.all([
      readJson("settings"),
      readJson("contacts"),
      readJson("campaigns"),
      readJson("events")
    ]);
    validateSend(settings);
    const campaign = campaigns.find((item) => item.id === sendMatch[1]);
    if (!campaign) return json(res, 404, { error: "Campaign not found." });
    const recipients = campaignRecipients(campaign, contacts);

    if (payload.scheduleMode === "later") {
      const scheduledAt = new Date(payload.scheduledAt || "");
      if (!Number.isFinite(scheduledAt.getTime())) return json(res, 400, { error: "Choose a valid scheduled day and time." });
      if (scheduledAt.getTime() <= Date.now()) return json(res, 400, { error: "Scheduled time must be in the future." });
      campaign.status = "scheduled";
      campaign.scheduledAt = scheduledAt.toISOString();
      campaign.scheduledCount = recipients.length;
      campaign.updatedAt = new Date().toISOString();
      delete campaign.scheduleError;
      events.unshift({
        id: `evt_${crypto.randomUUID()}`,
        campaignId: campaign.id,
        type: "scheduled",
        count: recipients.length,
        createdAt: campaign.updatedAt,
        scheduledAt: campaign.scheduledAt
      });
      await Promise.all([writeJson("campaigns", campaigns), writeJson("events", events)]);
      return json(res, 200, { scheduled: recipients.length, scheduledAt: campaign.scheduledAt, mode: "scheduled" });
    }

    return json(res, 200, await performCampaignDelivery({ settings, contacts, campaigns, events, campaign }));
  }

  if (req.method === "POST" && url.pathname === "/api/settings") {
    const payload = await body(req);
    const current = await readJson("settings");
    const next = {
      ...current,
      brandName: String(payload.brandName || ""),
      fromName: String(payload.fromName || ""),
      fromEmail: String(payload.fromEmail || ""),
      replyTo: String(payload.replyTo || ""),
      physicalAddress: String(payload.physicalAddress || ""),
      publicBaseUrl: publicBaseUrl({ publicBaseUrl: payload.publicBaseUrl || "" }),
      trackingEnabled: payload.trackingEnabled === "on" || payload.trackingEnabled === true,
      provider: ["test", "outlook", "microsoft_graph", "resend", "sendgrid"].includes(payload.provider) ? payload.provider : "outlook",
      sendMode: payload.sendMode === "live" ? "live" : "test",
      apiKey:
        payload.apiKey && payload.apiKey !== "••••••••"
          ? String(payload.apiKey)
          : current.apiKey,
      graphTenantId: String(payload.graphTenantId ?? current.graphTenantId ?? ""),
      graphClientId: String(payload.graphClientId ?? current.graphClientId ?? ""),
      graphClientSecret:
        payload.graphClientSecret && payload.graphClientSecret !== "••••••••"
          ? String(payload.graphClientSecret)
          : current.graphClientSecret || ""
    };
    await writeJson("settings", next);
    return json(res, 200, safeSettings(next));
  }

  return false;
}

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png"
};

const trackingPixel = Buffer.from("R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==", "base64");

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || `localhost:${port}`}`);

    if (url.pathname === "/track/open") {
      const events = await readJson("events");
      events.unshift({
        id: `evt_${crypto.randomUUID()}`,
        campaignId: String(url.searchParams.get("cid") || ""),
        type: "open",
        email: String(url.searchParams.get("email") || "").toLowerCase(),
        count: 1,
        createdAt: new Date().toISOString()
      });
      await writeJson("events", events);
      res.writeHead(200, {
        "content-type": "image/gif",
        "cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate"
      });
      return res.end(trackingPixel);
    }

    if (url.pathname === "/track/click") {
      const destination = String(url.searchParams.get("url") || "");
      const events = await readJson("events");
      events.unshift({
        id: `evt_${crypto.randomUUID()}`,
        campaignId: String(url.searchParams.get("cid") || ""),
        type: "click",
        email: String(url.searchParams.get("email") || "").toLowerCase(),
        url: destination,
        count: 1,
        createdAt: new Date().toISOString()
      });
      await writeJson("events", events);
      res.writeHead(302, { location: /^https?:\/\//i.test(destination) ? destination : "/" });
      return res.end();
    }

    if (url.pathname === "/unsubscribe") {
      const email = String(url.searchParams.get("email") || "").toLowerCase();
      const contacts = await readJson("contacts");
      const contact = contacts.find((item) => item.email.toLowerCase() === email);
      if (contact) {
        contact.status = "unsubscribed";
        contact.updatedAt = new Date().toISOString();
        const events = await readJson("events");
        events.unshift({
          id: `evt_${crypto.randomUUID()}`,
          campaignId: String(url.searchParams.get("cid") || ""),
          type: "unsubscribe",
          email,
          count: 1,
          createdAt: contact.updatedAt
        });
        await Promise.all([writeJson("contacts", contacts), writeJson("events", events)]);
      }
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      return res.end(`<!doctype html><title>Unsubscribed</title><style>body{font:16px Arial;padding:60px;text-align:center;color:#17202a}main{max-width:520px;margin:auto}</style><main><h1>You’re unsubscribed.</h1><p>${escapeHtml(email)} will no longer receive marketing emails from this list.</p></main>`);
    }

    if (url.pathname.startsWith("/api/")) {
      const handled = await api(req, res, url);
      if (handled !== false) return;
      return json(res, 404, { error: "Not found." });
    }

    const requested = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const filePath = path.resolve(publicDir, requested);
    if (!filePath.startsWith(publicDir)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }
    const content = await fs.readFile(filePath);
    res.writeHead(200, {
      "content-type": mime[path.extname(filePath)] || "application/octet-stream",
      "cache-control": "no-cache"
    });
    res.end(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      res.writeHead(404);
      return res.end("Not found");
    }
    console.error(error);
    json(res, 500, { error: error.message || "Unexpected server error." });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Todd Bailey Music ESP is running at http://127.0.0.1:${port}`);
  processDueCampaigns().catch((error) => console.error("Scheduled campaign check failed:", error));
  setInterval(() => {
    processDueCampaigns().catch((error) => console.error("Scheduled campaign check failed:", error));
  }, 60_000);
});
