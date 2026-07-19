const app = document.querySelector("#app");
const toastRegion = document.querySelector("#toast-region");

const iconPaths = {
  dashboard: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  contacts: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  campaigns: '<path d="m3 11 18-5v12L3 14v-3Z"/><path d="M11.6 16 13 21H8l-1-6"/>',
  templates: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V21h-4v-.08A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63 1.7 1.7 0 0 0 10 3.08V3h4v.08A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9 1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  upload: '<path d="M12 16V4m0 0L7 9m5-5 5 5"/><path d="M4 15v5h16v-5"/>',
  send: '<path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/>',
  trend: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  code: '<path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  text: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  button: '<rect x="3" y="7" width="18" height="10" rx="3"/>',
  divider: '<path d="M3 12h18"/>',
  spacer: '<path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4"/>',
  columns: '<rect x="3" y="4" width="8" height="16" rx="1"/><rect x="13" y="4" width="8" height="16" rx="1"/>',
  imageText: '<rect x="3" y="5" width="8" height="14" rx="1"/><path d="m4.5 16 2.5-3 2 2.2 1-1.2"/><path d="M14 7h7M14 11h7M14 15h5"/>',
  desktop: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  mobile: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  arrow: '<path d="m15 18-6-6 6-6"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'
};
iconPaths.heading = iconPaths.text;
iconPaths.header = iconPaths.templates;
iconPaths.html = iconPaths.code;
iconPaths.social = iconPaths.contacts;
iconPaths.footer = iconPaths.divider;
const icon = (name, size = "") => `<svg class="nav-icon ${size}" viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name] || iconPaths.mail}</svg>`;
const esc = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const hasHtml = (value = "") => /<\/?[a-z][\s\S]*>/i.test(String(value));
const sanitizeRichHtml = (value = "") => String(value)
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/<style[\s\S]*?<\/style>/gi, "")
  .replace(/\son\w+=(["']).*?\1/gi, "")
  .replace(/\s(href|src)=(["'])\s*javascript:[\s\S]*?\2/gi, "");
const richTextHtml = (value = "") => hasHtml(value)
  ? sanitizeRichHtml(value)
  : esc(value).replace(/\n/g, "<br>");
const formatNumber = (value) => new Intl.NumberFormat().format(value || 0);
const formatDate = (value) => value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)) : "—";
const formatDateTime = (value) => value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value)) : "—";
const dateTimeLocalValue = (value = new Date(Date.now() + 60 * 60 * 1000)) => {
  const date = value instanceof Date ? value : new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};
const percent = (part, total) => total ? `${Math.round((part / total) * 100)}%` : "0%";
const initials = (contact) => `${contact.firstName?.[0] || ""}${contact.lastName?.[0] || ""}`.toUpperCase() || contact.email?.[0]?.toUpperCase() || "?";
const statusLabel = (status) => ({ subscribed: "Subscribed", needs_review: "Needs review", unsubscribed: "Unsubscribed", bounced: "Bounced", draft: "Draft", scheduled: "Scheduled", queued: "Queued", sent: "Sent", tested: "Tested", failed: "Failed", header: "Header", heading: "Heading", text: "Text", image: "Image", button: "Button", divider: "Divider", spacer: "Spacer", columns: "Columns", imageText: "Image + Text", social: "Social links", footer: "Footer", html: "HTML" }[status] || status);

let state = {
  view: "dashboard",
  contacts: [],
  lists: [],
  campaigns: [],
  events: [],
  settings: {},
  contactSearch: "",
  contactFilter: "all",
  listFilter: "all",
  selectedContactIds: [],
  audienceTab: "contacts",
  page: 1,
  modal: null,
  editor: null,
  editorSelected: 0,
  editorDevice: "desktop",
  dirty: false
};

const getList = (id) => state.lists.find((list) => list.id === id);
const listCount = (id) => state.contacts.filter((contact) => (contact.listIds || []).includes(id)).length;
const subscribedListCount = (id) => state.contacts.filter((contact) => contact.status === "subscribed" && (contact.listIds || []).includes(id)).length;
const targetedContacts = (listIds = []) => {
  const selected = new Set(listIds);
  return state.contacts.filter((contact) => contact.status === "subscribed" && (contact.listIds || []).some((id) => selected.has(id)));
};
const listChips = (ids = [], limit = 3) => {
  const found = ids.map(getList).filter(Boolean);
  return `<div class="list-chips">${found.slice(0, limit).map((list) => `<span class="list-chip" style="--chip-color:${esc(list.color)}">${esc(list.name)}</span>`).join("")}${found.length > limit ? `<span class="list-chip">+${found.length - limit}</span>` : ""}</div>`;
};

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload;
}

function toast(message, type = "") {
  const node = document.createElement("div");
  node.className = `toast ${type}`;
  node.textContent = message;
  toastRegion.append(node);
  setTimeout(() => node.remove(), 3800);
}

function defaultBlocks() {
  return [
    { id: crypto.randomUUID(), type: "header", content: "TODD BAILEY MUSIC", background: "#163f30", color: "#ffffff", align: "center", padding: 22 },
    { id: crypto.randomUUID(), type: "image", src: "", alt: "Campaign hero image", background: "#dbe8df", height: 240 },
    { id: crypto.randomUUID(), type: "heading", content: "A new sound is taking shape.", background: "#ffffff", color: "#17372b", align: "left", size: 34, padding: 36 },
    { id: crypto.randomUUID(), type: "text", content: "Hi {{first_name}},\n\nShare the heart of your story here. Keep it clear, warm, and focused on one thing you want your reader to do next.", background: "#ffffff", color: "#52645c", align: "left", size: 16, padding: 0 },
    { id: crypto.randomUUID(), type: "button", content: "Listen now", url: "https://example.com", background: "#ffffff", buttonColor: "#d8f273", color: "#17372b", align: "left", padding: 28 },
    { id: crypto.randomUUID(), type: "divider", background: "#ffffff", color: "#dfe6e2", padding: 16 },
    { id: crypto.randomUUID(), type: "text", content: "Thanks for listening,\nTodd Bailey", background: "#ffffff", color: "#52645c", align: "left", size: 14, padding: 14 },
    { id: crypto.randomUUID(), type: "social", background: "#f5f7f5", color: "#176b4d", align: "center", padding: 22, website: "https://toddbaileymusic.com/", facebook: "https://www.facebook.com/ToddBaileyMusic", instagram: "https://www.instagram.com/toddbaileymusic/", youtube: "https://www.youtube.com/channel/UCIza8wg81TL1OTY0bNcr9Fg", tiktok: "https://www.tiktok.com/@toddbaileymusic", spotify: "https://open.spotify.com/artist/1NhllLyTk5cgyWIfgjLo5M" },
    { id: crypto.randomUUID(), type: "footer", content: "{{brand_name}}", address: "{{physical_address}}", unsubscribeText: "Unsubscribe", background: "#f5f7f5", color: "#6b7872", align: "center", padding: 20 }
  ];
}

function renderEmail(blocks, design = {}) {
  const emailBackground = esc(design.emailBackground || "#edf1ed");
  const emailBorderColor = esc(design.emailBorderColor || "transparent");
  const emailBorderWidth = Number(design.emailBorderWidth || 0);
  const emailBorderRadius = Number(design.emailBorderRadius || 0);
  const emailBorder = emailBorderWidth > 0 ? `${emailBorderWidth}px solid ${emailBorderColor}` : "0";
  const parts = blocks.map((block) => {
    const bg = esc(block.background || "#ffffff");
    const color = esc(block.color || "#17372b");
    const align = esc(block.align || "left");
    const pad = Number(block.padding ?? 24);
    if (block.type === "header") return `<tr><td style="background:${bg};color:${color};padding:${pad}px;text-align:${align};font:700 15px Arial,sans-serif;letter-spacing:2px">${esc(block.content)}</td></tr>`;
    if (block.type === "heading") return `<tr><td style="background:${bg};color:${color};padding:${pad}px 38px 14px;text-align:${align};font:700 ${Number(block.size || 32)}px/1.15 Arial,sans-serif;letter-spacing:-1px">${esc(block.content)}</td></tr>`;
    if (block.type === "text") return `<tr><td style="background:${bg};color:${color};padding:${pad}px 38px;text-align:${align};font:${Number(block.size || 16)}px/1.65 Arial,sans-serif">${richTextHtml(block.content)}</td></tr>`;
    if (block.type === "image") {
      const imagePadX = Number(block.imagePaddingX ?? block.imagePadding ?? 0);
      const imagePadY = Number(block.imagePaddingY ?? block.imagePadding ?? 0);
      const radius = Number(block.radius || 0);
      const imageMarkup = block.src ? `<img src="${esc(block.src)}" alt="${esc(block.alt)}" width="${imagePadX ? "552" : "600"}" style="display:block;width:100%;max-height:${Number(block.height || 260)}px;object-fit:cover;border:0;border-radius:${radius}px">` : `<div style="height:${Number(block.height || 240)}px;border-radius:${radius}px;display:flex;align-items:center;justify-content:center;color:#5d7569;font:13px Arial,sans-serif;background:linear-gradient(135deg,#dbe8df,#eef4ef)">Add a hero image URL</div>`;
      const linkedImage = block.imageUrl ? `<a href="${esc(block.imageUrl)}" style="display:block;text-decoration:none">${imageMarkup}</a>` : imageMarkup;
      return `<tr><td style="background:${bg};padding:${imagePadY}px ${imagePadX}px;text-align:center">${linkedImage}</td></tr>`;
    }
    if (block.type === "button") return `<tr><td style="background:${bg};padding:${pad}px 38px;text-align:${align}"><a href="${esc(block.url || "#")}" style="display:inline-block;padding:13px 22px;background:${esc(block.buttonColor || "#d8f273")};color:${color};border-radius:7px;text-decoration:none;font:700 14px Arial,sans-serif">${esc(block.content)}</a></td></tr>`;
    if (block.type === "divider") return `<tr><td style="background:${bg};padding:${pad}px 38px"><div style="height:1px;background:${color}"></div></td></tr>`;
    if (block.type === "spacer") return `<tr><td style="background:${bg};font-size:0;line-height:0;height:${Number(block.height || 32)}px">&nbsp;</td></tr>`;
    if (block.type === "columns") return `<tr><td style="background:${bg};padding:${pad}px 38px"><table role="presentation" width="100%"><tr><td width="48%" valign="top" style="color:${color};font:14px/1.55 Arial,sans-serif">${esc(block.left || "Left column")}</td><td width="4%"></td><td width="48%" valign="top" style="color:${color};font:14px/1.55 Arial,sans-serif">${esc(block.right || "Right column")}</td></tr></table></td></tr>`;
    if (block.type === "imageText") {
      const imageMarkup = block.src ? `<img src="${esc(block.src)}" alt="${esc(block.alt || "")}" width="245" style="display:block;width:100%;max-width:245px;height:${Number(block.height || 220)}px;object-fit:cover;border:0;border-radius:10px">` : `<div style="height:${Number(block.height || 220)}px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#5d7569;font:13px Arial,sans-serif;background:linear-gradient(135deg,#dbe8df,#eef4ef)">Add image URL</div>`;
      const linkedImage = block.imageUrl ? `<a href="${esc(block.imageUrl)}" style="display:block;text-decoration:none">${imageMarkup}</a>` : imageMarkup;
      const imageCell = `<td class="stack-column" width="47%" valign="top" style="padding:0">${linkedImage}</td>`;
      const button = block.buttonUrl ? `<div style="margin-top:18px"><a href="${esc(block.buttonUrl)}" style="display:inline-block;padding:11px 18px;background:${esc(block.buttonColor || "#d8f273")};color:${color};border-radius:7px;text-decoration:none;font:700 13px Arial,sans-serif">${esc(block.buttonText || "Learn more")}</a></div>` : "";
      const textCell = `<td class="stack-column" width="47%" valign="middle" style="color:${color};font:${Number(block.size || 15)}px/1.6 Arial,sans-serif;text-align:${align}">${block.heading ? `<div style="font:700 22px/1.2 Arial,sans-serif;margin:0 0 10px;color:${color}">${esc(block.heading)}</div>` : ""}<div style="white-space:pre-line">${esc(block.content || "Write your text here.")}</div>${button}</td>`;
      const cells = block.imageSide === "right" ? `${textCell}<td class="stack-gap" width="6%"></td>${imageCell}` : `${imageCell}<td class="stack-gap" width="6%"></td>${textCell}`;
      return `<tr><td style="background:${bg};padding:${pad}px 38px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>${cells}</tr></table></td></tr>`;
    }
    if (block.type === "social") {
      const profiles = [
        ["website", "↗", "Website"],
        ["facebook", "f", "Facebook"],
        ["instagram", "◎", "Instagram"],
        ["youtube", "▶", "YouTube"],
        ["tiktok", "♪", "TikTok"],
        ["spotify", "●", "Spotify"]
      ].filter(([key]) => block[key]);
      const links = profiles.map(([key, symbol, label]) => `<a href="${esc(block[key])}" title="${label}" style="display:inline-block;width:34px;height:34px;margin:3px;border-radius:50%;background:${color};color:${bg};font:bold 15px/34px Arial,sans-serif;text-align:center;text-decoration:none">${symbol}</a>`).join("");
      return `<tr><td style="background:${bg};padding:${pad}px 38px;text-align:${align}">${links || `<span style="color:${color};font:12px Arial,sans-serif">Add social profile links</span>`}</td></tr>`;
    }
    if (block.type === "footer") return `<tr><td data-compliance-footer="true" style="background:${bg};color:${color};padding:${pad}px 38px;text-align:${align};font:12px/1.6 Arial,sans-serif">${esc(block.content || "{{brand_name}}")}<br>${esc(block.address || "{{physical_address}}")}<br><a href="{{unsubscribe_url}}" style="color:${color};text-decoration:underline">${esc(block.unsubscribeText || "Unsubscribe")}</a></td></tr>`;
    if (block.type === "html") return `<tr><td style="background:${bg};padding:${pad}px 38px">${block.content || ""}</td></tr>`;
    return "";
  });
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Email preview</title><style>@media only screen and (max-width:620px){.stack-column{display:block!important;width:100%!important;max-width:100%!important}.stack-column img{width:100%!important;max-width:100%!important}.stack-gap{display:block!important;width:100%!important;height:18px!important;line-height:18px!important}}</style></head><body style="margin:0;background:${emailBackground};padding:28px 12px"><div style="display:none;max-height:0;overflow:hidden">{{preview_text}}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:auto;background:#fff;border-collapse:separate;border-spacing:0;border:${emailBorder};border-radius:${emailBorderRadius}px;overflow:hidden">${parts.join("")}</table></body></html>`;
}

function shell(content, title) {
  const nav = [
    ["dashboard", "Dashboard"],
    ["contacts", "Audience"],
    ["campaigns", "Campaigns"],
    ["templates", "Templates"],
    ["settings", "Settings"]
  ];
  return `<div class="shell">
    <aside class="sidebar">
      <div class="brand"><div class="brand-mark">TB</div><span>Todd Bailey Music</span></div>
      <div class="nav-label">Workspace</div>
      <nav class="nav">${nav.map(([key, label]) => `<button class="nav-button ${state.view === key ? "active" : ""}" data-nav="${key}">${icon(key)}${label}</button>`).join("")}</nav>
      <div class="sidebar-bottom">
        <div class="sender-card">
          <p>Delivery</p>
          <strong>${esc(state.settings.provider === "outlook" ? "Outlook connected" : state.settings.provider === "microsoft_graph" ? "Graph HTML delivery" : state.settings.provider === "test" ? "Safe test mode" : state.settings.provider)}</strong>
          <span class="sender-status ${state.settings.sendMode === "live" ? "live" : ""}">${state.settings.provider === "outlook" ? "info@toddbaileymusic.com" : state.settings.sendMode === "live" ? "Live sending enabled" : "No live email sent"}</span>
        </div>
      </div>
    </aside>
    <main class="main">
      <header class="topbar">
        <div class="breadcrumbs">Workspace&nbsp; / &nbsp;<strong>${esc(title)}</strong></div>
        <div class="top-actions"><button class="btn icon-only" data-nav="settings" aria-label="Settings">${icon("settings")}</button><div class="avatar">TB</div></div>
      </header>
      <div class="content">${content}</div>
    </main>
  </div>`;
}

function dashboardView() {
  const subscribed = state.contacts.filter((c) => c.status === "subscribed").length;
  const review = state.contacts.filter((c) => c.status === "needs_review").length;
  const unsubscribed = state.contacts.filter((c) => c.status === "unsubscribed").length;
  const eventCount = (campaignId, types) => state.events
    .filter((event) => event.campaignId === campaignId && types.includes(event.type))
    .reduce((sum, event) => sum + Number(event.count || 1), 0);
  const sendEvents = state.events.filter((event) => ["graph_html_send", "send", "test_send", "outlook_queued"].includes(event.type));
  const sent = sendEvents.reduce((sum, event) => sum + Number(event.count || 0), 0) || state.campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
  const opens = state.events.filter((event) => event.type === "open").reduce((sum, event) => sum + Number(event.count || 1), 0);
  const clicks = state.events.filter((event) => event.type === "click").reduce((sum, event) => sum + Number(event.count || 1), 0);
  const unsubscribeEvents = state.events.filter((event) => event.type === "unsubscribe").reduce((sum, event) => sum + Number(event.count || 1), 0);
  const unsubTotal = Math.max(unsubscribed, unsubscribeEvents);
  const campaignRows = state.campaigns
    .map((campaign) => {
      const campaignSendEvents = sendEvents.filter((event) => event.campaignId === campaign.id);
      const recipients = campaignSendEvents.reduce((sum, event) => sum + Number(event.count || 0), 0) || Number(campaign.sentCount || campaign.queuedCount || 0);
      const lastEvent = [...campaignSendEvents].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      return {
        campaign,
        recipients,
        sentAt: lastEvent?.createdAt || campaign.sentAt || campaign.queuedAt || campaign.updatedAt,
        opens: eventCount(campaign.id, ["open"]),
        clicks: eventCount(campaign.id, ["click"]),
        unsubscribes: eventCount(campaign.id, ["unsubscribe"])
      };
    })
    .filter((row) => row.recipients || row.opens || row.clicks || row.unsubscribes || ["sent", "queued", "tested"].includes(row.campaign.status))
    .sort((a, b) => new Date(b.sentAt || 0) - new Date(a.sentAt || 0))
    .slice(0, 8);
  const maxRecipients = Math.max(1, ...campaignRows.map((row) => row.recipients));
  const metrics = [
    ["Audience", formatNumber(state.contacts.length), `${state.lists.length} organized lists`, "contacts"],
    ["Sends", formatNumber(sent), `${campaignRows.length} campaign${campaignRows.length === 1 ? "" : "s"} with activity`, "send"],
    ["Opens", formatNumber(opens), `${percent(opens, sent)} open rate`, "eye"],
    ["Clicks", formatNumber(clicks), `${percent(clicks, sent)} click rate`, "trend"],
    ["Unsubscribes", formatNumber(unsubTotal), `${percent(unsubTotal, sent || state.contacts.length)} unsubscribe rate`, "contacts", "unsubscribed"]
  ];
  const content = `
    <div class="page-head"><div><div class="eyebrow">Good afternoon</div><h1>Campaign analytics</h1><p class="subtitle">Track when campaigns send, how many people receive them, and engagement from opens, clicks, and unsubscribes.</p></div><button class="btn primary" data-action="new-campaign">${icon("plus")}Create campaign</button></div>
    <section class="metrics analytics-metrics">${metrics.map(([label,value,note,ic,extra]) => `<article class="metric-card ${extra || ""}"><div class="metric-top"><span>${label}</span><span class="metric-icon">${icon(ic)}</span></div><div class="metric-value">${value}</div><div class="metric-note">${note}</div></article>`).join("")}</section>
    <section class="dashboard-grid">
      <article class="panel">
        <div class="panel-head"><div><h2>Send timeline</h2><p class="panel-subtitle">Recipients by campaign send date and time</p></div><span class="badge subscribed">Recent sends</span></div>
        <div class="send-timeline">${campaignRows.map((row) => `<div class="timeline-row"><div><strong>${esc(row.campaign.name)}</strong><span>${formatDateTime(row.sentAt)}</span></div><div class="timeline-track"><i style="width:${Math.max(4, Math.round((row.recipients / maxRecipients) * 100))}%"></i></div><b>${formatNumber(row.recipients)}</b></div>`).join("") || `<div class="empty-state"><h3>No send activity yet</h3><p>Send a campaign to populate timeline analytics.</p></div>`}</div>
      </article>
      <article class="panel">
        <div class="panel-head"><div><h2>Audience health</h2><p class="panel-subtitle">Permission and opt-out status</p></div></div>
        <div class="quick-list">
          <button class="quick-action" data-nav="contacts"><span class="metric-icon">${icon("check")}</span><span><strong>${formatNumber(subscribed)} subscribed</strong><span>Eligible for campaigns</span></span></button>
          <button class="quick-action" data-nav="contacts"><span class="metric-icon">${icon("contacts")}</span><span><strong>${formatNumber(review)} needs review</strong><span>Confirm permission before sending</span></span></button>
          <button class="quick-action danger" data-nav="contacts"><span class="metric-icon">${icon("contacts")}</span><span><strong>${formatNumber(unsubscribed)} unsubscribed</strong><span>Suppressed from future sends</span></span></button>
        </div>
      </article>
    </section>`;
  const table = `<section class="panel table-panel analytics-table"><div class="panel-head padded"><div><h2>Campaign performance</h2><p class="panel-subtitle">Sends, opens, clicks, and unsubscribe activity by campaign.</p></div></div><div class="table-wrap"><table><thead><tr><th>Campaign</th><th>Sent day & time</th><th>Recipients</th><th>Opens</th><th>Clicks</th><th>Unsubscribes</th></tr></thead><tbody>${campaignRows.map((row) => `<tr><td><strong>${esc(row.campaign.name)}</strong><br><span class="muted">${esc(row.campaign.subject || "No subject")}</span></td><td>${formatDateTime(row.sentAt)}</td><td>${formatNumber(row.recipients)}</td><td>${formatNumber(row.opens)} <span class="muted">${percent(row.opens, row.recipients)}</span></td><td>${formatNumber(row.clicks)} <span class="muted">${percent(row.clicks, row.recipients)}</span></td><td><span class="badge ${row.unsubscribes ? "unsubscribed" : "subscribed"}">${formatNumber(row.unsubscribes)}</span></td></tr>`).join("") || `<tr><td colspan="6"><div class="empty-state"><h3>No campaign analytics yet</h3><p>Campaign sends will appear here with send time, recipient count, opens, clicks, and unsubscribes.</p></div></td></tr>`}</tbody></table></div></section>`;
  return shell(`${content}${table}`, "Dashboard");
}

function contactsView() {
  const search = state.contactSearch.toLowerCase();
  const filtered = state.contacts.filter((contact) => {
    const matchesText = !search || [contact.email, contact.firstName, contact.lastName, contact.company, contact.city, contact.state].some((value) => String(value || "").toLowerCase().includes(search));
    const matchesStatus = state.contactFilter === "all" || contact.status === state.contactFilter;
    const matchesList = state.listFilter === "all" || (contact.listIds || []).includes(state.listFilter);
    return matchesText && matchesStatus && matchesList;
  });
  const perPage = 25;
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  state.page = Math.min(state.page, pages);
  const shown = filtered.slice((state.page - 1) * perPage, state.page * perPage);
  const selected = new Set(state.selectedContactIds || []);
  const shownSelected = shown.length > 0 && shown.every((contact) => selected.has(contact.id));
  const filteredSelectedCount = filtered.filter((contact) => selected.has(contact.id)).length;
  const stats = ["subscribed", "needs_review", "unsubscribed"].map((status) => [status, state.contacts.filter((c) => c.status === status).length]);
  const selectionBanner = filteredSelectedCount ? `<div class="selection-banner"><span>${formatNumber(filteredSelectedCount)} contact${filteredSelectedCount === 1 ? "" : "s"} selected${filteredSelectedCount === shown.length && filtered.length > shown.length ? " on this page" : ""}.</span>${filteredSelectedCount < filtered.length ? `<button class="link-button" data-action="select-filtered">Select all ${formatNumber(filtered.length)} contacts matching this view</button>` : `<strong>All ${formatNumber(filtered.length)} matching contacts selected.</strong>`}<button class="link-button" data-action="clear-selection">Clear selection</button></div>` : "";
  const contactTable = `
    <div class="toolbar">
      <div class="search">${icon("search")}<input id="contact-search" value="${esc(state.contactSearch)}" placeholder="Search name, email, company, city…"></div>
      <select id="list-filter" aria-label="Filter by list"><option value="all">All lists</option>${state.lists.map((list) => `<option value="${list.id}" ${state.listFilter === list.id ? "selected" : ""}>${esc(list.name)} (${listCount(list.id)})</option>`).join("")}</select>
      <select id="contact-filter" aria-label="Filter contacts"><option value="all">All statuses</option>${["subscribed","needs_review","unsubscribed","bounced"].map((s) => `<option value="${s}" ${state.contactFilter === s ? "selected" : ""}>${statusLabel(s)}</option>`).join("")}</select>
      <button class="btn" data-action="bulk-list">Add to list</button>
      <button class="btn" data-action="permission">${icon("check")}Confirm permission</button>
    </div>
    <section class="panel table-panel">
      ${selectionBanner}
      <div class="table-wrap"><table>
        <thead><tr><th><input type="checkbox" id="select-all" ${shownSelected ? "checked" : ""}></th><th>Contact</th><th>Company</th><th>Lists</th><th>Score</th><th>Status</th><th></th></tr></thead>
        <tbody>${shown.map((c) => `<tr><td><input class="contact-check" type="checkbox" value="${c.id}" ${selected.has(c.id) ? "checked" : ""}></td><td><div class="contact-cell"><span class="contact-avatar">${esc(initials(c))}</span><span><strong>${esc([c.firstName,c.lastName].filter(Boolean).join(" ") || c.email.split("@")[0])}</strong><span>${esc(c.email)}</span></span></div></td><td>${esc(c.company || "—")}</td><td>${listChips(c.listIds)}</td><td>${Number(c.score || 0)}</td><td><span class="badge ${c.status}">${statusLabel(c.status)}</span></td><td><button class="btn small" data-edit-contact="${c.id}">Edit</button></td></tr>`).join("") || `<tr><td colspan="7"><div class="empty-state"><h3>No contacts match</h3><p>Try a different search, status, or list filter.</p></div></td></tr>`}</tbody>
      </table></div>
      <div class="pagination"><span>Showing ${filtered.length ? (state.page - 1) * perPage + 1 : 0}–${Math.min(state.page * perPage, filtered.length)} of ${formatNumber(filtered.length)}</span><div><button class="btn small" data-page="${state.page - 1}" ${state.page <= 1 ? "disabled" : ""}>Previous</button> <button class="btn small" data-page="${state.page + 1}" ${state.page >= pages ? "disabled" : ""}>Next</button></div></div>
    </section>`;
  const listCards = `<section class="list-grid">${state.lists.map((list) => `<article class="panel list-card">
    <div class="list-card-top"><div class="list-card-title"><i class="list-color" style="--list-color:${esc(list.color)}"></i><div><h3>${esc(list.name)}</h3><p>${esc(list.description || "Custom audience list")}</p></div></div><button class="btn small" data-edit-list="${list.id}">Edit</button></div>
    <div class="list-counts"><div><strong>${formatNumber(listCount(list.id))}</strong><span>contacts</span></div><div><strong>${formatNumber(subscribedListCount(list.id))}</strong><span>subscribed</span></div></div>
    <div class="list-actions"><button class="btn small soft" data-view-list="${list.id}">View contacts</button><button class="btn small" data-campaign-list="${list.id}">Create campaign</button></div>
  </article>`).join("")}</section>`;
  const content = `
    <div class="page-head"><div><div class="eyebrow">Audience</div><h1>People, organized</h1><p class="subtitle">${formatNumber(state.contacts.length)} unique contacts across ${state.lists.length} lists and ${formatNumber(state.contacts.reduce((sum,c) => sum + (c.listIds || []).length, 0))} memberships.</p></div><div style="display:flex;gap:9px"><button class="btn" data-action="add-contact">${icon("plus")}Add contact</button><button class="btn" data-action="import">${icon("upload")}Import CSV</button><button class="btn primary" data-action="add-list">${icon("plus")}New list</button></div></div>
    <section class="metrics" style="grid-template-columns:repeat(3,1fr)">${stats.map(([status,count]) => `<article class="metric-card"><div class="metric-top"><span>${statusLabel(status)}</span><span class="badge ${status}">${statusLabel(status)}</span></div><div class="metric-value">${formatNumber(count)}</div><div class="metric-note">${status === "needs_review" ? "Not eligible until permission is confirmed" : "Current audience status"}</div></article>`).join("")}</section>
    <div class="view-tabs"><button class="view-tab ${state.audienceTab === "contacts" ? "active" : ""}" data-audience-tab="contacts">Contacts</button><button class="view-tab ${state.audienceTab === "lists" ? "active" : ""}" data-audience-tab="lists">Lists <span class="badge draft">${state.lists.length}</span></button></div>
    ${state.audienceTab === "contacts" ? contactTable : listCards}`;
  return shell(content, "Audience");
}

function campaignsView() {
  const cards = state.campaigns.map((campaign) => `<article class="panel campaign-card">
    <div class="campaign-thumb"><div class="email-mini"><div class="mini-hero"></div><div class="mini-line"></div><div class="mini-line short"></div><div class="mini-button"></div></div></div>
    <div class="campaign-body"><h3>${esc(campaign.name)}</h3><p>${esc(campaign.subject || "No subject line yet")}</p>${listChips(campaign.listIds || [],2)}<div class="campaign-meta" style="margin-top:13px"><span class="badge ${campaign.status === "tested" ? "subscribed" : campaign.status}">${statusLabel(campaign.status)}</span><div class="campaign-actions"><button class="btn small soft" data-duplicate-campaign="${campaign.id}">Duplicate</button><button class="btn small" data-edit-campaign="${campaign.id}">Edit</button></div></div></div>
  </article>`).join("");
  const content = `
    <div class="page-head"><div><div class="eyebrow">Campaigns</div><h1>Make something worth opening</h1><p class="subtitle">Draft, test, and send from one focused workflow.</p></div><button class="btn primary" data-action="new-campaign">${icon("plus")}Create campaign</button></div>
    ${state.campaigns.length ? `<section class="campaign-grid">${cards}</section>` : `<section class="panel empty-state"><div class="empty-icon">${icon("campaigns")}</div><h2>Your first campaign starts here</h2><p>Build a polished, responsive email from reusable content blocks, then send yourself a test.</p><button class="btn primary" data-action="new-campaign">Start designing</button></section>`}`;
  return shell(content, "Campaigns");
}

function templatesView() {
  const templates = [
    ["Fresh release", "Bold hero, clear story, one strong call to action.", "#163f30", "#d8f273"],
    ["Studio note", "A personal, editorial layout for updates and letters.", "#f4e6d6", "#8a4c2b"],
    ["Event invite", "Feature the date, venue, and RSVP without clutter.", "#1f315a", "#f3a44a"]
  ];
  const content = `<div class="page-head"><div><div class="eyebrow">Templates</div><h1>Start with a good rhythm</h1><p class="subtitle">Flexible foundations you can make entirely your own.</p></div></div>
    <section class="campaign-grid">${templates.map(([name,desc,color,accent],i) => `<article class="panel campaign-card"><div class="campaign-thumb" style="background:${color}"><div class="email-mini"><div class="mini-hero" style="background:${accent}"></div><div class="mini-line"></div><div class="mini-line short"></div><div class="mini-button" style="background:${color}"></div></div></div><div class="campaign-body"><h3>${name}</h3><p>${desc}</p><div class="campaign-meta"><span class="badge draft">Responsive</span><button class="btn small" data-template="${i}">Use template</button></div></div></article>`).join("")}</section>`;
  return shell(content, "Templates");
}

function settingsView() {
  const s = state.settings;
  const content = `<div class="page-head"><div><div class="eyebrow">Settings</div><h1>Sending & identity</h1><p class="subtitle">Keep your brand consistent and your delivery credentials private.</p></div></div>
    <form id="settings-form" class="panel" style="max-width:760px;display:grid;gap:17px">
      <div><h2>Brand identity</h2><p class="panel-subtitle">Shown to recipients and used in compliance footers.</p></div>
      <div class="field-row"><div class="field"><label for="brandName">Brand name</label><input id="brandName" name="brandName" value="${esc(s.brandName)}" required></div><div class="field"><label for="fromName">From name</label><input id="fromName" name="fromName" value="${esc(s.fromName)}" required></div></div>
      <div class="field-row"><div class="field"><label for="fromEmail">From email</label><input id="fromEmail" name="fromEmail" type="email" value="${esc(s.fromEmail)}" placeholder="hello@yourdomain.com" required></div><div class="field"><label for="replyTo">Reply-to email</label><input id="replyTo" name="replyTo" type="email" value="${esc(s.replyTo)}" placeholder="replies@yourdomain.com"></div></div>
      <div class="field"><label for="physicalAddress">Physical mailing address</label><input id="physicalAddress" name="physicalAddress" value="${esc(s.physicalAddress)}" placeholder="Required for commercial email" required><small>Included in every campaign footer.</small></div>
      <div class="field"><label for="publicBaseUrl">Public ESP site URL</label><input id="publicBaseUrl" name="publicBaseUrl" type="url" value="${esc(s.publicBaseUrl || "")}" placeholder="https://toddbaileymusic.com"><small>Use the site origin only, not the full unsubscribe page. The ESP adds /unsubscribe automatically.</small></div>
      <label class="check-row"><input name="trackingEnabled" type="checkbox" ${s.trackingEnabled ? "checked" : ""}><span>Enable open/click tracking only after /track/open and /track/click are publicly routed to this ESP app. Leave off when using only WordPress unsubscribe pages.</span></label>
      ${s.sendMode === "live" && (!s.publicBaseUrl || /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(s.publicBaseUrl || "")) ? `<div class="notice"><strong>Unsubscribe setup needed before live sends.</strong><br>Add the HTTPS URL where this ESP is deployed, then emails will link to that public /unsubscribe page.</div>` : ""}
      <hr style="border:0;border-top:1px solid var(--line);width:100%">
      <div><h2>Delivery provider</h2><p class="panel-subtitle">Use test mode while designing. Switch to live only after your sending domain is verified.</p></div>
      <div class="field-row"><div class="field"><label for="provider">Provider</label><select id="provider" name="provider"><option value="outlook" ${s.provider === "outlook" ? "selected" : ""}>Outlook automation — connected, plain text</option><option value="microsoft_graph" ${s.provider === "microsoft_graph" ? "selected" : ""}>Microsoft Graph — HTML + batches</option><option value="test" ${s.provider === "test" ? "selected" : ""}>Safe test mode</option><option value="resend" ${s.provider === "resend" ? "selected" : ""}>Resend — HTML delivery</option><option value="sendgrid" ${s.provider === "sendgrid" ? "selected" : ""}>SendGrid — HTML delivery</option></select></div><div class="field"><label for="sendMode">Sending mode</label><select id="sendMode" name="sendMode"><option value="test" ${s.sendMode === "test" ? "selected" : ""}>Test — no external delivery</option><option value="live" ${s.sendMode === "live" ? "selected" : ""}>Live — external delivery</option></select></div></div>
      ${s.provider === "outlook" ? `<div class="notice green"><strong>Connected as info@toddbaileymusic.com</strong><br>The current connector queues one-to-one plain-text messages. Microsoft Graph below is the Outlook path for HTML and batched delivery.</div>` : ""}
      <div class="panel" style="padding:16px;box-shadow:none;background:#f8faf8"><div style="margin-bottom:12px"><h3>Microsoft Graph HTML delivery</h3><p class="panel-subtitle">Requires a Microsoft Entra app with Mail.Send application permission and admin consent.</p></div><div class="field-row"><div class="field"><label for="graphTenantId">Tenant ID</label><input id="graphTenantId" name="graphTenantId" value="${esc(s.graphTenantId || "")}" placeholder="Directory (tenant) ID"></div><div class="field"><label for="graphClientId">Client ID</label><input id="graphClientId" name="graphClientId" value="${esc(s.graphClientId || "")}" placeholder="Application (client) ID"></div></div><div class="field"><label for="graphClientSecret">Client secret</label><input id="graphClientSecret" name="graphClientSecret" type="password" value="${esc(s.graphClientSecret || "")}" autocomplete="off" placeholder="Client secret value"><small>Prefer MS_TENANT_ID, MS_CLIENT_ID, and MS_CLIENT_SECRET environment variables in production.</small></div></div>
      ${["resend","sendgrid"].includes(s.provider) ? `<div class="field"><label for="apiKey">Provider API key</label><input id="apiKey" name="apiKey" type="password" value="${esc(s.apiKey)}" autocomplete="off"><small>Stored in the local data directory. For production, prefer the COURIERLY_API_KEY environment variable.</small></div>` : ""}
      ${s.provider === "microsoft_graph" ? `<div class="notice"><strong>Graph delivery batches 20 personalized HTML messages per request.</strong><br>The platform sends each recipient as an individual To address—never a bulk BCC—and keeps unsubscribe footers and merge tags intact.</div>` : ""}
      <div><button class="btn primary" type="submit">Save settings</button></div>
    </form>`;
  return shell(content, "Settings");
}

function modalMarkup() {
  if (!state.modal) return "";
  if (state.modal === "import") return `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>Import contacts</h2><p class="panel-subtitle">CSV files stay in this local workspace.</p></div><button class="close-button" data-close>&times;</button></div><form id="import-form"><div class="modal-body"><div class="field"><label>CSV file</label><input id="csv-file" type="file" accept=".csv,text/csv" required></div><div class="field"><label>Add imported contacts to</label><select name="listId" required><option value="">Choose a list…</option>${state.lists.map((list) => `<option value="${list.id}" ${state.listFilter === list.id ? "selected" : ""}>${esc(list.name)}</option>`).join("")}</select></div><div class="notice">New contacts are imported as “Needs review.” Existing contacts are added to the chosen list without creating duplicates.</div></div><div class="modal-foot"><button class="btn" type="button" data-close>Cancel</button><button class="btn primary" type="submit">Import contacts</button></div></form></div></div>`;
  if (state.modal === "list") {
    const list = state.editingList || { name: "", description: "", color: "#176b4d" };
    return `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>${state.editingList ? "Edit list" : "Create a list"}</h2><p class="panel-subtitle">Use lists to organize contacts and target campaigns.</p></div><button class="close-button" data-close>&times;</button></div><form id="list-form"><div class="modal-body"><div class="field"><label>List name</label><input name="name" value="${esc(list.name)}" required></div><div class="field"><label>Description</label><textarea name="description" rows="3">${esc(list.description)}</textarea></div><div class="field"><label>List color</label><div class="color-row"><input name="color" type="color" value="${esc(list.color)}"><input value="${esc(list.color)}" disabled></div></div></div><div class="modal-foot"><button class="btn" type="button" data-close>Cancel</button><button class="btn primary" type="submit">${state.editingList ? "Save changes" : "Create list"}</button></div></form></div></div>`;
  }
  if (state.modal === "contact") {
    const contact = state.editingContact || { email: "", firstName: "", lastName: "", company: "", phone: "", city: "", state: "", country: "", status: "needs_review", listIds: [] };
    return `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>${state.editingContact ? "Edit contact" : "Add contact"}</h2><p class="panel-subtitle">Update contact details and list memberships together.</p></div><button class="close-button" data-close>&times;</button></div><form id="contact-form"><div class="modal-body">
      <div class="field-row"><div class="field"><label>First name</label><input name="firstName" value="${esc(contact.firstName)}"></div><div class="field"><label>Last name</label><input name="lastName" value="${esc(contact.lastName)}"></div></div>
      <div class="field"><label>Email address</label><input name="email" type="email" value="${esc(contact.email)}" required></div>
      <div class="field-row"><div class="field"><label>Company</label><input name="company" value="${esc(contact.company)}"></div><div class="field"><label>Phone</label><input name="phone" value="${esc(contact.phone)}"></div></div>
      <div class="field-row"><div class="field"><label>City</label><input name="city" value="${esc(contact.city)}"></div><div class="field"><label>State</label><input name="state" value="${esc(contact.state)}"></div></div>
      <div class="field"><label>Status</label><select name="status">${["needs_review","subscribed","unsubscribed","bounced"].map((status) => `<option value="${status}" ${contact.status === status ? "selected" : ""}>${statusLabel(status)}</option>`).join("")}</select></div>
      <div class="field"><label>List memberships</label><div class="checklist">${state.lists.map((list) => `<label class="checklist-row"><input type="checkbox" name="listIds" value="${list.id}" ${(contact.listIds || []).includes(list.id) ? "checked" : ""}><i class="list-color" style="--list-color:${esc(list.color)}"></i><span>${esc(list.name)}</span><small>${formatNumber(listCount(list.id))}</small></label>`).join("")}</div></div>
      ${!state.editingContact ? `<div class="notice">New contacts default to “Needs review.” Choose Subscribed only when you have documented marketing permission.</div>` : ""}
    </div><div class="modal-foot"><button class="btn" type="button" data-close>Cancel</button><button class="btn primary" type="submit">${state.editingContact ? "Save contact" : "Add contact"}</button></div></form></div></div>`;
  }
  if (state.modal === "bulk-list") return `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>Add contacts to a list</h2><p class="panel-subtitle">${state.bulkContactIds?.length || 0} selected contacts</p></div><button class="close-button" data-close>&times;</button></div><form id="bulk-list-form"><div class="modal-body"><div class="field"><label>Destination list</label><select name="listId" required><option value="">Choose a list…</option>${state.lists.map((list) => `<option value="${list.id}">${esc(list.name)}</option>`).join("")}</select></div></div><div class="modal-foot"><button class="btn" type="button" data-close>Cancel</button><button class="btn primary" type="submit">Add to list</button></div></form></div></div>`;
  if (state.modal === "permission") return `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>Confirm marketing permission</h2><p class="panel-subtitle">This changes selected contacts to Subscribed.</p></div><button class="close-button" data-close>&times;</button></div><form id="permission-form"><div class="modal-body"><div class="notice">Only confirm contacts who knowingly agreed to receive marketing email. Purchased, scraped, or unrelated CRM contacts should not be marked subscribed.</div><label class="check-row"><input id="permission-check" type="checkbox" required><span>I have a documented, lawful basis to send marketing email to each selected contact.</span></label></div><div class="modal-foot"><button class="btn" type="button" data-close>Cancel</button><button class="btn primary" type="submit">Confirm selected</button></div></form></div></div>`;
  if (state.modal === "send") {
    const eligible = targetedContacts(state.editor.listIds || []).length;
    const selectedNames = (state.editor.listIds || []).map(getList).filter(Boolean).map((list) => list.name);
    return `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>Review campaign delivery</h2><p class="panel-subtitle">Targeting ${selectedNames.length} list${selectedNames.length === 1 ? "" : "s"}.</p></div><button class="close-button" data-close>&times;</button></div><form id="send-form"><div class="modal-body"><div class="recipient-summary"><strong>${formatNumber(eligible)} unique subscribed recipients</strong><span>${esc(selectedNames.join(", ") || "No lists selected")}</span></div><div class="notice ${state.settings.sendMode === "test" ? "green" : ""}">${state.settings.sendMode === "test" ? "Safe test mode is on. This will simulate delivery without contacting recipients." : state.settings.provider === "outlook" ? "This campaign will be converted to plain text and queued for one-to-one Outlook delivery from info@toddbaileymusic.com." : state.settings.provider === "microsoft_graph" ? "Microsoft Graph will deliver the designed HTML in batches of 20 personalized one-to-one messages from info@toddbaileymusic.com." : "Live sending is enabled. Submitting this form will send external email through your provider."}</div><div class="schedule-box"><div class="builder-section-title">Delivery time</div><label class="check-row"><input name="scheduleMode" type="radio" value="now" checked><span>Send now</span></label><label class="check-row"><input name="scheduleMode" type="radio" value="later"><span>Schedule for later</span></label><div class="field"><label>Scheduled day and time</label><input name="scheduledAtLocal" type="datetime-local" value="${dateTimeLocalValue()}"><small>The campaign will send when this local server is running at or after that time.</small></div></div><label class="check-row"><input name="permissionConfirmed" type="checkbox" required><span>I confirm every eligible recipient opted in, the sender details are accurate, and this campaign includes a working unsubscribe option.</span></label><div class="field"><label>Type SEND to confirm</label><input name="confirmation" autocomplete="off" required></div></div><div class="modal-foot"><button class="btn" type="button" data-close>Cancel</button><button class="btn primary" type="submit" ${!eligible ? "disabled" : ""}>${state.settings.provider === "outlook" && state.settings.sendMode === "live" ? "Queue or schedule Outlook" : state.settings.provider === "microsoft_graph" && state.settings.sendMode === "live" ? "Send or schedule HTML" : state.settings.sendMode === "live" ? "Send or schedule campaign" : "Run or schedule test"}</button></div></form></div></div>`;
  }
  return "";
}

function render() {
  if (state.editor) {
    app.innerHTML = builderView();
    bindBuilder();
    updatePreview();
    return;
  }
  const views = { dashboard: dashboardView, contacts: contactsView, campaigns: campaignsView, templates: templatesView, settings: settingsView };
  app.innerHTML = `${(views[state.view] || dashboardView)()}${modalMarkup()}`;
  bindCommon();
}

function editorControl(block) {
  if (!block) return `<div class="builder-section"><div class="help-card">Select a content block to edit it.</div></div>`;
  const textControl = block.type === "text"
    ? `<div class="field"><label>Content</label><div class="wysiwyg-toolbar" role="toolbar" aria-label="Text formatting"><button type="button" data-rich-command="bold"><strong>B</strong></button><button type="button" data-rich-command="italic"><em>I</em></button><button type="button" data-rich-command="underline"><u>U</u></button><button type="button" data-rich-command="insertUnorderedList">• List</button><button type="button" data-rich-command="createLink">Link</button><button type="button" data-rich-command="removeFormat">Clear</button></div><div class="wysiwyg-editor" contenteditable="true" data-rich-prop="content" role="textbox" aria-multiline="true">${richTextHtml(block.content)}</div><small>Highlight text, then use Link to make it clickable. Merge tags like {{first_name}} still work.</small></div>`
    : ["header","heading","button","html"].includes(block.type)
      ? `<div class="field"><label>Content</label><textarea data-prop="content" rows="${block.type === "html" ? 6 : 3}">${esc(block.content)}</textarea></div>`
      : "";
  const imageControls = block.type === "image" ? `<div class="field"><label>Image URL</label><input data-prop="src" value="${esc(block.src)}" placeholder="https://…"></div><div class="field"><label>Image link URL</label><input data-prop="imageUrl" value="${esc(block.imageUrl || "")}" placeholder="Optional https://…"><small>When set, clicking the image opens this link.</small></div><div class="field"><label>Alt text</label><input data-prop="alt" value="${esc(block.alt)}"></div><div class="field"><label>Image height</label><input data-prop="height" type="range" min="120" max="500" value="${Number(block.height || 240)}"></div><div class="field"><label>Horizontal padding — ${Number(block.imagePaddingX ?? block.imagePadding ?? 0)}px</label><input data-prop="imagePaddingX" type="range" min="0" max="96" value="${Number(block.imagePaddingX ?? block.imagePadding ?? 0)}"><small>Use 0 for full-width. Add horizontal padding for side margins.</small></div><div class="field"><label>Vertical padding — ${Number(block.imagePaddingY ?? block.imagePadding ?? 0)}px</label><input data-prop="imagePaddingY" type="range" min="0" max="96" value="${Number(block.imagePaddingY ?? block.imagePadding ?? 0)}"></div><div class="field"><label>Rounded corners — ${Number(block.radius || 0)}px</label><input data-prop="radius" type="range" min="0" max="32" value="${Number(block.radius || 0)}"></div>` : "";
  const spacerControls = block.type === "spacer" ? `<div class="field"><label>Spacer height — ${Number(block.height || 32)}px</label><input data-prop="height" type="range" min="4" max="120" value="${Number(block.height || 32)}"></div><div class="notice green">Use spacers to add clean vertical breathing room between sections without adding visible text or lines.</div>` : "";
  const buttonControls = block.type === "button" ? `<div class="field"><label>Destination URL</label><input data-prop="url" value="${esc(block.url)}"></div><div class="field"><label>Button color</label><div class="color-row"><input data-prop="buttonColor" type="color" value="${esc(block.buttonColor || "#d8f273")}"><input data-prop="buttonColor" value="${esc(block.buttonColor || "#d8f273")}"></div></div>` : "";
  const columnsControls = block.type === "columns" ? `<div class="field"><label>Left column</label><textarea data-prop="left" rows="4">${esc(block.left)}</textarea></div><div class="field"><label>Right column</label><textarea data-prop="right" rows="4">${esc(block.right)}</textarea></div>` : "";
  const imageTextControls = block.type === "imageText" ? `<div class="field"><label>Image side</label><select data-prop="imageSide"><option value="left" ${block.imageSide !== "right" ? "selected" : ""}>Image left, text right</option><option value="right" ${block.imageSide === "right" ? "selected" : ""}>Text left, image right</option></select></div><div class="field"><label>Image URL</label><input data-prop="src" value="${esc(block.src || "")}" placeholder="https://…"></div><div class="field"><label>Image link URL</label><input data-prop="imageUrl" value="${esc(block.imageUrl || "")}" placeholder="Optional https://…"><small>When set, clicking the image opens this link.</small></div><div class="field"><label>Alt text</label><input data-prop="alt" value="${esc(block.alt || "")}"></div><div class="field"><label>Image height — ${Number(block.height || 220)}px</label><input data-prop="height" type="range" min="140" max="420" value="${Number(block.height || 220)}"></div><div class="field"><label>Heading</label><input data-prop="heading" value="${esc(block.heading || "")}"></div><div class="field"><label>Text</label><textarea data-prop="content" rows="5">${esc(block.content || "")}</textarea></div><div class="field"><label>Button text</label><input data-prop="buttonText" value="${esc(block.buttonText || "")}" placeholder="Optional"></div><div class="field"><label>Button URL</label><input data-prop="buttonUrl" value="${esc(block.buttonUrl || "")}" placeholder="Optional https://…"></div><div class="field"><label>Button color</label><div class="color-row"><input data-prop="buttonColor" type="color" value="${esc(block.buttonColor || "#d8f273")}"><input data-prop="buttonColor" value="${esc(block.buttonColor || "#d8f273")}"></div></div>` : "";
  const socialControls = block.type === "social" ? `<div class="field"><label>Website</label><input data-prop="website" value="${esc(block.website)}" placeholder="https://…"></div><div class="field"><label>Facebook</label><input data-prop="facebook" value="${esc(block.facebook)}" placeholder="https://facebook.com/…"></div><div class="field"><label>Instagram</label><input data-prop="instagram" value="${esc(block.instagram)}" placeholder="https://instagram.com/…"></div><div class="field"><label>YouTube</label><input data-prop="youtube" value="${esc(block.youtube)}" placeholder="https://youtube.com/…"></div><div class="field"><label>TikTok</label><input data-prop="tiktok" value="${esc(block.tiktok)}" placeholder="https://tiktok.com/@…"></div><div class="field"><label>Spotify</label><input data-prop="spotify" value="${esc(block.spotify)}" placeholder="https://open.spotify.com/…"></div>` : "";
  const footerControls = block.type === "footer" ? `<div class="field"><label>Sender or brand line</label><input data-prop="content" value="${esc(block.content)}"></div><div class="field"><label>Mailing address</label><input data-prop="address" value="${esc(block.address)}"><small>Use {{physical_address}} to follow Settings automatically.</small></div><div class="field"><label>Unsubscribe link text</label><input data-prop="unsubscribeText" value="${esc(block.unsubscribeText)}"></div><div class="notice green">The unsubscribe destination is inserted securely for each recipient and cannot be removed from live sends.</div>` : "";
  const sizeControl = ["heading","text"].includes(block.type) ? `<div class="field"><label>Text size — ${Number(block.size || 16)}px</label><input data-prop="size" type="range" min="12" max="48" value="${Number(block.size || 16)}"></div>` : "";
  return `<div class="builder-section"><div class="builder-section-title">${statusLabel(block.type)} settings</div><div style="display:grid;gap:12px">
    ${textControl}${imageControls}${spacerControls}${buttonControls}${columnsControls}${imageTextControls}${socialControls}${footerControls}${sizeControl}
    ${!["image","spacer"].includes(block.type) ? `<div class="field"><label>Text color</label><div class="color-row"><input data-prop="color" type="color" value="${esc(block.color || "#17372b")}"><input data-prop="color" value="${esc(block.color || "#17372b")}"></div></div>` : ""}
    <div class="field"><label>Background</label><div class="color-row"><input data-prop="background" type="color" value="${esc(block.background || "#ffffff")}"><input data-prop="background" value="${esc(block.background || "#ffffff")}"></div></div>
    ${!["image","spacer"].includes(block.type) ? `<div class="field"><label>Alignment</label><select data-prop="align"><option value="left" ${block.align === "left" ? "selected" : ""}>Left</option><option value="center" ${block.align === "center" ? "selected" : ""}>Center</option><option value="right" ${block.align === "right" ? "selected" : ""}>Right</option></select></div>` : ""}
    ${block.type !== "spacer" ? `<div class="field"><label>Spacing — ${Number(block.padding ?? 24)}px</label><input data-prop="padding" type="range" min="0" max="64" value="${Number(block.padding ?? 24)}"></div>` : ""}
    <button class="btn danger small" data-builder-action="delete">Remove block</button>
  </div></div>`;
}

function builderView() {
  const c = state.editor;
  const selected = c.blocks[state.editorSelected];
  const blockTools = [["heading","Heading"],["text","Text"],["image","Image"],["imageText","Image + Text"],["button","Button"],["divider","Divider"],["spacer","Spacer"],["columns","Columns"],["social","Social"],["footer","Footer"],["header","Header"],["html","HTML"]];
  return `<div class="builder-shell">
    <header class="builder-topbar">
      <div class="left"><button class="btn icon-only" data-builder-action="exit" aria-label="Exit builder">${icon("arrow")}</button><span class="badge ${c.id ? c.status : "draft"}">${c.id ? statusLabel(c.status) : "New draft"}</span></div>
      <input class="builder-title" data-campaign="name" value="${esc(c.name)}" aria-label="Campaign name">
      <div class="right"><button class="btn" data-builder-action="test">${icon("mail")}Send test</button><button class="btn" data-builder-action="save">Save</button><button class="btn primary" data-builder-action="review">${icon("send")}${state.settings.provider === "outlook" ? "Review & queue" : state.settings.provider === "microsoft_graph" ? "Review HTML send" : "Review & send"}</button></div>
    </header>
    <div class="builder-grid">
      <aside class="builder-panel">
        <div class="builder-panel-head"><h3>Content blocks</h3><p>Click to add, then arrange your story.</p></div>
        <div class="builder-section"><div class="block-library">${blockTools.map(([type,label]) => `<button class="block-tool" data-add-block="${type}">${icon(type)}<span>${label}</span></button>`).join("")}</div></div>
        <div class="builder-section"><div class="builder-section-title">Email details</div><div style="display:grid;gap:12px"><div class="field"><label>Subject line</label><input data-campaign="subject" value="${esc(c.subject)}" placeholder="A reason to open"></div><div class="field"><label>Preview text</label><textarea data-campaign="previewText" rows="3" placeholder="A short line shown beside the subject">${esc(c.previewText)}</textarea></div></div></div>
        <div class="builder-section"><div class="builder-section-title">Email background & border</div><div style="display:grid;gap:12px"><div class="field"><label>Background color</label><div class="color-row"><input data-campaign="emailBackground" type="color" value="${esc(c.emailBackground || "#edf1ed")}"><input data-campaign="emailBackground" value="${esc(c.emailBackground || "#edf1ed")}"></div></div><div class="field"><label>Border color</label><div class="color-row"><input data-campaign="emailBorderColor" type="color" value="${esc(c.emailBorderColor || "#dfe6e2")}"><input data-campaign="emailBorderColor" value="${esc(c.emailBorderColor || "#dfe6e2")}"></div></div><div class="field"><label>Border width — ${Number(c.emailBorderWidth || 0)}px</label><input data-campaign="emailBorderWidth" type="range" min="0" max="12" value="${Number(c.emailBorderWidth || 0)}"></div><div class="field"><label>Rounded corners — ${Number(c.emailBorderRadius || 0)}px</label><input data-campaign="emailBorderRadius" type="range" min="0" max="32" value="${Number(c.emailBorderRadius || 0)}"></div></div></div>
        <div class="builder-section"><div class="builder-section-title">Audience lists</div><div class="checklist">${state.lists.map((list) => `<label class="checklist-row"><input type="checkbox" data-campaign-list value="${list.id}" ${(c.listIds || []).includes(list.id) ? "checked" : ""}><i class="list-color" style="--list-color:${esc(list.color)}"></i><span>${esc(list.name)}</span><small>${formatNumber(subscribedListCount(list.id))}</small></label>`).join("")}</div><div class="help-card"><strong>${formatNumber(targetedContacts(c.listIds || []).length)} unique subscribed recipients</strong><br>Duplicates across selected lists are counted once.</div></div>
        <div class="builder-section"><div class="builder-section-title">Personalization</div><span class="merge-tag">{{first_name}}</span><span class="merge-tag">{{company}}</span><span class="merge-tag">{{brand_name}}</span></div>
      </aside>
      <main class="builder-canvas">
        <div class="device-toolbar"><span style="font-size:11px;color:var(--muted)">Email preview</span><div class="device-tabs"><button class="device-tab ${state.editorDevice === "desktop" ? "active" : ""}" data-device="desktop">${icon("desktop")} Desktop</button><button class="device-tab ${state.editorDevice === "mobile" ? "active" : ""}" data-device="mobile">${icon("mobile")} Mobile</button></div></div>
        <div class="email-frame-wrap ${state.editorDevice}"><iframe class="email-frame" title="Email preview" sandbox=""></iframe></div>
      </main>
      <aside class="builder-panel right">
        <div class="builder-panel-head"><h3>Layout</h3><p>Choose a block to edit or rearrange.</p></div>
        <div class="builder-section"><div class="builder-section-title">Block order</div><div class="block-list">${c.blocks.map((block,i) => `<div class="block-row ${i === state.editorSelected ? "selected" : ""}" draggable="true" data-block-index="${i}"><span class="drag-handle">⋮⋮</span><button class="block-name" data-select-block="${i}">${statusLabel(block.type)}</button><button data-move="-1" data-index="${i}" aria-label="Move up">↑</button><button data-move="1" data-index="${i}" aria-label="Move down">↓</button></div>`).join("")}</div></div>
        ${editorControl(selected)}
      </aside>
    </div>
    ${modalMarkup()}
  </div>`;
}

function updatePreview() {
  const frame = document.querySelector(".email-frame");
  if (frame) frame.srcdoc = renderEmail(state.editor.blocks, state.editor)
    .replace("{{preview_text}}", esc(state.editor.previewText || ""))
    .replaceAll("{{brand_name}}", esc(state.settings.brandName || "Todd Bailey Music"))
    .replaceAll("{{physical_address}}", esc(state.settings.physicalAddress || "Sender mailing address"))
    .replaceAll("{{unsubscribe_url}}", "#");
}

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += char;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
  return rows;
}

function mapCsvContacts(text) {
  const [headers, ...rows] = parseCsv(text);
  const index = (...names) => {
    for (const name of names) {
      const found = headers.findIndex((header) => header.trim().toLowerCase() === name.toLowerCase());
      if (found >= 0) return found;
    }
    return -1;
  };
  const get = (row, ...names) => {
    const at = index(...names);
    return at >= 0 ? row[at] || "" : "";
  };
  return rows.map((row) => ({
    email: get(row, "Contact Email", "Email", "Email Address"),
    firstName: get(row, "First Name", "First"),
    lastName: get(row, "Last Name", "Last"),
    company: get(row, "Company Name", "Company"),
    phone: get(row, "Phone", "Mobile"),
    city: get(row, "City"),
    state: get(row, "State"),
    country: get(row, "Country"),
    jobTitle: get(row, "Job Title", "Title"),
    score: get(row, "Contact Score", "Score"),
    source: get(row, "Contact Source", "Source") || "CSV import",
    tags: ["CSV import"]
  })).filter((contact) => contact.email.includes("@"));
}

async function saveCampaign() {
  const c = state.editor;
  c.html = renderEmail(c.blocks, c).replace("{{preview_text}}", esc(c.previewText || ""));
  const saved = c.id
    ? await request(`/api/campaigns/${c.id}`, { method: "PUT", body: JSON.stringify(c) })
    : await request("/api/campaigns", { method: "POST", body: JSON.stringify(c) });
  state.editor = { ...saved, blocks: saved.blocks || [] };
  const existing = state.campaigns.findIndex((item) => item.id === saved.id);
  if (existing >= 0) state.campaigns[existing] = saved;
  else state.campaigns.unshift(saved);
  state.dirty = false;
  toast("Campaign saved.");
}

function duplicateCampaign(campaign) {
  const copy = structuredClone(campaign);
  delete copy.id;
  delete copy.createdAt;
  delete copy.updatedAt;
  delete copy.sentAt;
  delete copy.queuedAt;
  delete copy.scheduledAt;
  delete copy.scheduledCount;
  delete copy.sentCount;
  delete copy.queuedCount;
  copy.name = `${campaign.name || "Untitled campaign"} copy`;
  copy.status = "draft";
  copy.audience = "lists";
  copy.listIds = [...(campaign.listIds || [])];
  copy.blocks = copy.blocks?.length ? copy.blocks.map((block) => ({ ...block, id: crypto.randomUUID() })) : defaultBlocks();
  copy.html = renderEmail(copy.blocks, copy).replace("{{preview_text}}", esc(copy.previewText || ""));
  return copy;
}

function startCampaign(template = 0, listIds = []) {
  const blocks = defaultBlocks();
  if (template === 1) {
    blocks[0].background = "#f4e6d6"; blocks[0].color = "#7a4628";
    blocks[1].background = "#f8f0e7"; blocks[2].content = "A note from the studio.";
  } else if (template === 2) {
    blocks[0].background = "#1f315a"; blocks[4].buttonColor = "#f3a44a"; blocks[2].content = "Save the date.";
  }
  state.editor = { name: "Untitled campaign", subject: "", previewText: "", emailBackground: "#edf1ed", emailBorderColor: "#dfe6e2", emailBorderWidth: 0, emailBorderRadius: 0, audience: "lists", listIds, status: "draft", blocks };
  state.editorSelected = 2;
  state.dirty = false;
  render();
}

function bindCommon() {
  document.querySelectorAll("[data-nav]").forEach((button) => button.addEventListener("click", () => { state.view = button.dataset.nav; state.page = 1; render(); }));
  document.querySelectorAll("[data-action='new-campaign']").forEach((button) => button.addEventListener("click", () => startCampaign()));
  document.querySelectorAll("[data-action='import']").forEach((button) => button.addEventListener("click", () => { state.modal = "import"; render(); }));
  document.querySelector("[data-action='add-list']")?.addEventListener("click", () => { state.editingList = null; state.modal = "list"; render(); });
  document.querySelector("[data-action='add-contact']")?.addEventListener("click", () => { state.editingContact = null; state.modal = "contact"; render(); });
  document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => { state.modal = null; render(); }));
  document.querySelectorAll("[data-page]").forEach((button) => button.addEventListener("click", () => { state.page = Number(button.dataset.page); render(); }));
  document.querySelectorAll("[data-template]").forEach((button) => button.addEventListener("click", () => startCampaign(Number(button.dataset.template))));
  document.querySelectorAll("[data-audience-tab]").forEach((button) => button.addEventListener("click", () => { state.audienceTab = button.dataset.audienceTab; state.page = 1; render(); }));
  document.querySelectorAll("[data-view-list]").forEach((button) => button.addEventListener("click", () => { state.audienceTab = "contacts"; state.listFilter = button.dataset.viewList; state.page = 1; render(); }));
  document.querySelectorAll("[data-campaign-list]").forEach((button) => button.addEventListener("click", () => startCampaign(0, [button.dataset.campaignList])));
  document.querySelectorAll("[data-edit-list]").forEach((button) => button.addEventListener("click", () => { state.editingList = structuredClone(getList(button.dataset.editList)); state.modal = "list"; render(); }));
  document.querySelectorAll("[data-edit-contact]").forEach((button) => button.addEventListener("click", () => { state.editingContact = structuredClone(state.contacts.find((contact) => contact.id === button.dataset.editContact)); state.modal = "contact"; render(); }));
  document.querySelectorAll("[data-edit-campaign]").forEach((button) => button.addEventListener("click", () => {
    const campaign = state.campaigns.find((item) => item.id === button.dataset.editCampaign);
    state.editor = structuredClone(campaign);
    state.editor.blocks = state.editor.blocks?.length ? state.editor.blocks : defaultBlocks();
    state.editorSelected = 0;
    render();
  }));
  document.querySelectorAll("[data-duplicate-campaign]").forEach((button) => button.addEventListener("click", async () => {
    const campaign = state.campaigns.find((item) => item.id === button.dataset.duplicateCampaign);
    if (!campaign) return toast("Campaign not found.", "error");
    try {
      state.editor = duplicateCampaign(campaign);
      state.editorSelected = 0;
      state.dirty = true;
      await saveCampaign();
      toast("Campaign duplicated as a new draft.");
      render();
    } catch (error) { toast(error.message, "error"); }
  }));

  const visibleContactIds = [...document.querySelectorAll(".contact-check")].map((box) => box.value);
  const currentFilteredContactIds = () => {
    const searchText = state.contactSearch.toLowerCase();
    return state.contacts.filter((contact) => {
      const matchesText = !searchText || [contact.email, contact.firstName, contact.lastName, contact.company, contact.city, contact.state].some((value) => String(value || "").toLowerCase().includes(searchText));
      const matchesStatus = state.contactFilter === "all" || contact.status === state.contactFilter;
      const matchesList = state.listFilter === "all" || (contact.listIds || []).includes(state.listFilter);
      return matchesText && matchesStatus && matchesList;
    }).map((contact) => contact.id);
  };
  const search = document.querySelector("#contact-search");
  if (search) search.addEventListener("input", () => { state.contactSearch = search.value; state.selectedContactIds = []; state.page = 1; render(); requestAnimationFrame(() => { const next = document.querySelector("#contact-search"); next?.focus(); next?.setSelectionRange(next.value.length,next.value.length); }); });
  document.querySelector("#contact-filter")?.addEventListener("change", (event) => { state.contactFilter = event.target.value; state.selectedContactIds = []; state.page = 1; render(); });
  document.querySelector("#list-filter")?.addEventListener("change", (event) => { state.listFilter = event.target.value; state.selectedContactIds = []; state.page = 1; render(); });
  document.querySelector("#select-all")?.addEventListener("change", (event) => {
    const selected = new Set(state.selectedContactIds || []);
    visibleContactIds.forEach((id) => event.target.checked ? selected.add(id) : selected.delete(id));
    state.selectedContactIds = [...selected];
    render();
  });
  document.querySelectorAll(".contact-check").forEach((box) => box.addEventListener("change", () => {
    const selected = new Set(state.selectedContactIds || []);
    box.checked ? selected.add(box.value) : selected.delete(box.value);
    state.selectedContactIds = [...selected];
    render();
  }));
  document.querySelector("[data-action='select-filtered']")?.addEventListener("click", () => {
    state.selectedContactIds = currentFilteredContactIds();
    render();
  });
  document.querySelector("[data-action='clear-selection']")?.addEventListener("click", () => {
    state.selectedContactIds = [];
    render();
  });
  document.querySelector("[data-action='bulk-list']")?.addEventListener("click", () => {
    const selected = state.selectedContactIds || [];
    if (!selected.length) return toast("Select at least one contact first.", "error");
    state.bulkContactIds = selected;
    state.modal = "bulk-list";
    render();
  });
  document.querySelector("[data-action='permission']")?.addEventListener("click", () => {
    const selected = state.selectedContactIds || [];
    if (!selected.length) return toast("Select at least one contact first.", "error");
    state.permissionIds = selected;
    state.modal = "permission";
    render();
  });

  document.querySelector("#permission-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const result = await request("/api/contacts/status", { method: "POST", body: JSON.stringify({ ids: state.permissionIds, status: "subscribed" }) });
      state.contacts.forEach((contact) => { if (state.permissionIds.includes(contact.id)) contact.status = "subscribed"; });
      state.selectedContactIds = [];
      state.modal = null;
      toast(`${result.changed} contact${result.changed === 1 ? "" : "s"} confirmed as subscribed.`);
      render();
    } catch (error) { toast(error.message, "error"); }
  });

  document.querySelector("#import-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = document.querySelector("#csv-file").files[0];
    if (!file) return;
    try {
      const contacts = mapCsvContacts(await file.text());
      const form = new FormData(event.currentTarget);
      const result = await request("/api/contacts/import", { method: "POST", body: JSON.stringify({ contacts, listId: form.get("listId") }) });
      const fresh = await request("/api/state");
      Object.assign(state, fresh, { modal: null });
      toast(`Added ${result.added} new contacts and updated list membership for existing matches.`);
      render();
    } catch (error) { toast(error.message, "error"); }
  });

  document.querySelector("#list-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const list = await request(state.editingList ? `/api/lists/${state.editingList.id}` : "/api/lists", { method: state.editingList ? "PUT" : "POST", body: JSON.stringify(payload) });
      const index = state.lists.findIndex((item) => item.id === list.id);
      if (index >= 0) state.lists[index] = list; else state.lists.push(list);
      state.modal = null;
      toast(state.editingList ? "List updated." : "List created.");
      render();
    } catch (error) { toast(error.message, "error"); }
  });

  document.querySelector("#contact-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form);
    payload.listIds = form.getAll("listIds");
    try {
      const contact = await request(state.editingContact ? `/api/contacts/${state.editingContact.id}` : "/api/contacts", { method: state.editingContact ? "PUT" : "POST", body: JSON.stringify(payload) });
      const index = state.contacts.findIndex((item) => item.id === contact.id);
      if (index >= 0) state.contacts[index] = contact; else state.contacts.unshift(contact);
      state.modal = null;
      toast(state.editingContact ? "Contact updated." : "Contact added.");
      render();
    } catch (error) { toast(error.message, "error"); }
  });

  document.querySelector("#bulk-list-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const listId = new FormData(event.currentTarget).get("listId");
    try {
      const result = await request(`/api/lists/${listId}/members`, { method: "POST", body: JSON.stringify({ contactIds: state.bulkContactIds, action: "add" }) });
      state.contacts.forEach((contact) => {
        if (state.bulkContactIds.includes(contact.id) && !(contact.listIds || []).includes(listId)) contact.listIds = [...(contact.listIds || []), listId];
      });
      state.selectedContactIds = [];
      state.modal = null;
      toast(`Added ${result.changed} contacts to ${getList(listId)?.name || "the list"}.`);
      render();
    } catch (error) { toast(error.message, "error"); }
  });

  document.querySelector("#settings-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    try {
      state.settings = await request("/api/settings", { method: "POST", body: JSON.stringify(payload) });
      toast("Settings saved.");
      render();
    } catch (error) { toast(error.message, "error"); }
  });
}

function blockFor(type) {
  const base = { id: crypto.randomUUID(), type, background: "#ffffff", color: "#17372b", align: "left", padding: 24 };
  if (type === "heading") return { ...base, content: "Your heading", size: 30 };
  if (type === "text") return { ...base, content: "Write something your reader will care about.", size: 16 };
  if (type === "image") return { ...base, src: "", imageUrl: "", alt: "Email image", height: 240, imagePaddingX: 0, imagePaddingY: 0, radius: 0 };
  if (type === "imageText") return { ...base, imageSide: "left", src: "", imageUrl: "", alt: "Feature image", height: 220, heading: "Feature this story", content: "Pair a strong image with a short message, release note, event invite, or callout.", buttonText: "Learn more", buttonUrl: "", buttonColor: "#d8f273", size: 15 };
  if (type === "button") return { ...base, content: "Learn more", url: "https://example.com", buttonColor: "#d8f273" };
  if (type === "divider") return { ...base, color: "#dfe6e2", padding: 16 };
  if (type === "spacer") return { ...base, background: "#ffffff", height: 32 };
  if (type === "columns") return { ...base, left: "Left column", right: "Right column" };
  if (type === "social") return { ...base, background: "#f5f7f5", color: "#176b4d", align: "center", website: "https://toddbaileymusic.com/", facebook: "https://www.facebook.com/ToddBaileyMusic", instagram: "https://www.instagram.com/toddbaileymusic/", youtube: "https://www.youtube.com/channel/UCIza8wg81TL1OTY0bNcr9Fg", tiktok: "https://www.tiktok.com/@toddbaileymusic", spotify: "https://open.spotify.com/artist/1NhllLyTk5cgyWIfgjLo5M" };
  if (type === "footer") return { ...base, content: "{{brand_name}}", address: "{{physical_address}}", unsubscribeText: "Unsubscribe", background: "#f5f7f5", color: "#6b7872", align: "center", padding: 20 };
  if (type === "header") return { ...base, content: "YOUR BRAND", background: "#163f30", color: "#ffffff", align: "center" };
  if (type === "html") return { ...base, content: "<p style=\"margin:0\">Custom HTML</p>" };
  return base;
}

function bindBuilder() {
  document.querySelectorAll("[data-campaign]").forEach((input) => input.addEventListener("input", () => {
    state.editor[input.dataset.campaign] = input.type === "range" ? Number(input.value) : input.value;
    state.dirty = true;
    document.querySelectorAll(`[data-campaign="${input.dataset.campaign}"]`).forEach((peer) => { if (peer !== input) peer.value = input.value; });
    updatePreview();
  }));
  document.querySelectorAll("input[data-campaign-list]").forEach((input) => input.addEventListener("change", () => {
    state.editor.listIds = [...document.querySelectorAll("input[data-campaign-list]:checked")].map((box) => box.value);
    state.dirty = true;
    render();
  }));
  document.querySelectorAll("[data-add-block]").forEach((button) => button.addEventListener("click", () => {
    if (button.dataset.addBlock === "footer") {
      const existing = state.editor.blocks.findIndex((block) => block.type === "footer");
      if (existing >= 0) {
        state.editorSelected = existing;
        toast("The campaign already has one editable compliance footer.");
        return render();
      }
    }
    state.editor.blocks.push(blockFor(button.dataset.addBlock));
    state.editorSelected = state.editor.blocks.length - 1;
    state.dirty = true;
    render();
  }));
  document.querySelectorAll("[data-select-block]").forEach((button) => button.addEventListener("click", () => { state.editorSelected = Number(button.dataset.selectBlock); render(); }));
  document.querySelectorAll("[data-device]").forEach((button) => button.addEventListener("click", () => { state.editorDevice = button.dataset.device; render(); }));
  document.querySelectorAll("[data-prop]").forEach((input) => {
    const updateBlock = () => {
    const block = state.editor.blocks[state.editorSelected];
    block[input.dataset.prop] = input.type === "range" ? Number(input.value) : input.value;
    state.dirty = true;
    document.querySelectorAll(`[data-prop="${input.dataset.prop}"]`).forEach((peer) => { if (peer !== input) peer.value = input.value; });
    updatePreview();
    };
    input.addEventListener("input", updateBlock);
    input.addEventListener("change", updateBlock);
  });
  document.querySelectorAll("[data-rich-prop]").forEach((editor) => {
    const updateRichBlock = () => {
      const block = state.editor.blocks[state.editorSelected];
      block[editor.dataset.richProp] = sanitizeRichHtml(editor.innerHTML);
      state.dirty = true;
      updatePreview();
    };
    editor.addEventListener("input", updateRichBlock);
    editor.addEventListener("blur", updateRichBlock);
  });
  document.querySelectorAll("[data-rich-command]").forEach((button) => button.addEventListener("click", () => {
    const editor = document.querySelector("[data-rich-prop]");
    if (!editor) return;
    editor.focus();
    const command = button.dataset.richCommand;
    if (command === "createLink") {
      const url = prompt("Paste the link URL");
      if (!url) return;
      document.execCommand("createLink", false, url);
      editor.querySelectorAll("a").forEach((link) => {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener");
      });
    } else {
      document.execCommand(command, false, null);
    }
    const block = state.editor.blocks[state.editorSelected];
    block[editor.dataset.richProp] = sanitizeRichHtml(editor.innerHTML);
    state.dirty = true;
    updatePreview();
  }));
  document.querySelectorAll("[data-move]").forEach((button) => button.addEventListener("click", () => {
    const from = Number(button.dataset.index);
    const to = Math.max(0, Math.min(state.editor.blocks.length - 1, from + Number(button.dataset.move)));
    if (from === to) return;
    const [block] = state.editor.blocks.splice(from, 1);
    state.editor.blocks.splice(to, 0, block);
    state.editorSelected = to;
    state.dirty = true;
    render();
  }));
  document.querySelectorAll(".block-row").forEach((row) => {
    row.addEventListener("dragstart", (event) => event.dataTransfer.setData("text/plain", row.dataset.blockIndex));
    row.addEventListener("dragover", (event) => event.preventDefault());
    row.addEventListener("drop", (event) => {
      event.preventDefault();
      const from = Number(event.dataTransfer.getData("text/plain"));
      const to = Number(row.dataset.blockIndex);
      const [block] = state.editor.blocks.splice(from, 1);
      state.editor.blocks.splice(to, 0, block);
      state.editorSelected = to;
      state.dirty = true;
      render();
    });
  });
  document.querySelector("[data-builder-action='delete']")?.addEventListener("click", () => {
    state.editor.blocks.splice(state.editorSelected, 1);
    state.editorSelected = Math.max(0, state.editorSelected - 1);
    state.dirty = true;
    render();
  });
  document.querySelector("[data-builder-action='save']")?.addEventListener("click", async () => { try { await saveCampaign(); render(); } catch (error) { toast(error.message, "error"); } });
  document.querySelector("[data-builder-action='exit']")?.addEventListener("click", async () => {
    if (state.dirty) { try { await saveCampaign(); } catch (error) { toast(error.message, "error"); return; } }
    state.editor = null; state.view = "campaigns"; render();
  });
  document.querySelector("[data-builder-action='test']")?.addEventListener("click", async () => {
    const to = prompt("Send a test to which email address?");
    if (!to) return;
    try {
      if (state.dirty || !state.editor.id) await saveCampaign();
      const result = await request("/api/send/test", { method: "POST", body: JSON.stringify({ to, subject: state.editor.subject || "Campaign test", html: renderEmail(state.editor.blocks, state.editor) }) });
      toast(result.result.mode === "test" ? "Test simulated safely. Switch to a configured provider for external delivery." : result.result.mode === "outlook_queue" ? `Test queued for Outlook delivery to ${to}.` : `Test sent to ${to}.`);
    } catch (error) { toast(error.message, "error"); }
  });
  document.querySelector("[data-builder-action='review']")?.addEventListener("click", async () => {
    if (!state.editor.listIds?.length) return toast("Choose at least one audience list before reviewing delivery.", "error");
    try {
      if (state.dirty || !state.editor.id) await saveCampaign();
      state.modal = "send";
      render();
    } catch (error) { toast(error.message, "error"); }
  });
  document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => { state.modal = null; render(); }));
  document.querySelector("#send-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const scheduleMode = form.get("scheduleMode") || "now";
    const scheduledAtLocal = form.get("scheduledAtLocal");
    const payload = {
      confirmation: form.get("confirmation"),
      permissionConfirmed: form.get("permissionConfirmed") === "on",
      scheduleMode,
      scheduledAt: scheduleMode === "later" && scheduledAtLocal ? new Date(scheduledAtLocal).toISOString() : ""
    };
    try {
      const result = await request(`/api/campaigns/${state.editor.id}/send`, { method: "POST", body: JSON.stringify(payload) });
      const latest = await request("/api/state");
      state.campaigns = latest.campaigns; state.events = latest.events; state.editor = latest.campaigns.find((c) => c.id === state.editor.id); state.modal = null;
      toast(result.mode === "scheduled" ? `Scheduled for ${formatDateTime(result.scheduledAt)} to ${result.scheduled} eligible contacts.` : result.mode === "test" ? `Simulated delivery to ${result.delivered} eligible contacts.` : result.mode === "outlook_queue" ? `Queued ${result.queued} one-to-one Outlook emails.` : `Sent to ${result.delivered} contacts.`);
      render();
    } catch (error) { toast(error.message, "error"); }
  });
}

async function boot() {
  try {
    const initial = await request("/api/state");
    Object.assign(state, initial);
    render();
  } catch (error) {
    app.innerHTML = `<div class="loading-screen"><div class="brand-mark">!</div><h2>Todd Bailey Music ESP couldn’t start</h2><p>${esc(error.message)}</p></div>`;
  }
}

boot();
