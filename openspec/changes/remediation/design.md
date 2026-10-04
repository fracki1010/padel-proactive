# Design: PADEXA Remediation — Secrets purge, repo hygiene, monolith splits, CI

## Technical Approach

Execute in 6 ordered phases: (1) destructive secrets purge on root+backend with bare-mirror backups, (2) frontend env untracking + gitignore hardening, (3) root consummation (commit deletions, restore `.gitignore`, drop `firebase-debug.log`, fix compose), (4) gitleaks pre-commit on all 4 repos, (5) behavior-preserving splits (backend `messageHandler.js` + `config.routes.js`, frontend `configService.ts`), (6) CI gates + branch protection. Specs: `repo-hygiene`, `ci-pipelines`.

## Architecture Decisions

### D1: Worker smoke test command
| Option | Tradeoff | Decision |
|---|---|---|
| Boot real `whatsapp-web.js` in CI | Requires Chromium + WhatsApp session; flaky, heavy | Rejected |
| `node --check` all src files + module-load of `src/server.js` | Light, no deps/external services; catches syntax + require-graph errors; misses runtime boot failures | **Chosen** |

New committed script `scripts/smoke.js` (walk `src/`, spawn `node --check` per `.js`, then `require("./src/server")`), wired as `"smoke": "node scripts/smoke.js"`. Full boot is impossible in CI without a real session; syntax+load validation is the accepted proxy.

### D2: Frontend typecheck command
| Option | Tradeoff | Decision |
|---|---|---|
| Rely on `tsc -b` inside `npm run build` | Type errors only surface in build job; slower feedback | Rejected |
| Dedicated `"typecheck": "tsc -b"` job | Uses existing tsconfig refs (`noEmit: true` in `tsconfig.app.json`); fast incremental; isolated signal | **Chosen** |

`tsc --noEmit` rejected: project uses build-mode references; `tsc -b` is the established wiring.

### D3: Branch protection / required status checks
Workflows alone cannot enable settings (not versionable). Decision: name CI jobs exactly `backend-ci`, `frontend-ci`, `worker-smoke` (no custom job `name:` → check names equal job IDs), then configure branch protection on `main` via documented `gh api` command executed manually post-merge of workflows:

```
gh api -X PUT repos/{owner}/{repo}/branches/main/protection \
  -f required_status_checks='{"strict":true,"contexts":["backend-ci"]}' \
  -f enforce_admins=true -f required_pull_request_reviews='{"required_approving_review_count":0}'
```

Same command per repo with `frontend-ci` / `worker-smoke`. Alternative (UI checkbox) documented in apply. No terraform/action-based settings management (overkill, no existing tooling).

### D4: Gitleaks pre-commit installation
| Option | Tradeoff | Decision |
|---|---|---|
| `pre-commit` framework (`.pre-commit-config.yaml`) | Manages gitleaks version, but adds Python tool dependency ×4 repos | Rejected |
| Committed `.githooks/pre-commit` + `git config core.hooksPath .githooks` | Zero new tooling; hook source versioned; one-time config per clone; warns (does not fail) when binary missing | **Chosen** |

Hook: `gitleaks protect --staged --verbose || exit 1` guarded by `command -v gitleaks`. Install gitleaks v8 binary once per machine (GitHub release or `go install github.com/gitleaks/gitleaks/v8@latest`). Applied to root, backend, frontend, worker. Tradeoff documented: enforcement guaranteed only when binary installed (spec precondition "GIVEN gitleaks pre-commit is installed").

### D5: filter-repo procedure & rollback
Irreversible rewrite — operate ONLY on throwaway clones, never in-place on workspace repos. Step-by-step in "Purge Procedure" below. Gotcha: `filter-repo` strips `origin`; must re-add before push.

### D6: Backend lint (found gap)
Backend has NO linter (`package.json` has no lint script, no eslint devDep) yet both specs require "npm test and lint". Decision: add `eslint` (flat config `eslint.config.js`) with minimal rules — `languageOptions` (node globals, `commonjs`) + `no-undef` error only, rest off — to guarantee green on legacy code; `"lint": "eslint src/"`. Tighter rules documented as future hardening, not this change.

### D7: Split strategy (behavior-preserving)
Rule: extract ONLY pure helpers (no service/model/DB side effects) or full route blocks; never change exported contracts; external deps stay in orchestrator or pass as params.

**Backend `messageHandler.js`** (3085L, export `{ handleIncomingMessage }`) → extract pure helper clusters to `src/whatsapp/domain/` (matches existing pattern — `messageInterpreter.js`, `parseBookingDateTime.js` etc. already live there):

| New file | Content (helpers) |
|---|---|
| `domain/messageSanitization.js` | `sanitizeIncomingUserMessage`, `sanitizeModelOnlyMessage`, `normalizeSpanishText`, `normalizeNameText`, `normalizeLooseText`, `isPromptInjectionAttempt` |
| `domain/intentDetection.js` | `inferFallbackAction`, `inferDeterministicAction`, `isAffirmativeBookingReply`, `isNegativeBookingReply`, `hasDirectBookingIntent`, `hasBookingControlKeywords` |
| `domain/bookingDateTime.js` | `normalizeTimeString`, `isValidIsoDate`, `addDaysToIsoDate`, `getArgentinaDateParts`, `getNextWeekdayIsoDate`, `extractDateFromMessage`, `extractTimeFromMessage`, `formatIsoDateAsDayMonthYear`, `toMinutes`, `timeToMinutes`, `extractDayPeriodFromMessage`, `getDayPeriodLabel`, `filterSlotsByPeriod`, `formatSlotLines`, `findNearbySlots` |
| `domain/bookingDrafts.js` | `extractRequestedCourtsCount`, `parseStrictDraftConfirmation`, `extractBookingDraftsFromMessage`, `buildDraftFromRaw`, `toDraftLabelByIndex` |
| `domain/replyBuilders.js` | `buildAntiLoopReply`, `buildBookingReplyText`, `buildSecondBookingConfirmationText`, `buildActiveBookingsReply` (helpers touching `sessionService` stay in handler) |
| `domain/strictFlow.js` | `parseAttendanceAnswer`, `parseStrictYesNoAnswer`, `parseStrictCancel`, `parseStrictOfferConfirmation`, `getStrictInputState`, `isAllowedInputForStrictState`, `buildStrictStateInvalidInputReply`, `enforceStrictQuestionFlowReply`, deadline helpers, `ALLOWED_AI_ACTIONS`, `CONCRETE_RESPONSE_TIMEOUT_MS` |
| `utils/incomingRateLimit.js` | `fingerprintMessage`, `incomingRateState`, `enforceIncomingRateLimit`, `auditSecurityEvent`, `MAX_SAME_MESSAGE_BEFORE_LOOP_REPLY`, rate consts |

`messageHandler.js` keeps `handleIncomingMessage` (orchestration, ~1800L) + requires. Name extraction (`isLikelyFullName`, `isPlaceholderName`, `isNonNameReply`, `extractFullNameFromMessage`, `isValidClientName`) folds into existing `domain/extractPersonName.js` (extends it, no export change). Tests already cover the extracted domains (`extractPersonName.test.js`, `messageInterpreter.test.js`, `parseBookingDateTime.test.js`, `timeParser.test.js`, `conversationGuardrails.test.js`, `stateTransitionHandler.test.js`, `bookingStateMachine.test.js`).

**Backend `config.routes.js`** (1272L, export Express router, mounted at `/api/config`) → per-domain sub-routers under `src/routes/config/`:

| New file | Routes moved |
|---|---|
| `config/shared.js` | `resolveCompanyId`, `escapeRegex`, `companyScope`, `firstBoolean`, `firstString`, `buildWhatsappConfigResponse`, `buildBotAutomationConfigResponse`, `DAILY_HOUR_REGEX`, `ISO_DATE_REGEX` |
| `config/courts.routes.js` | `/courts` GET/POST/PUT/DELETE |
| `config/slots.routes.js` | `/slots`, `/slots/base-price`, `/slots/:id` |
| `config/whatsapp.routes.js` | `/whatsapp`, `/whatsapp/send-digest-now`, `/whatsapp/reset-session`, `/whatsapp/groups`, `/whatsapp/chats` |
| `config/notifications.routes.js` | `/notifications/reminders`, `/settings` |
| `config/botAutomation.routes.js` | `/bot-automation` |
| `config/penalties.routes.js` | `/penalties` |
| `config/clubClosures.routes.js` | `/club-closures` |
| `config/companyImages.routes.js` | `/company-images`, `/client-log` (+ multer setup) |

`config.routes.js` becomes an aggregator: `router.use(require("./config/courts.routes"))` etc., same relative order, still `module.exports = router`. Sub-routers keep their full path strings — URL paths byte-identical; `app.js` untouched.

**Frontend `configService.ts`** (1079L, named export `configService` object, 6 consumers unchanged) → domain modules under `src/services/config/` + facade:

| New file | Methods moved |
|---|---|
| `config/parsers.ts` | `parseOneHourReminderEnabled`, `parseWhatsappCancellationGroupSettings`, `parseWhatsappGroups`, `parseWhatsappCommandId`, `sleep`, `waitForWhatsappCommandCompletion`, constants, `CompanyImage`/`DigestBackground` types |
| `config/companyImages.service.ts` | `compressImage`, `getCompanyImages`, `uploadCompanyImage`, `deleteCompanyImage`, `getDigestBackgrounds`, `uploadDigestBackground`, `deleteDigestBackground` |
| `config/courts.service.ts` | `getCourts`, `createCourt`, `updateCourt`, `deleteCourt` |
| `config/slots.service.ts` | `getSlots`, `createSlot`, `updateSlot`, `updateBasePrice` |
| `config/penalties.service.ts` | `getPenaltySettings`, `updatePenaltySettings` |
| `config/botAutomation.service.ts` | `getBotAutomationSettings`, `updateBotAutomationSettings` |
| `config/whatsapp.service.ts` | `getWhatsappStatus`, `getWhatsappCommandStatus`, `getWhatsappCommands`, `retryWhatsappCommand`, `updateWhatsappStatus`, `resetWhatsappSession`, `closeWhatsappSession`, `getOneHourReminderSetting`, `updateOneHourReminderSetting`, `getWhatsappCancellationGroupSettings`, `updateWhatsappCancellationGroupSettings`, `sendDigestNow`, `getWhatsappGroups` |
| `config/clubClosures.service.ts` | `getClubClosures`, `createClubClosure`, `updateClubClosure`, `deleteClubClosure` |

`configService.ts` becomes a facade: `export const configService = { ...companyImages, ...courts, ... }`. Named export contract identical → all consumers (`useConfigData.ts`, `BotAutomationSettingsView.tsx`, `DigestBackgroundsGrid.tsx`, `useWhatsappManagement.ts`) untouched.

## Purge Procedure (root, then backend)

Preconditions: `git-filter-repo` installed; all local branches pushed; no open PRs (coordinate).

1. **Backup (bare mirrors)**:
   ```
   git clone --mirror https://github.com/fracki1010/padel-proactive.git /tmp/backup/root-mirror.git
   git clone --mirror https://github.com/fracki1010/padel-proactive-backend.git /tmp/backup/backend-mirror.git
   git -C /tmp/backup/root-mirror.git fsck --full && git -C /tmp/backup/backend-mirror.git fsck --full
   ```
2. **Dry-run**: `git filter-repo --analyze` in each throwaway clone.
3. **Throwaway clones**: `git clone https://github.com/fracki1010/padel-proactive.git /tmp/rewrite/root` (same for backend).
4. **Rewrite**:
   ```
   cd /tmp/rewrite/root
   git filter-repo --path 934664 --path 934664.pub --invert-paths
   git log --all --oneline -- 934664 934664.pub        # EXPECT empty
   git fsck --full
   ```
   Repeat for backend.
5. **Push**: `git remote add origin <url>` (filter-repo removes it) → `git push origin --force --all && git push origin --force --tags`.
6. **Verify remotely**: fresh clone from GitHub; `git log --all -- 934664*` empty; `ls` shows no key files.
7. **Update workspace repos** (never rewritten in place): `git fetch origin && git reset --hard origin/main` in root + backend; `rm -f 934664*` if present on disk.

**Rollback**: if step 4 verification fails → discard `/tmp/rewrite/*`, re-clone from mirror. If force-push already happened → from backup mirror: `git -C /tmp/backup/root-mirror.git push --mirror <origin>` (overwrites; coordinate). Residual risk: GitHub may retain unreachable objects/PR refs; full scrub needs GitHub support (documented, out of scope).

## File Changes

| File | Action | Description |
|---|---|---|
| root `.gitignore` | Recreate | Patterns: `*.env*`, `*.pem`, `*.key`, `id_rsa*`, `*.log`, `.wwebjs_auth/`, `dev-dist/`, `.firebase/` |
| root `docker-compose.split.yml` | Modify | `context:` + `env_file:` `./padel-proactive-backend-clean` → `./padel-proactive-backend` |
| root `firebase-debug.log` | Delete | Covered by `*.log` ignore |
| root (staged deletions) | Commit | Consummation of migration; `business_info.txt` deletion → **pending user confirmation** |
| frontend `.env`, `.env.template` | Untrack | `git rm --cached` (keep on disk); add `.env.template` to frontend `.gitignore` |
| 4× `.githooks/pre-commit` | Create | gitleaks hook + `git config core.hooksPath .githooks` |
| backend `eslint.config.js`, `package.json` | Create/Modify | Minimal eslint + `lint` script |
| backend `scripts/smoke.js` — worker | Create | Syntax + module-load smoke |
| 3× `.github/workflows/ci.yml` | Create | backend `backend-ci` (lint+test), frontend `frontend-ci` (typecheck+lint+build), worker `worker-smoke` (smoke); triggers: push main + PR |
| Split modules (16 new) | Create | Per D7 tables; 3 monoliths → aggregators/facades |

## Testing Strategy

| Layer | What | How |
|---|---|---|
| Backend regression | Extracted helpers/routes | Existing `npm test` (`node --test src/tests/**/*.test.js`, 12 files) + `npm run lint` |
| Frontend | Split facade + types | `npm run typecheck` (`tsc -b`), `npm run lint`, `npm run build` |
| Worker | Syntax + module graph | `npm run smoke` (scripts/smoke.js) |
| Compose | Split compose validity | `docker compose -f docker-compose.split.yml config` exit 0 |
| Hygiene | Secret absence | `git log --all -- 934664*` empty; `git ls-files | grep env` empty; gitleaks hook rejects seeded secret |
| CI gates | Merge blocks | Branch protection requires green checks (D3) |

## Migration / Rollout Order

1. Backups + purge (root, backend) — destructive, first.
2. Frontend env untrack + `.gitignore` additions (frontend, root).
3. Root consummation commit + compose fix + log deletion.
4. Gitleaks install + hooks ×4.
5. Splits (backend 2 files, frontend 1) — green via existing suites.
6. CI workflows ×3, then branch protection (`gh api`, post-workflow-merge).

## Open Questions

- [ ] `business_info.txt` — keep tracked, delete, or move? **Pending user confirmation during apply** (explicitly NOT decided here).
- [ ] Root repo CI workflow — specs define 3 module gates only; root gitleaks scan optional, deferred.