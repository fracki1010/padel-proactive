# repo-hygiene

Purpose: consummate the 3-module migration with a secret-free, clean repository layout across the root, backend, frontend, and worker repos.

## Requirements

### Requirement: Root and backend history are free of the SSH key pair

The root repo and `padel-proactive-backend` MUST NOT contain `934664` or `934664.pub` in any commit reachable from any ref after the history rewrite, and the files MUST NOT exist in the working tree after checkout.

#### Scenario: Secret absent from rewritten history

- GIVEN `git filter-repo` removed `934664`/`934664.pub` and the rewrite was force-pushed
- WHEN running `git log --all --oneline -- 934664 934664.pub` in root and backend
- THEN no commits are returned
- AND a fresh clone of each remote shows no trace of the files

#### Scenario: Key files gone from working tree

- GIVEN the rewritten history is checked out
- WHEN listing the working tree
- THEN neither `934664` nor `934664.pub` exists on disk

### Requirement: Frontend environment files are untracked but retained locally

The frontend repo MUST NOT track `.env` or `.env.template` in its index; both files SHOULD remain present in the working tree for local development.

#### Scenario: Environment files out of the index

- GIVEN the frontend working tree contains `.env` and `.env.template`
- WHEN running `git ls-files` filtered for `.env`
- THEN no tracked file matches

#### Scenario: Local dev files preserved

- GIVEN `.env` and `.env.template` exist on disk after untracking
- WHEN checking the working tree
- THEN both files remain readable locally (untracked, not deleted)

### Requirement: Root .gitignore excludes secrets and generated artifacts

The root repo MUST have a `.gitignore` that ignores `*.env*`, private key files, `*.log`, `.wwebjs_auth/`, `dev-dist/`, and `.firebase/`.

#### Scenario: New secret file stays ignored

- GIVEN the restored `.gitignore` is active and a new `.env` file is created in the root
- WHEN running `git status --porcelain`
- THEN the `.env` file does not appear as untracked

#### Scenario: Logs and auth dirs ignored

- GIVEN a `*.log` file, `.wwebjs_auth/`, and `.firebase/` entry exist in the root
- WHEN running `git status --porcelain`
- THEN none of them appear as untracked

### Requirement: gitleaks blocks secret commits in all four repos

Every repo (root, backend, frontend, worker) MUST run gitleaks as a pre-commit hook, and a commit containing a secret MUST be rejected.

#### Scenario: Secret commit rejected

- GIVEN gitleaks pre-commit is installed in a repo
- WHEN attempting to commit a file containing a real-style secret
- THEN the commit fails with a non-zero exit and the secret is reported

#### Scenario: Clean commit passes

- GIVEN gitleaks pre-commit is installed
- WHEN committing a change with no secrets
- THEN the commit succeeds

### Requirement: Root consummates the module migration

The root repo MUST commit the removal of monolithic sources so that only orchestration/workspace files remain, and MUST NOT contain `firebase-debug.log`.

#### Scenario: Clean workspace after consummation

- GIVEN the monolith deletions are staged
- WHEN committing and running `git status --porcelain`
- THEN the working tree is clean, with the root holding only orchestration, workspace, and `openspec/` files

#### Scenario: Debug log absent

- GIVEN the consummation commit is done
- WHEN checking for `firebase-debug.log`
- THEN the file does not exist in the root

### Requirement: Split compose file is valid

`docker-compose.split.yml` MUST point the backend service context at `padel-proactive-backend` and MUST validate with the Docker Compose CLI.

#### Scenario: Compose config validates

- GIVEN the backend context is fixed to `./padel-proactive-backend`
- WHEN running `docker compose -f docker-compose.split.yml config`
- THEN the command exits 0 and resolves the backend build context

### Requirement: Backend monolith splits preserve behavior

`messageHandler.js` and `config.routes.js` MUST be split into per-domain modules with identical external exports, and the backend MUST pass its `node --test` suite and lint after the split.

#### Scenario: Suite green post-split

- GIVEN the backend files have been split into per-domain modules
- WHEN running `npm test` (`node --test`)
- THEN all tests pass

#### Scenario: Lint green post-split

- GIVEN the split is complete
- WHEN running the backend linter
- THEN no lint errors are reported

### Requirement: Frontend split preserves behavior

`configService.ts` MUST be split into per-domain modules, and the frontend MUST pass typecheck, lint, and build after the split.

#### Scenario: Typecheck, lint, and build green

- GIVEN `configService.ts` has been split into per-domain modules
- WHEN running typecheck, `npm run lint`, and `npm run build`
- THEN all three succeed