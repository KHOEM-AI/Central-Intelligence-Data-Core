# Development Phases
- [x] Phase 1: CIDC Foundation (structure started)
- [~] Phase 3: Programming Language Registry (data/languages.json, starter)
- [~] Phase 4: Code File Format Registry (data/file-formats.json, starter)
- [~] Phase 8: AI/UI Gateway (src/server.js, read-only starter)
- [ ] Phase 2, 5, 6, 7, 9, 10: not started

Everything in data/ is `draft` until verified by a human. Nothing is auto-verified.

## Update: data registries
- [~] Registries added (all `draft`): frameworks, databases, protocols, tools, platforms; templates are descriptors only (no bundled source code).
- [~] Gateway exposes the new registries read-only (`GET /api/cidc/<registry>`, `POST /api/cidc/search|retrieve`).
- [ ] Human verification of source, license and version for every item is still pending.
