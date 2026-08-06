// AOTR Shop вЂ” Supabase config & placeholder data
// Replace YOUR_* values with your actual credentials

const SUPABASE_URL = 'https://tslftdqkigasggatohas.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzbGZ0ZHFraWdhc2dnYXRvaGFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0OTg4ODUsImV4cCI6MjA5ODA3NDg4NX0.iWSUOpLg8MoTpC9MYHAEEH0fY613qlSTZTzKrW8HMk8';
const NOWPAYMENTS_API_KEY = ''; // unused in browser — key lives in Vercel env vars

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// в”Ђв”Ђ Placeholder data (shown when Supabase is not yet connected) в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

const PLACEHOLDER_ITEMS = [
  {
    id: 'p1', name: 'Colossal Titan Serum', category: 'Serums',
    description: 'Rare serum that grants the Colossal Titan ability. One of the most powerful and sought-after serums in all of AOTR.',
    price_usd: 4.99, required_prestige: 2, required_gems: 150, required_gold: 800,
    image_url: null, in_stock: true, is_featured: true, rating: 4.9, review_count: 312
  },
  {
    id: 'p2', name: 'Ackerman Family', category: 'Families',
    description: 'Join the legendary Ackerman bloodline. Grants exceptional combat abilities, boosted stats, and unique titan-slaying perks.',
    price_usd: 5.99, required_prestige: 2, required_gems: 250, required_gold: 1000,
    image_url: null, in_stock: true, is_featured: true, rating: 4.8, review_count: 189
  },
  {
    id: 'p3', name: 'Female Titan Serum', category: 'Serums',
    description: 'Transform into the powerful Female Titan with crystal hardening ability and titan-calling scream.',
    price_usd: 3.99, required_prestige: 1, required_gems: 100, required_gold: 600,
    image_url: null, in_stock: true, is_featured: true, rating: 4.7, review_count: 143
  },
  {
    id: 'p4', name: 'Thunder Spear Set', category: 'Artifacts',
    description: 'Full set of 10 Thunder Spears. Devastating explosive weapons used by the Survey Corps anti-titan squads.',
    price_usd: 2.49, required_prestige: 1, required_gems: 50, required_gold: 300,
    image_url: null, in_stock: true, is_featured: true, rating: 4.6, review_count: 97
  },
  {
    id: 'p5', name: 'Attack Titan Serum', category: 'Serums',
    description: 'The legendary Attack Titan serum. Harness the power to see the memories of past and future inheritors.',
    price_usd: 6.99, required_prestige: 3, required_gems: 300, required_gold: 1500,
    image_url: null, in_stock: true, is_featured: true, rating: 4.9, review_count: 445
  },
  {
    id: 'p6', name: 'Beast Titan Serum', category: 'Serums',
    description: 'Become the towering Beast Titan with long-range crystalline projectile attack ability.',
    price_usd: 5.49, required_prestige: 3, required_gems: 200, required_gold: 1200,
    image_url: null, in_stock: true, is_featured: false, rating: 4.7, review_count: 201
  },
  {
    id: 'p7', name: 'Survey Corps Perk', category: 'Perks',
    description: 'Join the Survey Corps for exclusive bonuses to ODM gear speed, stamina regen, and vertical maneuver distance.',
    price_usd: 1.99, required_prestige: 0, required_gems: 25, required_gold: 150,
    image_url: null, in_stock: true, is_featured: false, rating: 4.5, review_count: 68
  },
  {
    id: 'p8', name: 'Founder Crystal', category: 'Market Items',
    description: 'A rare crystalline shard imbued with remnant power of the Founding Titan. Used in advanced crafting recipes.',
    price_usd: 3.49, required_prestige: 2, required_gems: 75, required_gold: 500,
    image_url: null, in_stock: true, is_featured: false, rating: 4.6, review_count: 112
  },
  {
    id: 'p9', name: 'Armored Titan Serum', category: 'Serums',
    description: 'Armored Titan serum granting full-body hardening and near-impenetrable defense capabilities.',
    price_usd: 4.49, required_prestige: 2, required_gems: 175, required_gold: 900,
    image_url: null, in_stock: true, is_featured: false, rating: 4.7, review_count: 156
  },
  {
    id: 'p10', name: 'Military Police Perk', category: 'Perks',
    description: 'Exclusive Military Police perk granting access to inner-wall districts and increased gold income.',
    price_usd: 1.49, required_prestige: 0, required_gems: 20, required_gold: 100,
    image_url: null, in_stock: true, is_featured: false, rating: 4.5, review_count: 54
  },
  {
    id: 'p11', name: 'Titan Cosmetic Bundle', category: 'Cosmetics',
    description: 'Rare cosmetic set including titan-skin trail, nape glow effect, and transform animation.',
    price_usd: 2.99, required_prestige: 1, required_gems: 60, required_gold: 400,
    image_url: null, in_stock: true, is_featured: false, rating: 4.6, review_count: 88
  },
  {
    id: 'p12', name: 'Market Coins x500', category: 'Market Items',
    description: 'Bundle of 500 in-game market coins used for purchasing limited rotational items from the in-game shop.',
    price_usd: 3.99, required_prestige: 0, required_gems: 0, required_gold: 0,
    image_url: null, in_stock: true, is_featured: false, rating: 4.4, review_count: 43
  }
];
PLACEHOLDER_ITEMS.forEach(i => { if (!i.game) i.game = 'AOTR'; });

const PLACEHOLDER_ACCOUNTS = [
  {
    id: 'a1', prestige_level: 5, price_usd: 49.99,
    has_shadow_ban: false, has_legendary_family: true, has_thunder_spears: true, has_serums: true,
    description: 'Max prestige account. Colossal Titan serum, Ackerman family, all rare items collected. Clean history, no bans.',
    in_stock: true
  },
  {
    id: 'a2', prestige_level: 3, price_usd: 24.99,
    has_shadow_ban: false, has_legendary_family: true, has_thunder_spears: true, has_serums: true,
    description: 'Prestige 3 account with Ackerman family, Attack Titan serum, and full thunder spear loadout.',
    in_stock: true
  },
  {
    id: 'a3', prestige_level: 2, price_usd: 14.99,
    has_shadow_ban: false, has_legendary_family: false, has_thunder_spears: true, has_serums: true,
    description: 'Solid prestige 2 account with Female Titan serum and 15 thunder spears ready to use.',
    in_stock: true
  },
  {
    id: 'a4', prestige_level: 1, price_usd: 7.99,
    has_shadow_ban: false, has_legendary_family: false, has_thunder_spears: false, has_serums: true,
    description: 'Starter prestige 1 account with Beast Titan serum. Good base to start grinding.',
    in_stock: true
  }
];

const PLACEHOLDER_REVIEWS = [
  {
    id: 'r1', username: 'Mikasa_fan99', rating: 5,
    comment: 'Incredibly fast delivery. Got my Ackerman family within 10 minutes of payment. Seller is professional and easy to trade with. Will definitely buy again.',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'r2', username: 'TitanSlayer_X', rating: 5,
    comment: 'Super reliable. Bought two serums and the trade was completed perfectly. Legit seller with no issues at all.',
    created_at: '2024-01-12T15:45:00Z'
  },
  {
    id: 'r3', username: 'SurveyCorps_Levi', rating: 4,
    comment: 'Great prices compared to other shops. Delivery took about 20 minutes but seller communicated throughout. Worth every cent.',
    created_at: '2024-01-10T09:15:00Z'
  }
];

// Utility: get items from Supabase, fall back to placeholders
async function fetchItems(filters = {}) {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    let items = [...PLACEHOLDER_ITEMS];
    if (filters.category) items = items.filter(i => i.category === filters.category);
    if (filters.game) items = items.filter(i => i.game === filters.game);
    if (filters.featured) items = items.filter(i => i.is_featured);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }
    if (filters.sort === 'price_asc') items.sort((a, b) => a.price_usd - b.price_usd);
    else if (filters.sort === 'price_desc') items.sort((a, b) => b.price_usd - a.price_usd);
    else items.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    return { data: items, error: null };
  }

  let query = db.from('items').select('*').eq('in_stock', true);
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.game) query = query.eq('game', filters.game);
  if (filters.featured) query = query.eq('is_featured', true);
  if (filters.search) query = query.ilike('name', `%${filters.search}%`);
  if (filters.sort === 'price_asc') query = query.order('price_usd', { ascending: true });
  else if (filters.sort === 'price_desc') query = query.order('price_usd', { ascending: false });
  else query = query.order('is_featured', { ascending: false });
  return query;
}

async function fetchItemById(id) {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    const item = PLACEHOLDER_ITEMS.find(i => String(i.id) === String(id));
    return { data: item || null, error: item ? null : { message: 'Not found' } };
  }
  const { data, error } = await db.from('items').select('*').eq('id', id).single();
  return { data, error };
}

async function fetchAccounts(filters = {}) {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    let acc = [...PLACEHOLDER_ACCOUNTS];
    if (filters.prestige) acc = acc.filter(a => a.prestige_level === Number(filters.prestige));
    if (filters.has_legendary_family === 'yes') acc = acc.filter(a => a.has_legendary_family);
    if (filters.has_thunder_spears === 'yes') acc = acc.filter(a => a.has_thunder_spears);
    if (filters.has_serums === 'yes') acc = acc.filter(a => a.has_serums);
    if (filters.sort === 'price_asc') acc.sort((a, b) => a.price_usd - b.price_usd);
    if (filters.sort === 'price_desc') acc.sort((a, b) => b.price_usd - a.price_usd);
    return { data: acc, error: null };
  }
  let query = db.from('accounts_for_sale').select('*').eq('in_stock', true);
  if (filters.prestige) query = query.eq('prestige_level', filters.prestige);
  if (filters.has_legendary_family === 'yes') query = query.eq('has_legendary_family', true);
  if (filters.has_thunder_spears === 'yes') query = query.eq('has_thunder_spears', true);
  if (filters.has_serums === 'yes') query = query.eq('has_serums', true);
  if (filters.sort === 'price_asc') query = query.order('price_usd', { ascending: true });
  else if (filters.sort === 'price_desc') query = query.order('price_usd', { ascending: false });
  return query;
}

// Returns { rating, count } — uses item's own fields if set, otherwise derives
// consistent values from the item name so the same item always shows the same numbers
function getItemRating(item) {
  if (item.rating != null) return { rating: item.rating, count: item.review_count || 0 };
  let h = 0;
  const s = (item.name || '') + (item.id || '');
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  h = Math.abs(h);
  const count = h % 11;            // 0–10
  if (count === 0) return { rating: null, count: 0 };
  const rating = (4.4 + (h % 6) * 0.1).toFixed(1); // 4.4–4.9
  return { rating, count };
}

async function fetchReviews(limit = null) {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    const reviews = limit ? PLACEHOLDER_REVIEWS.slice(0, limit) : PLACEHOLDER_REVIEWS;
    return { data: reviews, error: null };
  }
  let query = db.from('reviews').select('*, profiles(username)').order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  return query;
}

async function fetchTrades(limit = 10) {
  let query = db.from('trades').select('*').order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  return query;
}

async function fetchTradesCount() {
  const { count, error } = await db.from('trades').select('*', { count: 'exact', head: true });
  return { count, error };
}

// ── Multi-game badges ─────────────────────────────────────────────────────
const GAME_BADGES = {
  'AOTR':             { label: 'Attack On Titan Revolution', gradient: '#7a0000, #c0392b, #ff4500, #ff7043, #c0392b, #7a0000' },
  'Blox Fruits':       { label: 'Blox Fruits',                gradient: '#0a3d5c, #1f7fb8, #4fc3f7, #7fd4f7, #1f7fb8, #0a3d5c' },
  'YBA':               { label: 'Your Bizarre Adventure',     gradient: '#3b0a5c, #7b2fbf, #c04fe0, #d98cf0, #7b2fbf, #3b0a5c' },
  'AUT':               { label: 'A Universal Time',           gradient: '#053b3f, #0e8a8f, #2fd9d0, #7ff0e8, #0e8a8f, #053b3f' },
  'Bridger: Western':  { label: 'Bridger: Western',           gradient: '#4a2c05, #a15c0f, #e0912b, #f0b95c, #a15c0f, #4a2c05' }
};

function gameBadgeMeta(game) {
  return GAME_BADGES[game] || GAME_BADGES['AOTR'];
}

// Top-right corner badge used on item cards (shop.js, index.html, profile.js)
function renderGameBadge(game) {
  const meta = gameBadgeMeta(game);
  return `<div class="game-badge-wrap" style="background:linear-gradient(90deg, ${meta.gradient});background-size:300% 100%;"><span class="game-badge">${meta.label}</span></div>`;
}

// Top-left badge used on proofs.html trade cards
function renderTradeBadge(game) {
  const meta = gameBadgeMeta(game);
  return `<div class="aotr-badge-wrap" style="background:linear-gradient(90deg, ${meta.gradient});background-size:300% 100%;"><span class="aotr-badge">${meta.label}</span></div>`;
}

