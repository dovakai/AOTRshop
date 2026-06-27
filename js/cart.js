// Cart — localStorage-backed, max 9 items (AOTR trade limit)

const CART_KEY = 'aotr_cart';
const CART_MAX = 9;

const Cart = {
  get() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  },

  save(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    Cart._dispatch();
  },

  add(item) {
    const items = Cart.get();
    if (items.length >= CART_MAX) {
      showToast(`Cart is full. Max ${CART_MAX} items (AOTR trade limit).`, 'error');
      return false;
    }
    const existing = items.findIndex(i => String(i.id) === String(item.id));
    if (existing >= 0) {
      showToast(`${item.name} is already in your cart.`, 'info');
      return false;
    }
    items.push({ id: item.id, name: item.name, category: item.category,
      price_usd: item.price_usd, image_url: item.image_url,
      required_gems: item.required_gems || 0,
      required_gold: item.required_gold || 0,
      required_prestige: item.required_prestige || 0 });
    Cart.save(items);
    showToast(`${item.name} added to cart.`, 'success');
    return true;
  },

  remove(id) {
    const items = Cart.get().filter(i => String(i.id) !== String(id));
    Cart.save(items);
  },

  clear() {
    localStorage.removeItem(CART_KEY);
    Cart._dispatch();
  },

  count() { return Cart.get().length; },

  total() { return Cart.get().reduce((s, i) => s + i.price_usd, 0); },


  _dispatch() {
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: Cart.count() } }));
  }
};

// Update nav badge on cart change
document.addEventListener('cart:updated', e => {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const n = e.detail.count;
  badge.textContent = n;
  badge.classList.toggle('visible', n > 0);
});

// Init badge on page load
document.addEventListener('DOMContentLoaded', () => {
  const badge = document.getElementById('cart-badge');
  if (badge) {
    const n = Cart.count();
    badge.textContent = n;
    badge.classList.toggle('visible', n > 0);
  }
});
