# Account deletion runbook

## What the app does

When a signed-in user confirms deletion in **Settings → Data & Privacy**, the app creates a `pending` row in `public.account_deletion_requests` and signs the user out. It does not delete anything immediately.

## Administrator procedure

Use the Supabase dashboard with an administrator account:

1. Open **Table Editor → account_deletion_requests** and locate pending requests.
2. Verify ownership using the account email through your approved support process.
3. Mark the request `verified` and set `reviewed_at`.
4. When ready to permanently delete the account, run this in **SQL Editor**, replacing the UUID:

```sql
update public.account_deletion_requests
set status = 'completed', completed_at = now()
where user_id = 'REQUESTING_USER_UUID'
  and status in ('pending', 'verified');

delete from auth.users
where id = 'REQUESTING_USER_UUID';
```

The foreign keys cascade and remove that user's transactions and plans. The completed request is retained as an audit record without a user ID. This is irreversible.

5. Record completion in your support system and notify the user by email.

Never expose the Supabase service-role key in the app or browser. Only a trusted administrator should perform the deletion.
