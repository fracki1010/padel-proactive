# ci-pipelines

Purpose: give each module repo a verification gate that runs its checks and blocks merges when red.

## Requirements

### Requirement: Backend CI gate

The backend repo MUST have a GitHub Actions workflow that runs `npm test` and lint on push to the default branch and on pull requests targeting it, and the jobs MUST be required status checks before merge.

#### Scenario: Failing test blocks merge

- GIVEN a pull request whose backend CI run fails a test
- WHEN checking merge eligibility
- THEN the PR cannot merge until the run is green

#### Scenario: Green run unblocks merge

- GIVEN a backend PR whose CI run passes `npm test` and lint
- WHEN the required checks complete
- THEN the PR is mergeable

### Requirement: Frontend CI gate

The frontend repo MUST have a workflow that runs typecheck, lint, and build on push to the default branch and on pull requests, and the jobs MUST be required status checks before merge.

#### Scenario: Type error blocks merge

- GIVEN a frontend PR whose typecheck job fails
- WHEN checking merge eligibility
- THEN the PR cannot merge until the run is green

#### Scenario: All jobs green

- GIVEN a frontend PR where typecheck, lint, and build succeed
- WHEN the required checks complete
- THEN the PR is mergeable

### Requirement: Worker CI smoke gate

The worker repo MUST have a workflow that runs a smoke test (boot the worker and verify it starts) on push to the default branch and on pull requests, and the job MUST be a required status check before merge.

#### Scenario: Boot failure blocks merge

- GIVEN a worker PR whose smoke test fails to boot the worker
- WHEN checking merge eligibility
- THEN the PR cannot merge until the smoke test passes

#### Scenario: Worker boots successfully

- GIVEN a worker PR whose smoke test boots the worker cleanly
- WHEN the required check completes
- THEN the PR is mergeable

## Deviation Note (2026-10-04, archived)

The requirements above describe the intended remote CI gates. At archive time the
implemented reality differs by **explicit user decision (CERO GitHub Actions)** —
the GitHub account is billing-locked and the user will not use Actions. Recorded in
apply-progress (Engram memory #733) and tasks.md Phase 7.

- The `backend-ci`, `frontend-ci`, and `worker-smoke` workflows were created and
  then **removed** from the three module repos; only the pre-existing deploy
  workflows remain (backend/worker SSH to Hetzner, frontend Firebase).
- **Branch protection / required status checks** were applied and then removed via
  `DELETE /branches/main/protection` on the three module repos (verified GET 404 at
  apply time).
- The CI capability is instead enforced by the **local gate**
  `scripts/verify-local.sh` at the root repo (runs `npm ci` + lint + test per
  module, reports OK/FAIL) plus the git push/pull flow, and by per-module local
  gates: backend `npm test` (node --test) + lint, frontend `typecheck` + `lint:ci`
  + build, worker `npm run smoke`.
- The scenarios "failing test blocks merge" / "required checks" are **not
  applicable** in this reality; they are reported as deviated (not compliant) in
  the change's verify report.

See the archived change `openspec/changes/archive/2026-10-04-remediation/` and its
`verify-report.md` for full evidence.