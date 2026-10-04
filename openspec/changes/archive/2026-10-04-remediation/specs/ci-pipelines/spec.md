# Delta for ci-pipelines

Purpose: give each module repo a GitHub Actions gate that runs its verification commands and blocks merges when red.

## ADDED Requirements

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