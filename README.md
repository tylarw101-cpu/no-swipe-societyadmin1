# No Swipe Society — Admin

Curated matchmaking admin console (30+ / Temecula & SoCal).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_GITHUB/your-repo)

## Quick start
1. **Clone or upload** this repo to GitHub.
2. Click the **Deploy with Vercel** button above → connect GitHub → add **Supabase Integration**.
3. In Supabase → run the **All-in-One SQL** from your setup guide.
4. Add yourself as `role = 'admin'` in the `users` table.

## Env vars (Vercel → Project → Settings → Environment Variables)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE` *(server only)*
- `STRIPE_SECRET_KEY` *(optional for memberships page)*

## Dev
```
npm install
npm run dev
```
