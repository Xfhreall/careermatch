# CareerMatch Supabase Setup

Run the migration first, then the seed file:

```bash
supabase db push
supabase db seed
```

Production environment variables:

```bash
DATABASE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
BETTER_AUTH_URL=
BETTER_AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
N8N_WEBHOOK_URL=
```

The seed creates sample `jobseeker`, `hrd`, and `superadmin` users. Replace the
seed emails with real Google account emails before using seeded role access in a
shared environment.
