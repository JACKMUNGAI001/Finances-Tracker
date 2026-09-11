-- The delete-account Edge Function uses the server-only service role to
-- write an audit record before permanently deleting the authenticated user.
grant select, insert, update on table public.account_deletion_requests to service_role;
