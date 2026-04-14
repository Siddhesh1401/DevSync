# Phase 3: GitHub Integration & PR Sync

## Overview
Phase 3 establishes the primary data pipeline for DevSync. It enables users to securely connect their GitHub repositories to their DevSync teams and automatically ingests GitHub events (Pull Requests, Commits) via Webhooks.

## Architecture

### 1. Webhook Wizard (`/dashboard/repos`)
We added a wizard to guide users through connecting a repository:
* Evaluates the active team.
* Takes a GitHub URL and isolates the `owner/repo_name`.
* Generates a unique payload URL explicitly mapped to our `/api/webhook/github` endpoint.
* Distributes a secure cryptographic `secret` for HMAC validation.
* Integrates visual states showing whether the connection is `✅ Connected` or `⏳ Pending`.

### 2. Webhook Event Handler (`POST /api/webhook/github`)
The core integration mechanic is an Express endpoint built strictly for GitHub's webhook dispatcher.
* **Security First (`validateWebhookSignature`)**: Compares the incoming `x-hub-signature-256` digest securely against an HMAC digest generated using the `GITHUB_WEBHOOK_SECRET` environment variable to prevent forged requests.
* **Supported Events**:
  * `ping`: Validates the connection upon first creation and flips the repo to `is_connected = true`.
  * `push`: Notifies DevSync when commits occur on tracked branches, feeding into the Team Activity stream.
  * `pull_request`: Identifies `opened`, `synchronize`, `closed`, and `reopened` states, translating them into row updates/inserts within the Supabase `pull_requests` table.

### 3. Database Upserts & Normalization
The `webhook.ts` securely looks up the repository ID from the database using its `full_name` mapping, ensuring data boundaries remain confined to the specific Team that owns the payload repository.

* On PR events, it performs a PostgreSQL atomic `UPSERT` command targeting `pull_requests`, mapping GitHub payload data accurately to local columns (like `merged_at`, `status`, `commits_count`).
* Emits descriptive event entries automatically into `activity_events` (e.g. "Dev A opened PR #23: Feature login").

### 4. PR Dashboard (`/dashboard/prs`)
A grid interface querying from the `pull_requests` database table displaying all active and merged PRs across the team's repositories. Contains clickable external references back to GitHub (`View on GitHub ↗`).

## Development & Testing Workflow
Due to the isolated nature of local environments, normal webhooks cannot reach `localhost`.
During the testing phase, we introduced **Ngrok** to create a secure tunnel:
1. Ran `ngrok http 3001` to expose the Express backend.
2. Formatted the `Payload URL` with the generated `.ngrok-free.app` domain.
3. Verified the end-to-end event dispatch from GitHub triggering Node server console logs and Supabase row generation successfully.

## Next Steps Pivot
Completing this phase confirms the underlying data synchronization is active.
In Phase 4, we will harness the Activity Events derived from Phase 3 to build an extensive notification system, dispatching alerts immediately when crucial webhook updates trigger.
