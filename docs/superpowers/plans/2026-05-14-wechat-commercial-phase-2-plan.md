# WeChat Commercial Phase 2 Plan

**Goal:** Move the current demo-grade virtual try-on workspace toward a commercially shippable WeChat mini program.

## Remaining Tracks

1. Miniapp runtime alignment
- Replace browser-only preview assumptions with WeChat/uni-app compatible navigation and request flow.
- Separate preview-only helpers from production miniapp code paths.

2. Backend-driven demo loop
- Make miniapp pages call API for asset bootstrap, upload metadata, task create, and task polling.
- Return stable demo result payloads from the API/worker path instead of front-end-only generated tasks.

3. Persistence and queue readiness
- Introduce real Prisma-backed persistence adapters behind the existing task service boundary.
- Keep local in-memory fallback for development, but make DB mode a first-class path.
- Replace placeholder queue metadata with a BullMQ/Redis-ready adapter boundary.

4. Admin CRUD
- Add real create/read/update/delete flows for garments, lipsticks, and models.
- Make asset bootstrap route read managed data instead of only static seed data.

5. Media and storage
- Add real upload target abstraction for local/dev and object storage/prod.
- Carry expiry metadata through uploaded image records and generated result records.

6. Commercial readiness
- Privacy copy, retention policy enforcement, content moderation hooks, observability, and deployment/runbook hardening.

## Execution Order

1. Connect miniapp pages to API-driven demo flow.
2. Make API task polling expose stable demo success payloads.
3. Promote admin and asset bootstrap from seed-only to managed data.
4. Add real persistence mode behind adapters.
5. Add storage/provider configuration and commercialization gates.
