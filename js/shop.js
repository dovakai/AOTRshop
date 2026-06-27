// Shop page logic

let shopFilters = { category: '', sort: '', search: '' };

function renderItemCard(item) {
  const { rating, count } = getItemRating(item);
  const reqs = [];
  if (item.required_prestige > 0) reqs.push(`P${item.required_prestige}`);
  if (item.required_gems > 0) reqs.push(`${item.required_gems} Gems`);
  if (item.required_gold > 0) reqs.push(`${item.required_gold} Gold`);

  return `
    <div class="item-card" onclick="window.location.href='item.html?id=${item.id}'">
      <div class="item-img-wrap">
        ${item.image_url
          ? `<img class="item-img" src="${item.image_url}" alt="${item.name}" loading="lazy">`
          : `<div class="item-img-placeholder">
              <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24" style="opacity:.15">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
              <span>${item.category}</span>
            </div>`
        }
        ${item.is_featured ? '<span class="item-badge badge-hot">HOT</span>' : ''}
        ${!item.in_stock ? '<span class="item-badge badge-oos">Out of Stock</span>' : ''}
        <button class="item-fav-btn" onclick="event.stopPropagation();toggleFav('${item.id}')" title="Add to favorites" id="fav-${item.id}">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <div class="item-body">
        <span class="item-cat">${item.category}</span>
        <span class="item-name">${item.name}</span>
        ${rating ? `<div class="item-rating">⭐ <span class="item-rating-val">${rating}</span>${count > 0 ? `<span class="item-rating-count"> (${count})</span>` : ''}</div>` : ''}
        <div class="item-price-row">
          <span class="item-price">$${item.price_usd.toFixed(2)}</span>
          ${(item.required_gems > 0 || item.required_gold > 0) ? `<span class="item-fee">Trade tax: ${[item.required_gems > 0 ? item.required_gems + ' gems' : null, item.required_gold > 0 ? item.required_gold + ' gold' : null].filter(Boolean).join(' / ')}</span>` : ''}
        </div>
        ${reqs.length ? `<div class="item-reqs">${reqs.map(r => `<span class="req-tag">${r}</span>`).join('')}</div>` : ''}
        <button class="item-add-btn" onclick="event.stopPropagation();addToCart('${item.id}')">
          ${item.in_stock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  `;
}

async function loadItems() {
  const grid = document.getElementById('items-grid');
  const noItems = document.getElementById('no-items');
  const countEl = document.getElementById('shop-count');

  if (grid) grid.innerHTML = '<div class="skeleton" style="height:340px;border-radius:10px;"></div>'.repeat(8);

  const { data, error } = await fetchItems(shopFilters);

  if (error || !data) {
    if (grid) grid.innerHTML = '<p style="color:var(--text-faint);">Failed to load items.</p>';
    return;
  }

  if (!data.length) {
    if (grid) grid.innerHTML = '';
    if (noItems) noItems.style.display = 'block';
    if (countEl) countEl.textContent = '0 items';
    return;
  }

  if (noItems) noItems.style.display = 'none';
  if (countEl) countEl.textContent = `${data.length} item${data.length !== 1 ? 's' : ''}`;
  if (grid) grid.innerHTML = data.map(renderItemCard).join('');
  animateCards(grid);

  // Mark favorited items
  const favs = JSON.parse(localStorage.getItem('aotr_favs') || '[]');
  favs.forEach(id => {
    document.getElementById(`fav-${id}`)?.classList.add('active');
  });
}

function updateActiveFilters() {
  const el = document.getElementById('active-filters');
  if (!el) return;
  const chips = [];
  if (shopFilters.category) {
    chips.push(`<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:var(--gold-dim);border:1px solid rgba(201,168,76,.2);border-radius:99px;font-size:.75rem;color:var(--gold);">
      ${shopFilters.category}
      <button onclick="clearFilter('category')" style="background:none;border:none;color:inherit;cursor:pointer;line-height:1;font-size:12px;">&times;</button>
    </span>`);
  }
  if (shopFilters.sort) {
    const sortLabel = shopFilters.sort === 'price_asc' ? 'Price: Low to High' : 'Price: High to Low';
    chips.push(`<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:var(--gold-dim);border:1px solid rgba(201,168,76,.2);border-radius:99px;font-size:.75rem;color:var(--gold);">
      ${sortLabel}
      <button onclick="clearFilter('sort')" style="background:none;border:none;color:inherit;cursor:pointer;line-height:1;font-size:12px;">&times;</button>
    </span>`);
  }
  el.innerHTML = chips.join('');
}

function clearFilter(key) {
  shopFilters[key] = '';
  // Reset radio
  if (key === 'category') document.querySelector('input[name=cat][value=""]').checked = true;
  if (key === 'sort') document.querySelector('input[name=sort][value=""]').checked = true;
  updateActiveFilters();
  loadItems();
}

async function addToCart(id) {
  const { data: item } = await fetchItemById(id);
  if (item && item.in_stock) Cart.add(item);
  else if (item) showToast(`${item.name} is out of stock.`, 'error');
}

function toggleFav(id) {
  if (!Auth.currentUser) { AuthModal.open(); return; }
  const favs = JSON.parse(localStorage.getItem('aotr_favs') || '[]');
  const btn = document.getElementById(`fav-${id}`);
  const idx = favs.indexOf(String(id));
  if (idx >= 0) {
    favs.splice(idx, 1);
    btn?.classList.remove('active');
    showToast('Removed from favorites.', 'info');
  } else {
    favs.push(String(id));
    btn?.classList.add('active');
    showToast('Added to favorites.', 'success');
  }
  localStorage.setItem('aotr_favs', JSON.stringify(favs));
}

document.addEventListener('DOMContentLoaded', () => {
  // Read URL params
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('category') || '';
  if (catParam) {
    shopFilters.category = catParam;
    const radio = document.querySelector(`input[name=cat][value="${catParam}"]`);
    if (radio) radio.checked = true;
  }

  // Category filter
  document.querySelectorAll('input[name=cat]').forEach(el => {
    el.addEventListener('change', () => {
      shopFilters.category = el.value;
      updateActiveFilters();
      loadItems();
    });
  });

  // Sort filter
  document.querySelectorAll('input[name=sort]').forEach(el => {
    el.addEventListener('change', () => {
      shopFilters.sort = el.value;
      updateActiveFilters();
      loadItems();
    });
  });

  // Search
  let debounce;
  document.getElementById('shop-search')?.addEventListener('input', e => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      shopFilters.search = e.target.value.trim();
      loadItems();
    }, 300);
  });

  // Reset
  document.getElementById('reset-filters')?.addEventListener('click', () => {
    shopFilters = { category: '', sort: '', search: '' };
    document.querySelector('input[name=cat][value=""]').checked = true;
    document.querySelector('input[name=sort][value=""]').checked = true;
    const searchEl = document.getElementById('shop-search');
    if (searchEl) searchEl.value = '';
    updateActiveFilters();
    loadItems();
  });

  updateActiveFilters();
  loadItems();
});
