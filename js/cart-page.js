// ─── Manual payment config ────────────────────────────────────────────────
const MANUAL_WALLET = 'YOUR_USDT_TRC20_ADDRESS';       // ← paste your TRC-20 wallet here
const DISCORD_LINK  = 'https://discord.gg/YOUR_INVITE'; // ← paste your Discord invite here
// ─────────────────────────────────────────────────────────────────────────

// Cart page rendering + checkout

function renderTradeSlots() {
  const items = Cart.get();
  const slotsEl = document.getElementById('trade-slots');
  const countEl = document.getElementById('trade-slot-count');
  const emptyEl = document.getElementById('cart-empty');
  const contentEl = document.getElementById('cart-content');

  if (!items.length) {
    if (emptyEl) emptyEl.style.display = 'block';
    if (contentEl) contentEl.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (contentEl) contentEl.style.display = 'grid';
  if (countEl) countEl.textContent = `${items.length} / 9 slots`;

  // Build 9 slots
  const slots = [];
  for (let i = 0; i < 9; i++) {
    const item = items[i];
    if (item) {
      slots.push(`
        <div class="trade-slot filled">
          ${item.image_url
            ? `<img class="trade-slot-img" src="${item.image_url}" alt="${item.name}">`
            : `<div style="width:56%;height:56%;background:linear-gradient(135deg,#1a1a1a,#222);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:.5rem;color:var(--text-faint);font-weight:600;letter-spacing:.05em;">AOTR</div>`
          }
          <span class="trade-slot-name">${item.name}</span>
          <button class="trade-slot-remove" onclick="removeFromCart('${item.id}')" title="Remove">
            <svg width="8" height="8" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      `);
    } else {
      slots.push(`<div class="trade-slot"><div class="trade-slot-placeholder"></div></div>`);
    }
  }

  if (slotsEl) slotsEl.innerHTML = slots.join('');
  updateSummary(items);
}

function updateSummary(items) {
  const subtotal = items.reduce((s, i) => s + i.price_usd, 0);
  const totalGems = items.reduce((s, i) => s + (i.required_gems || 0), 0);
  const totalGold = items.reduce((s, i) => s + (i.required_gold || 0), 0);
  const maxPrestige = items.reduce((m, i) => Math.max(m, i.required_prestige || 0), 0);

  const gemEl = document.getElementById('cart-gem-tax');
  const goldEl = document.getElementById('cart-gold-tax');
  const presEl = document.getElementById('cart-prestige-req');
  if (gemEl) gemEl.textContent = totalGems > 0 ? `${totalGems} gems` : '0 gems';
  if (goldEl) goldEl.textContent = totalGold > 0 ? `${totalGold} gold` : '0 gold';
  if (presEl) presEl.textContent = maxPrestige > 0 ? `Prestige ${maxPrestige}+` : 'None';

  document.getElementById('summary-items').textContent = items.length;
  document.getElementById('summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('summary-total').textContent = `$${subtotal.toFixed(2)}`;

  const checkoutBtn  = document.getElementById('checkout-btn');
  const minOrderErr  = document.getElementById('min-order-error');
  const belowMin     = subtotal < 5;
  if (checkoutBtn) checkoutBtn.disabled = belowMin;
  if (minOrderErr)  minOrderErr.style.display = belowMin ? 'block' : 'none';
}

function removeFromCart(id) {
  Cart.remove(id);
  renderTradeSlots();
}

// ─── Payment method selection ──────────────────────────────────────────────
let currentPayMethod = 'manual';

function selectPayMethod(method) {
  currentPayMethod = method;
  document.getElementById('pm-manual').classList.toggle('active', method === 'manual');
  document.getElementById('pm-auto').classList.toggle('active', method === 'auto');
  const btnText = document.getElementById('checkout-btn-text');
  if (btnText) btnText.textContent = method === 'auto' ? 'Pay with Crypto (Auto)' : 'Pay via Discord';
}

// ─── Manual payment modal ──────────────────────────────────────────────────
function openManualModal() {
  const items = Cart.get();
  const total = items.reduce((s, i) => s + i.price_usd, 0).toFixed(2);
  document.getElementById('modal-amount').textContent = `$${total}`;
  document.getElementById('modal-wallet').textContent = MANUAL_WALLET;
  document.getElementById('discord-btn').href = DISCORD_LINK;
  document.getElementById('copy-btn').textContent = 'Copy';
  document.getElementById('manual-pay-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeManualModal() {
  document.getElementById('manual-pay-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function copyWallet() {
  navigator.clipboard.writeText(MANUAL_WALLET).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
  });
}

// ─── Checkout ──────────────────────────────────────────────────────────────
async function handleCheckout() {
  const robloxUsername = document.getElementById('roblox-username')?.value.trim();
  const robloxError = document.getElementById('roblox-error');

  if (!robloxUsername) {
    robloxError?.classList.add('show');
    return;
  }
  robloxError?.classList.remove('show');

  if (!Auth.currentUser) {
    showToast('Please sign in to place an order.', 'error');
    AuthModal.open();
    return;
  }

  const items = Cart.get();
  if (!items.length) { showToast('Your cart is empty.', 'error'); return; }

  // Manual Discord payment — just show the modal
  if (currentPayMethod === 'manual') {
    openManualModal();
    return;
  }

  // Auto Plisio payment
  const checkoutBtn = document.getElementById('checkout-btn');
  const loadingEl   = document.getElementById('checkout-loading');

  checkoutBtn.style.display = 'none';
  loadingEl.style.display   = 'block';

  const total = items.reduce((s, i) => s + i.price_usd, 0).toFixed(2);

  try {
    let orderId = null;
    if (SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
      const { data: order, error } = await db.from('orders').insert({
        user_id:          Auth.currentUser.id,
        items_json:       JSON.stringify(items),
        roblox_username:  robloxUsername,
        total_usd:        parseFloat(total),
        payment_status:   'pending',
        delivery_status:  'pending'
      }).select().single();

      if (error) throw new Error(error.message);
      orderId = order.id;
    }

    const finalOrderId = orderId || `local-${Date.now()}`;
    const invoiceRes = await fetch('/api/create-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount:            total,
        order_id:          finalOrderId,
        order_description: `AOTR Shop — ${items.length} item(s) for ${robloxUsername}`,
        success_url:       `https://aotrshop.vercel.app/success?order=${finalOrderId}`,
        fail_url:          `https://aotrshop.vercel.app/failed`
      })
    });

    if (!invoiceRes.ok) {
      const err = await invoiceRes.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create payment invoice.');
    }

    const { payment_url } = await invoiceRes.json();
    Cart.clear();
    window.location.href = payment_url;

  } catch (err) {
    checkoutBtn.style.display = '';
    loadingEl.style.display   = 'none';
    showToast(err.message || 'Checkout failed. Please try again.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderTradeSlots();

  document.addEventListener('cart:updated', renderTradeSlots);

  document.getElementById('roblox-username')?.addEventListener('input', () => {
    document.getElementById('roblox-error')?.classList.remove('show');
  });

  document.getElementById('checkout-btn')?.addEventListener('click', handleCheckout);
});
