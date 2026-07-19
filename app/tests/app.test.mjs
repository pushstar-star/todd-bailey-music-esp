import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const contactsPath = new URL("../data/contacts.json", import.meta.url);
const listsPath = new URL("../data/lists.json", import.meta.url);
const serverPath = new URL("../server.js", import.meta.url);
const clientPath = new URL("../public/app.js", import.meta.url);
const settingsPath = new URL("../data/settings.json", import.meta.url);

test("archive audience contains at least 1,860 unique, valid contacts", async () => {
  const contacts = JSON.parse(await fs.readFile(contactsPath, "utf8"));
  assert.ok(contacts.length >= 1860);
  assert.equal(new Set(contacts.map((contact) => contact.email)).size, contacts.length);
  assert.ok(contacts.every((contact) => contact.email.includes("@")));
});

test("audience lists have deduplicated memberships after playlist merge", async () => {
  const contacts = JSON.parse(await fs.readFile(contactsPath, "utf8"));
  const lists = JSON.parse(await fs.readFile(listsPath, "utf8"));
  assert.equal(lists.length, 25);
  assert.ok(contacts.reduce((sum, contact) => sum + contact.listIds.length, 0) >= 3988);
  assert.ok(contacts.some((contact) => contact.listIds.length > 1));
  assert.ok(lists.some((list) => list.name === "Friends & Fans"));
  assert.ok(lists.some((list) => list.id === "list_playlists" && list.name === "Playlists"));
  assert.ok(lists.every((list) => list.id !== "list_playlist"));
  assert.ok(contacts.every((contact) => !contact.listIds.includes("list_playlist")));
});

test("contacts use only guarded delivery statuses", async () => {
  const contacts = JSON.parse(await fs.readFile(contactsPath, "utf8"));
  const allowed = new Set(["needs_review", "subscribed", "unsubscribed", "bounced"]);
  assert.ok(contacts.every((contact) => allowed.has(contact.status)));
  assert.ok(contacts.some((contact) => contact.status === "subscribed"));
});

test("server includes permission, unsubscribe, and sender-address safeguards", async () => {
  const source = await fs.readFile(serverPath, "utf8");
  assert.match(source, /contact\.status === "subscribed"/);
  assert.match(source, /campaign\.listIds/);
  assert.match(source, /targetedLists/);
  assert.match(source, /payload\.permissionConfirmed !== true/);
  assert.match(source, /physical mailing address/);
  assert.match(source, /public unsubscribe URL/);
  assert.match(source, /cannot use localhost for live sends/);
  assert.match(source, /\/unsubscribe\?/);
  assert.match(source, /\/track\/open/);
  assert.match(source, /\/track\/click/);
  assert.match(source, /addTracking/);
  assert.match(source, /trackingEnabled !== true/);
  assert.match(source, /parsed\.origin/);
});

test("builder supports responsive blocks and personalization", async () => {
  const source = await fs.readFile(clientPath, "utf8");
  for (const block of ["heading", "text", "image", "imageText", "button", "divider", "spacer", "columns", "social", "footer", "html"]) {
    assert.match(source, new RegExp(`type === "${block}"|\\["${block}"`));
  }
  assert.match(source, /\{\{first_name\}\}/);
  assert.match(source, /editorDevice/);
  assert.match(source, /data-campaign-list/);
  assert.match(source, /selectedContactIds/);
  assert.match(source, /select-filtered/);
  assert.match(source, /Select all/);
  assert.match(source, /Campaign analytics/);
  assert.match(source, /Campaign performance/);
  assert.match(source, /send-timeline/);
  assert.match(source, /Unsubscribes/);
  assert.match(source, /data-duplicate-campaign/);
  assert.match(source, /duplicateCampaign/);
  assert.match(source, /Campaign duplicated as a new draft/);
  assert.match(source, /scheduleMode/);
  assert.match(source, /datetime-local/);
  assert.match(source, /Scheduled day and time/);
  assert.match(source, /trackingEnabled/);
  assert.match(source, /Enable open\/click tracking/);
  assert.match(source, /emailBackground/);
  assert.match(source, /emailBorderColor/);
  assert.match(source, /emailBorderWidth/);
  assert.match(source, /contenteditable="true"/);
  assert.match(source, /data-rich-command="createLink"/);
  assert.match(source, /sanitizeRichHtml/);
  assert.match(source, /data-compliance-footer/);
  assert.match(source, /Image \+ Text/);
  assert.match(source, /imageSide/);
  assert.match(source, /imageUrl/);
  assert.match(source, /Image link URL/);
  assert.match(source, /imagePaddingX/);
  assert.match(source, /imagePaddingY/);
  assert.match(source, /Horizontal padding/);
  assert.match(source, /Vertical padding/);
  assert.match(source, /Rounded corners/);
  assert.match(source, /stack-column/);
  assert.match(source, /max-width:620px/);
  assert.match(source, /Spacer/);
  assert.match(source, /facebook.*instagram.*youtube.*tiktok.*spotify/s);
});

test("Todd Bailey Music Microsoft Graph sender is configured", async () => {
  const settings = JSON.parse(await fs.readFile(settingsPath, "utf8"));
  const server = await fs.readFile(serverPath, "utf8");
  const client = await fs.readFile(clientPath, "utf8");
  assert.equal(settings.brandName, "Todd Bailey Music");
  assert.equal(settings.fromEmail, "info@toddbaileymusic.com");
  assert.equal(settings.provider, "microsoft_graph");
  assert.match(server, /queueOutlookJob/);
  assert.match(server, /sendGraphHtmlBatch/);
  assert.match(server, /contentType: "HTML"/);
  assert.match(server, /offset \+= 20/);
  assert.match(server, /data-compliance-footer/);
  assert.match(client, /Outlook connected/);
  assert.doesNotMatch(client, /Courierly|Second Floor/);
});

test("server supports scheduled campaign delivery", async () => {
  const source = await fs.readFile(serverPath, "utf8");
  assert.match(source, /processDueCampaigns/);
  assert.match(source, /status = "scheduled"/);
  assert.match(source, /scheduledAt/);
  assert.match(source, /setInterval/);
  assert.match(source, /schedule_failed/);
});
