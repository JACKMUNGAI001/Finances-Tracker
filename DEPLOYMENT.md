# Supabase setup

1. In Supabase, open **SQL Editor** and run every migration in
   `supabase/migrations/` in filename order. This creates the transactions
   table and the shared Goals/Budgets plan store.
2. In **Authentication → Providers**, ensure Email is enabled.
3. For development, add `http://localhost:5173` to **Authentication → URL Configuration → Redirect URLs**.
4. Deploy the `client` folder to a static host such as Vercel or Netlify. Set
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` there, then add the
   production website URL to Supabase's Redirect URLs.

Supabase provides the database and authentication for this app. It does not
serve this Vite single-page app as a static website, so a static host is still
required for the frontend.
