# Account deletion runbook

## What the app does

When a signed-in user confirms deletion in **Settings → Data & Privacy**, the app calls the protected `delete-account` Edge Function. The function verifies the signed-in user, permanently deletes only that user's account, and signs the user out. It also retains a completed audit row in `public.account_deletion_requests`.

## Administrator procedure

Use the Supabase dashboard with an administrator account:

1. Open **Table Editor → account_deletion_requests** to review completed audit records.
2. If the function reports a failure, inspect Edge Function logs before asking the user to try again.

Never expose the Supabase service-role key in the app or browser. It is used only by the deployed Edge Function.
