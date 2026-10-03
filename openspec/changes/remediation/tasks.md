# Tasks: PADEXA Remediation

## Review Workload Forecast

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

Estimated changed lines: ~7,500 (7,000–8,000); 800-line risk: High. Splits are pure moves — diffs ~2× moved lines. Purge = ops, not a PR. Consummation = pre-staged deletions (~15k, zero authored) → `size:exception`.

### Work Units

- Ops: root+backend purge
- R-PR1: consummation, gitignore, compose, hook
- B-PR1: lint, sanitization, intentDetection
- B-PR2: bookingDateTime, bookingDrafts
- B-PR3: replyBuilders, strictFlow, rateLimit, personName, reduce
- B-PR4: shared, courts, slots
- B-PR5: whatsapp, notifications, botAutomation
- B-PR6: penalties, clubClosures, companyImages, aggregator, ci
- F-PR1: env untrack, gitignore
- F-PR2: parsers, courts, slots
- F-PR3: penalties, botAutomation, clubClosures, companyImages
- F-PR4: whatsapp.service, facade, ci
- W-PR1: smoke, ci

Chain: ask user; exports identical, tests green.

## Phase 1: Secrets purge (DESTRUCTIVE)

> **DONE (2026-10-03)**: purge executed via `git-filter-repo` (v31ebad4c8fb3) on throwaway clones.
> Backups (rollback) at `/tmp/backup/root-mirror.git` + `/tmp/backup/backend-mirror.git` (fsck clean).
> New SHAs — root `main`: `092d9f7`; backend `main`: `f279d4f`; backend `feat/whatsapp-decouple-mvp`: `58552d4`.
> Fresh-clone verify: `git log --all --full-history -- 934664 934664.pub` → 0 commits (root + backend).

- [x] 1.1 Backup mirrors root+backend, `fsck --full`
- [x] 1.2 `git filter-repo --analyze` dry-run (root + backend)
- [x] 1.3 [DESTRUCTIVE] Rewrite root clone `--invert-paths --path 934664 --path 934664.pub`; log empty → new `main` `092d9f7`
- [x] 1.4 [DESTRUCTIVE] Rewrite backend clone; log empty → new `main` `f279d4f`, `feat/whatsapp-decouple-mvp` `58552d4`
- [x] 1.5 [DESTRUCTIVE] Re-add origin; force-push `--all`+`--tags` both (root `bdb79b6→092d9f7`; backend `46aa85a→f279d4f`, `71ee63e→58552d4`)
- [x] 1.6 Fresh-clone verify; resync workspaces; `rm -f 934664*`; purge stale `refs/original` + `git gc --prune=now` (backend); local `git log --all` → 0
- Rollback: discard clones pre-push; `push --mirror` from backup.

## Phase 2: Env untracking + gitignore

- [x] 2.1 Frontend `git rm --cached .env .env.template` (keep) — commit `7a28d67`
- [x] 2.2 Frontend `.gitignore` += `.env*` — commit `7a28d67`
- [x] 2.3 Root `.gitignore` recreate: `*.env*`, `*.pem`, `*.key`, `id_rsa*`, `*.log`, `.wwebjs_auth/`, `dev-dist/`, `.firebase/` — commit `bdb79b6`

## Phase 3: Root consummation

> **DONE (2026-10-03)**: commits `0889767` (monolith removal, 84 deletions) + `2fda8ac` (compose fix) on branch
> `chore/consummate-monolith-removal` → **PR #1** https://github.com/fracki1010/padel-proactive/pull/1 (base `main`).
> `docker compose -f docker-compose.split.yml config` exit 0. `business_info.txt` preserved (KEEP decision).

- [x] 3.1 Delete `firebase-debug.log`
- [x] 3.2 Commit staged deletions — status clean (tracked changes clean; 6 untracked dirs remain: `openspec/`, `.atl/`, `padel-proactive-*/` — see note)
- [x] 3.3 Compose context+env_file → `./padel-proactive-backend`; `config` exit 0
- [x] 3.4 `business_info.txt` — user confirmed KEEP; restored and excluded from commit

> Note: spec scenario "Clean workspace after consummation" implies `git status --porcelain` fully clean.
> Remaining untracked: `openspec/`, `.atl/`, `padel-proactive-backend/`, `padel-proactive-frontend/`,
> `padel-proactive-whatsapp-worker/`, `padel-proactive-frontend.code-workspace`. Decide in a follow-up:
> commit `openspec/` + ignore the 3 module repos (separate repos) in root `.gitignore`.

## Phase 4: Gitleaks hooks ×4

- [ ] 4.1 `.githooks/pre-commit` ×4: `gitleaks protect --staged --verbose`, `command -v` guard; secret rejected
- [ ] 4.2 `git config core.hooksPath .githooks` ×4

## Phase 5: Backend lint foundation

- [ ] 5.1 `eslint.config.js` flat: node globals, commonjs, `no-undef`; lint green
- [ ] 5.2 eslint devDep + `"lint": "eslint src/"`

## Phase 6: Splits

- [ ] 6.1 `whatsapp/domain/messageSanitization.js` + `intentDetection.js`
- [ ] 6.2 `bookingDateTime.js` + `bookingDrafts.js`
- [ ] 6.3 `replyBuilders.js` + `strictFlow.js` + `utils/incomingRateLimit.js`
- [ ] 6.4 extend `extractPersonName.js`; shrink `handlers/messageHandler.js` — export unchanged
- [ ] 6.5 `routes/config/shared.js` + `courts.routes.js` + `slots.routes.js`
- [ ] 6.6 `whatsapp.routes.js` + `notifications.routes.js` + `botAutomation.routes.js`
- [ ] 6.7 `penalties.routes.js` + `clubClosures.routes.js` + `companyImages.routes.js`; `config.routes.js` → aggregator — URLs identical
- [ ] 6.8 `services/config/parsers.ts` + `courts.service.ts` + `slots.service.ts` + `penalties.service.ts`
- [ ] 6.9 `companyImages.service.ts` + `botAutomation.service.ts` + `clubClosures.service.ts` + `whatsapp.service.ts`
- [ ] 6.10 `configService.ts` → facade — export identical, consumers untouched
- [ ] 6.11 Backend: `npm test` + lint green (spec)
- [ ] 6.12 Frontend: typecheck + lint + build green (spec)

## Phase 7: CI gates

- [ ] 7.1 Backend workflow job `backend-ci` (test+lint)
- [ ] 7.2 Frontend `"typecheck": "tsc -b"` + job `frontend-ci`
- [ ] 7.3 Worker `scripts/smoke.js` + `"smoke"` + job `worker-smoke`
- [ ] 7.4 Branch protection `gh api`, strict (dep: 7.1–7.3 green)