# AOTR Shop

A Roblox item shop for Attack on Titan Revolution (AOTR). Single-seller storefront with Supabase backend, NOWPayments USDT checkout, and Vercel hosting.

---

## Tech Stack

- Vanilla HTML / CSS / JS (no frameworks)
- [Supabase](https://supabase.com) — database, auth, realtime
- [NOWPayments](https://nowpayments.io) — USDT crypto checkout
- [Vercel](https://vercel.com) — hosting + serverless API routes

---

## Project Structure

```
aotrshop/
├── index.html          Home page
├── shop.html           Item catalog with filters
├── item.html           Item detail page (?id=)
├── accounts.html       AOTR accounts for sale
├── cart.html           Cart + USDT checkout
├── profile.html        Order history, favorites, settings
├── chat.html           Per-order realtime chat (?order=)
├── reviews.html        All reviews + submit form
├── tutorial.html       How-to-buy guide
├── faq.html            FAQ accordion
├── admin.html          Admin panel (role-gated)
├── css/
│   └── main.css        Global styles
├── js/
│   ├── config.js       Supabase client + placeholder data
│   ├── auth.js         Auth module + login modal
│   ├── cart.js         Cart (localStorage)
│   ├── nav.js          Shared navbar injection
│   ├── shop.js         Shop page
│   ├── item.js         Item detail page
│   ├── accounts.js     Accounts page
│   ├── cart-page.js    Cart page + checkout
│   ├── profile.js      Profile page
│   ├── chat.js         Order chat (Supabase realtime)
│   ├── reviews.js      Reviews page
│   └── admin.js        Admin panel
└── api/
    ├── create-invoice.js          NOWPayments invoice creation
    └── nowpayments-webhook.js     IPN payment confirmation webhook
```

---

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** and run the schema below.
3. Copy your **Project URL** and **Anon Key** from **Settings → API**.

#### Database Schema (run in SQL Editor)

```sql
-- Items
create table items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,
  description text,
  price_usd numeric(10,2) not null,
  required_prestige int default 0,
  required_gems int default 0,
  required_gold int default 0,
  image_url text,
  in_stock boolean default true,
  is_featured boolean default false,
  created_at timestamptz default now()
);

-- Accounts for sale
create table accounts_for_sale (
  id uuid default gen_random_uuid() primary key,
  prestige_level int not null,
  price_usd numeric(10,2) not null,
  has_shadow_ban boolean default false,
  has_legendary_family boolean default false,
  has_thunder_spears boolean default false,
  has_serums boolean default false,
  description text,
  in_stock boolean default true,
  created_at timestamptz default now()
);

-- Orders
create table orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  items_json text,
  roblox_username text not null,
  total_usd numeric(10,2) not null,
  payment_status text default 'pending',
  delivery_status text default 'pending',
  nowpayments_id text,
  created_at timestamptz default now()
);

-- Order messages (chat)
create table order_messages (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  sender_role text not null check (sender_role in ('buyer', 'seller')),
  message text not null,
  created_at timestamptz default now()
);

-- Reviews
create table reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  order_id uuid references orders(id),
  rating int not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz default now()
);

-- Favorites
create table favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  item_id uuid references items(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, item_id)
);
```

#### Row-Level Security (RLS)

Enable RLS on all tables. Example policies:

```sql
-- Items: public read
alter table items enable row level security;
create policy "items_public_read" on items for select using (true);
create policy "items_admin_write" on items for all using (auth.jwt()->>'role' = 'admin');

-- Orders: users see their own orders
alter table orders enable row level security;
create policy "orders_own" on orders for all using (auth.uid() = user_id);

-- Order messages: buyer sees messages for their orders
alter table order_messages enable row level security;
create policy "messages_own" on order_messages for select
  using (exists (select 1 from orders where orders.id = order_messages.order_id and orders.user_id = auth.uid()));
create policy "messages_insert_buyer" on order_messages for insert
  with check (sender_role = 'buyer' and exists (select 1 from orders where orders.id = order_messages.order_id and orders.user_id = auth.uid()));

-- Reviews: public read, authenticated write
alter table reviews enable row level security;
create policy "reviews_public_read" on reviews for select using (true);
create policy "reviews_auth_insert" on reviews for insert with check (auth.uid() = user_id);
```

#### Realtime (for chat)

Enable realtime on the `order_messages` table in **Database → Replication**.

#### Admin role

To grant admin access to a user, run in SQL Editor:

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
where email = 'your-admin-email@example.com';
```

---

### 2. NOWPayments

1. Sign up at [nowpayments.io](https://nowpayments.io).
2. Create an API key in your dashboard.
3. Under **IPN / Webhook**, note your IPN Secret key.

---

### 3. Environment Variables

#### For local development

Edit `js/config.js` and replace:

```js
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

#### For Vercel (production)

Set these in **Vercel → Project → Settings → Environment Variables**:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (webhook only — never expose client-side) |
| `NOWPAYMENTS_API_KEY` | NOWPayments API key |
| `NOWPAYMENTS_IPN_SECRET` | NOWPayments IPN secret for webhook signature verification |

Also update `js/config.js` to read from injected env vars in production, or simply replace the placeholder strings with your values before deployment.

---

### 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# From project root
vercel

# Follow prompts — set framework to "Other", output dir to "."
```

After deployment, set your webhook URL in NOWPayments dashboard to:
```
https://your-domain.vercel.app/api/nowpayments-webhook
```

---

### 5. GitHub Pages (static only)

GitHub Pages only serves static files and cannot run the `/api` serverless functions. Use GitHub Pages only for previewing the front-end design. For full functionality (checkout + webhooks), deploy to Vercel.

---

## Item Images

Upload item images to Supabase Storage:

1. **Storage → New bucket** named `items` (public).
2. Upload images.
3. Copy the public URL and paste it into the `image_url` column via the Supabase Table Editor or `INSERT` SQL.

---

## Placeholder Mode

The shop works without Supabase connected. All pages show placeholder items, accounts, and reviews so you can preview the design immediately. Placeholder mode is active when `SUPABASE_URL === 'YOUR_SUPABASE_URL'` in `js/config.js`.
