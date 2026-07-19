import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const source = process.argv[2] || "/Users/toddbailey/Downloads/sfgsd.csv";

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

const text = await fs.readFile(source, "utf8");
const [headers, ...rows] = parseCsv(text);
const key = (name) => headers.indexOf(name);
const seen = new Set();
const contacts = [];

for (const row of rows) {
  const email = (row[key("Contact Email")] || "").trim().toLowerCase();
  if (!email || !email.includes("@") || seen.has(email)) continue;
  seen.add(email);
  contacts.push({
    id: `ct_${crypto.randomUUID()}`,
    email,
    firstName: (row[key("First Name")] || "").trim(),
    lastName: (row[key("Last Name")] || "").trim(),
    company: (row[key("Company Name")] || "").trim(),
    phone: (row[key("Phone")] || row[key("Mobile")] || "").trim(),
    city: (row[key("City")] || "").trim(),
    state: (row[key("State")] || "").trim(),
    country: (row[key("Country")] || "").trim(),
    jobTitle: (row[key("Job Title")] || row[key("Title")] || "").trim(),
    score: Number(row[key("Contact Score")] || 0),
    source: (row[key("Contact Source")] || "CRM CSV import").trim(),
    status: "needs_review",
    tags: ["SFGSD import"],
    addedAt: (row[key("Added Time")] || "").trim(),
    importedAt: new Date().toISOString()
  });
}

await fs.mkdir(path.join(root, "data"), { recursive: true });
await fs.writeFile(
  path.join(root, "data", "contacts.json"),
  `${JSON.stringify(contacts, null, 2)}\n`,
  "utf8"
);
console.log(`Seeded ${contacts.length} unique contacts from ${rows.length} CSV rows.`);
