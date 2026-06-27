// Item detail page

let currentItem = null;
let qty = 1;

function renderItemPage(item) {
  currentItem = item;
  const reqs = [];
  if (item.required_prestige > 0) reqs.push({ label: 'Required Prestige', val: `Prestige ${item.required_prestige}+` });
  if (item.required_gems > 0) reqs.push({ label: 'Required Gems', val: `${item.required_gems} Gems` });
  if (item.required_gold > 0) reqs.push({ label: 'Required Gold', val: `${item.required_gold} Gold` });

  document.title = `${item.name} — AOTR Shop`;
  const bc = document.getElementById('breadcrumb-name');
  if (bc) bc.textContent = item.name;

  document.getElementById('item-content').innerHTML = `
    <div class="item-detail-grid">

      <!-- Image -->
      <div class="item-detail-img-wrap">
        ${item.image_url
          ? `<img class="item-detail-img" src="${item.image_url}" alt="${item.name}">`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:var(--text-faint);">
              <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24" style="opacity:.15">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
              <span style="font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;">No Image</span>
            </div>`
        }
      </div>

      <!-- Info -->
      <div class="item-detail-info">
        <div>
          <div class="item-detail-cat">${item.category}</div>
          <h1 class="item-detail-name" style="margin-top:6px;">${item.name}</h1>
          ${item.is_featured ? '<span class="item-badge badge-hot" style="position:static;margin-top:10px;display:inline-block;">HOT</span>' : ''}
        </div>

        <p class="item-detail-desc">${item.description}</p>

        <!-- Price block -->
        <div class="item-detail-price-block">
          <div class="item-detail-price">$${item.price_usd.toFixed(2)} <span style="font-size:.9rem;color:var(--text-faint);font-weight:400;">USDT</span></div>

          ${reqs.map(r => `
            <div class="item-detail-row">
              <span class="item-detail-row-label">${r.label}</span>
              <span class="item-detail-row-val">${r.val}</span>
            </div>
          `).join('')}

          <!-- Quantity -->
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px;">
            <span style="font-size:.85rem;color:var(--text-muted);">Quantity</span>
            <div class="qty-control">
              <button class="qty-btn" id="qty-minus">-</button>
              <span class="qty-val" id="qty-val">1</span>
              <button class="qty-btn" id="qty-plus">+</button>
            </div>
          </div>

          <div style="display:flex;gap:10px;margin-top:8px;">
            <button class="btn btn-primary" style="flex:1;" id="add-to-cart-btn" ${!item.in_stock ? 'disabled style="opacity:.5;cursor:not-allowed;"' : ''}>
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>
              </svg>
              ${item.in_stock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button class="btn btn-outline" id="fav-btn" title="Add to favorites">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Trade explainer -->
        <div class="trade-explainer">
          <strong style="color:var(--text);display:block;margin-bottom:4px;">How the trade works</strong>
          After payment is confirmed, you will receive a link to the order chat. Our seller will contact you there to coordinate the in-game trade. Make sure your Roblox username is correct and that you meet the requirements listed above.
        </div>
      </div>
    </div>
  `;

  // Qty controls
  document.getElementById('qty-minus')?.addEventListener('click', () => {
    if (qty > 1) { qty--; document.getElementById('qty-val').textContent = qty; }
  });
  document.getElementById('qty-plus')?.addEventListener('click', () => {
    if (qty < 9) { qty++; document.getElementById('qty-val').textContent = qty; }
    else showToast('Max 9 items per order (AOTR trade limit).', 'error');
  });

  // Add to cart
  document.getElementById('add-to-cart-btn')?.addEventListener('click', () => {
    if (!item.in_stock) return;
    for (let i = 0; i < qty; i++) {
      const added = Cart.add(item);
      if (!added) break;
    }
  });

  // Favorites
  const favBtn = document.getElementById('fav-btn');
  const favs = JSON.parse(localStorage.getItem('aotr_favs') || '[]');
  if (favs.includes(String(item.id))) {
    favBtn.style.borderColor = 'var(--gold)';
    favBtn.style.color = 'var(--gold)';
  }

  favBtn?.addEventListener('click', () => {
    if (!Auth.currentUser) { AuthModal.open(); return; }
    const favs = JSON.parse(localStorage.getItem('aotr_favs') || '[]');
    const idx = favs.indexOf(String(item.id));
    if (idx >= 0) {
      favs.splice(idx, 1);
      favBtn.style.borderColor = '';
      favBtn.style.color = '';
      showToast('Removed from favorites.', 'info');
    } else {
      favs.push(String(item.id));
      favBtn.style.borderColor = 'var(--gold)';
      favBtn.style.color = 'var(--gold)';
      showToast('Added to favorites.', 'success');
    }
    localStorage.setItem('aotr_favs', JSON.stringify(favs));
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    document.getElementById('item-content').innerHTML = '<p style="color:var(--text-faint);">No item specified.</p>';
    return;
  }

  const { data, error } = await fetchItemById(id);

  if (error || !data) {
    document.getElementById('item-content').innerHTML = `
      <div style="text-align:center;padding:60px 0;">
        <p style="color:var(--text-faint);margin-bottom:16px;">Item not found.</p>
        <a href="/shop.html" class="btn btn-outline">Back to Shop</a>
      </div>
    `;
    return;
  }

  renderItemPage(data);
});
