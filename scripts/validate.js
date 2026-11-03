// Data Validation Center (starter): duplicates, missing fields, invalid status
const fs = require("fs"), path = require("path");
const STATUS = ["draft", "pending_review", "verified", "deprecated", "rejected"];
const D = path.join(__dirname, "..", "data");
let errors = 0;
const err = (m) => { console.error("ERROR:", m); errors++; };
for (const [file, idKey, req] of [["languages.json", "language_id", ["name"]], ["file-formats.json", "file_format_id", ["language", "extensions"]]]) {
  const j = JSON.parse(fs.readFileSync(path.join(D, file), "utf8")); const seen = new Set();
  for (const i of j.items) {
    if (seen.has(i[idKey])) err(file + ": duplicate " + i[idKey]); seen.add(i[idKey]);
    for (const r of req) if (!i[r]) err(file + ": " + i[idKey] + " missing " + r);
    if (!STATUS.includes(i.verification_status)) err(file + ": " + i[idKey] + " bad status");
  }
  console.log(file + ": " + j.items.length + " items checked");
}
console.log(errors ? errors + " error(s)" : "OK");
process.exit(errors ? 1 : 0);
