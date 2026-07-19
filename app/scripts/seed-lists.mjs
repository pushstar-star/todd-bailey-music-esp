import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sourceDir = path.resolve(process.argv[2] || "../work/archive_contacts");
const palette = ["#176b4d", "#4f6f52", "#9b6b43", "#476a8a", "#76518f", "#a45b4f", "#557a76", "#8b7b3d"];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

function slug(value) {
  return value.toLowerCase().replace(/\.csv$/i, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function displayName(file) {
  if (file.toLowerCase() === "sfgsd.csv") return "All CRM Contacts";
  const overrides = {
    "AR.csv": "A&R",
    "EVENT-PLANNER-DMC.csv": "Event Planners & DMCs",
    "FOLKDJ-L.csv": "FolkDJ-L",
    "FREE-EBOOK.csv": "Free eBook",
    "FRIENDS-FANS.csv": "Friends & Fans",
    "MUSIC-SUPERVISOR.csv": "Music Supervisors",
    "PARKS-REC.csv": "Parks & Recreation",
    "PRESS-LOCAL.csv": "Press — Local",
    "PRESS-NATIONAL.csv": "Press — National",
    "RADIO-DJ.csv": "Radio DJ",
    "RADIO-DJS.csv": "Radio DJs",
    "RADIO-PLAYED.csv": "Radio Played",
    "YOUTUBE-REACTION.csv": "YouTube Reactions"
  };
  if (overrides[file]) return overrides[file];
  return file
    .replace(/\.csv$/i, "")
    .split("-")
    .map((word) => word.length <= 3 ? word.toUpperCase() : word[0] + word.slice(1).toLowerCase())
    .join(" ");
}

let existing = [];
try {
  existing = JSON.parse(await fs.readFile(path.join(root, "data", "contacts.json"), "utf8"));
} catch {}
const existingByEmail = new Map(existing.map((contact) => [contact.email.toLowerCase(), contact]));

const files = (await fs.readdir(sourceDir)).filter((file) => file.toLowerCase().endsWith(".csv")).sort();
const contactsByEmail = new Map();
const lists = [];

for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
  const file = files[fileIndex];
  const listId = `list_${slug(file)}`;
  const [headers, ...rows] = parseCsv(await fs.readFile(path.join(sourceDir, file), "utf8"));
  const at = (name) => headers.indexOf(name);
  const value = (row, ...names) => {
    for (const name of names) {
      const index = at(name);
      if (index >= 0 && row[index]) return row[index].trim();
    }
    return "";
  };
  let validRows = 0;

  for (const row of rows) {
    const email = value(row, "Contact Email").toLowerCase();
    if (!email || !email.includes("@")) continue;
    validRows += 1;
    const prior = existingByEmail.get(email);
    const current = contactsByEmail.get(email) || {
      id: prior?.id || `ct_${crypto.randomUUID()}`,
      email,
      firstName: value(row, "First Name") || prior?.firstName || "",
      lastName: value(row, "Last Name") || prior?.lastName || "",
      company: value(row, "Company Name") || prior?.company || "",
      phone: value(row, "Phone", "Mobile") || prior?.phone || "",
      address: value(row, "Address") || prior?.address || "",
      city: value(row, "City") || prior?.city || "",
      state: value(row, "State") || prior?.state || "",
      zipCode: value(row, "Zip Code") || prior?.zipCode || "",
      country: value(row, "Country") || prior?.country || "",
      website: value(row, "Website Address") || prior?.website || "",
      jobTitle: value(row, "Job Title", "Title") || prior?.jobTitle || "",
      score: Number(value(row, "Contact Score") || prior?.score || 0),
      source: value(row, "Contact Source") || prior?.source || "CRM archive import",
      status: prior?.status || "needs_review",
      tags: [...new Set([...(prior?.tags || []), "CRM archive"])],
      listIds: [],
      addedAt: value(row, "Added Time") || prior?.addedAt || "",
      importedAt: prior?.importedAt || new Date().toISOString()
    };
    if (!current.listIds.includes(listId)) current.listIds.push(listId);
    contactsByEmail.set(email, current);
  }

  lists.push({
    id: listId,
    name: displayName(file),
    description: file.toLowerCase() === "sfgsd.csv" ? "Complete CRM contact export" : `Imported from ${file}`,
    color: palette[fileIndex % palette.length],
    sourceFile: file,
    importedRows: validRows,
    createdAt: new Date().toISOString()
  });
}

const contacts = [...contactsByEmail.values()].sort((a, b) => a.email.localeCompare(b.email));
await fs.mkdir(path.join(root, "data"), { recursive: true });
await fs.writeFile(path.join(root, "data", "contacts.json"), `${JSON.stringify(contacts, null, 2)}\n`);
await fs.writeFile(path.join(root, "data", "lists.json"), `${JSON.stringify(lists, null, 2)}\n`);

const memberships = contacts.reduce((sum, contact) => sum + contact.listIds.length, 0);
console.log(`Imported ${contacts.length} unique contacts into ${lists.length} lists (${memberships} memberships).`);
