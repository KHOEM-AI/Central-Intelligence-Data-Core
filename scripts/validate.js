// Data Validation Center (starter): duplicates, missing fields, invalid status
const fs = require("fs"), path = require("path");
const STATUS = ["draft", "pending_review", "verified", "deprecated", "rejected"];
const D = path.join(__dirname, "..", "data");
let errors = 0;
const err = (m) => { console.error("ERROR:", m); errors++; };
const REG = [["languages.json", "language_id", ["name"]], ["file-formats.json", "file_format_id", ["language", "extensions"]],
  ["templates.json", "template_id", ["name", "category", "files"]], ["frameworks.json", "framework_id", ["name", "domain"]], ["databases.json", "database_id", ["name", "type"]],
  ["protocols.json", "protocol_id", ["name", "category"]], ["tools.json", "tool_id", ["name", "kind"]], ["platforms.json", "platform_id", ["name", "category"]]];
for (const [file, idKey, req] of REG) {
  if (!fs.existsSync(path.join(D, file))) continue;
  const j = JSON.parse(fs.readFileSync(path.join(D, file), "utf8")); const seen = new Set();
  for (const i of j.items) {
    if (seen.has(i[idKey])) err(file + ": duplicate " + i[idKey]); seen.add(i[idKey]);
    for (const r of req) if (!i[r]) err(file + ": " + i[idKey] + " missing " + r);
    if (!STATUS.includes(i.verification_status)) err(file + ": " + i[idKey] + " bad status");
  }
  console.log(file + ": " + j.items.length + " items checked");
}
// Cross-reference: language ids និង stack ids ត្រូវមានពិតក្នុង registry
const items = (f) => (fs.existsSync(path.join(D, f)) ? JSON.parse(fs.readFileSync(path.join(D, f), "utf8")).items : []);
const langIds = new Set(items("languages.json").map((i) => i.language_id));
const stackIds = new Set([["frameworks.json", "framework_id"], ["databases.json", "database_id"], ["tools.json", "tool_id"], ["platforms.json", "platform_id"]].flatMap(([f, k]) => items(f).map((i) => i[k])));
for (const i of items("file-formats.json")) if (i.language_id && !langIds.has(i.language_id)) err("file-formats: " + i.file_format_id + " unknown language_id " + i.language_id);
for (const [f, k, fld] of [["frameworks.json", "framework_id", "languages"], ["databases.json", "database_id", "query_languages"], ["tools.json", "tool_id", "languages"], ["templates.json", "template_id", "languages"]])
  for (const i of items(f)) for (const l of i[fld] || []) if (!langIds.has(l)) err(f + ": " + i[k] + " unknown language " + l);
for (const i of items("templates.json")) for (const s of i.stack || []) if (!stackIds.has(s)) err("templates.json: " + i.template_id + " unknown stack id " + s);
console.log(errors ? errors + " error(s)" : "OK");
process.exit(errors ? 1 : 0);
