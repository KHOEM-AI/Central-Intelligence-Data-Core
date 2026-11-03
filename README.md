# Central Intelligence Data Core (CIDC)
KHOEM-AI | ស្នូលទិន្នន័យបញ្ញាកណ្ដាល

មជ្ឈមណ្ឌលទិន្នន័យកណ្ដាលរបស់ KHOEM-AI។ មានតែ KHOEM-AI AI/UI ប៉ុណ្ណោះដែលទាញយកទិន្នន័យតាម Gateway។

## រចនាសម្ព័ន្ធ
- `data/languages.json` : Programming Language Registry
- `data/file-formats.json` : Code File Format Registry
- `data/templates.json` : Code Templates (ទទេ)
- `data/modules.json` : បញ្ជី Modules (started / planned)
- `data/schema/metadata.schema.json` : Metadata ស្តង់ដារ
- `src/server.js` : API Gateway (read-only, Bearer token)
- `scripts/validate.js` : Data Validation

## ប្រើ (Termux)
```
export CIDC_TOKEN=សម្ងាត់របស់បង
npm run validate
npm start
curl -H "Authorization: Bearer $CIDC_TOKEN" localhost:3000/api/cidc/statistics
```
ស្ថានភាពទិន្នន័យទាំងអស់ = `draft` រហូតដល់ត្រូវបានផ្ទៀងផ្ទាត់។ ផែនការ៖ `docs/PHASES.md`
