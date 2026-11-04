# Central Intelligence Data Core (CIDC)
KHOEM-AI | ស្នូលទិន្នន័យបញ្ញាកណ្ដាល

មជ្ឈមណ្ឌលទិន្នន័យកណ្ដាលរបស់ KHOEM-AI។ មានតែ KHOEM-AI AI/UI ប៉ុណ្ណោះដែលទាញយកទិន្នន័យតាម Gateway។

## រចនាសម្ព័ន្ធ
- `data/` : languages, file-formats, templates, frameworks, databases, protocols, tools, platforms, modules, schema
- `src/server.js` : API Gateway :8800 (read-only, Bearer token)
- `src/ui.js` + `ui/index.html` : Dashboard :5190
- `scripts/validate.js` : Data Validation
- `docs/SPEC.md` : ឯកសារផែនការដើម, `docs/PHASES.md` : ដំណាក់កាល

## ប្រើ (Termux)
Token ទុកក្នុង `~/.cidc_env` (មិន push): `export CIDC_TOKEN=...`
- រត់ជាមួយសេវាផ្សេង៖ `ai` (launcher នៅ repo KHOEM_AI បន្ថែម CIDC API :8800 និង UI :5190)
- រត់តែឯង៖ `source ~/.cidc_env && PORT=8800 npm start` និង `UI_PORT=5190 npm run ui`
- ពិនិត្យទិន្នន័យ៖ `npm run validate`

ស្ថានភាពទិន្នន័យទាំងអស់ = `draft` រហូតដល់ត្រូវបានផ្ទៀងផ្ទាត់។


## Search filters
`POST /api/cidc/search` body: `collection` (required), `query`, `verification_status`, `language`, `domain`, `category`, `kind`, and optional `limit` (max 500) + `offset`. `count` is always the total before paging.
