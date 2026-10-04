# Proposal: PADEXA Remediation — Secrets purge, repo hygiene, monolith splits, CI

## Intent

Real secrets are committed (SSH key `934664`/`.pub` in root + backend history; Firebase config in frontend `.env`), the root repo is half-migrated (uncommitted monolith deletions, deleted `.gitignore`), three giant files block safe iteration, no module has test/lint CI. Goal: a consummated 3-repo layout, secret-free and CI-gated.

## Scope

### In Scope
1. **Secrets purge**: `git filter-repo` + force-push (root, backend) erasing `934664`/`.pub`; untrack frontend `.env`/`.env.template`; restore root `.gitignore` (`*.env*`, keys, logs, `.wwebjs_auth`, `dev-dist`, `.firebase`); gitleaks pre-commit on all 4 repos.
2. **Root hygiene**: commit monolith deletions (consummate migration); delete `firebase-debug.log`; fix `docker-compose.split.yml` context (`padel-proactive-backend-clean` → `padel-proactive-backend`); keep it as dev orchestration — backend compose covers backend+redis only.
3. **Monolith splits** (behavior-preserving): backend `messageHandler.js` (3085L), `config.routes.js` (1272L), frontend `configService.ts` (1079L) → per-domain modules.
4. **CI**: backend `npm test` + lint; frontend typecheck + lint + build; worker smoke.

### Out of Scope
- **Credential rotation** (correlated secrets are a manual ops follow-up)
- **Shared models package** (backend+worker duplication)
- Feature rewrites, PII log scrubbing, frontend unit tests, submodules (3 repos stay)

## Capabilities

### New Capabilities
- `repo-hygiene`: no secrets in any repo history/working tree; gitignore coverage; gitleaks enforced
- `ci-pipelines`: per-module Actions gates (backend tests+lint, frontend typecheck+lint+build, worker smoke)

### Modified Capabilities
- None — splits are behavior-preserving refactors; no requirement changes

## Approach

Execute in order:
1. **Secrets first (destructive)**: bare-mirror backups → `git filter-repo --path 934664 --path 934664.pub` (root, then backend) → force-push → `git gc`; untrack frontend `.env*`, restore `.gitignore`; install gitleaks.
2. **Root hygiene**: commit deletions, drop `firebase-debug.log`, fix compose.
3. **Splits**: extract domain modules, keep exports identical, green via backend `node --test` suite + frontend typecheck/lint.
4. **CI**: add per-module workflows.

## Affected Areas

| Area | Impact |
|------|--------|
| root + backend history (`934664*`) | Rewritten |
| root `.gitignore` | Restored |
| `docker-compose.split.yml` | Fixed |
| backend `messageHandler.js` / `config.routes.js` | Split |
| frontend `configService.ts` | Split |
| frontend `.env`, `.env.template` | Untracked |
| 4× `.github/workflows/` | New |

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| Force-push breaks clones | Med | Coordinate; backup; new SHAs |
| Split regressions | Med | Existing tests + CI gates |
| gitleaks false positives | Low | Tune config |
| filter-repo drops files | Low | `--analyze` dry-run |

## Rollback Plan

History rewrite is irreversible — restore from bare-mirror backups (tested pre-force-push). Splits: revert per-module merge commits. Untrack/CI/gitignore: plain reverts.

## Dependencies

- `git-filter-repo`; force-push rights; gitleaks binary
- Rotation deferred to ops (user-confirmed)

## Success Criteria

- [ ] `git log --all -- 934664*` empty (root + backend); no GitHub trace
- [ ] frontend `.env*` untracked; gitleaks active on 4 repos
- [ ] root consummation commit; no `firebase-debug.log`; compose valid
- [ ] CI green in all 3 modules
- [ ] backend `npm test` passes pre/post split