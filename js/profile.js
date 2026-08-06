// Profile page logic

function switchPanel(name) {
  document.querySelectorAll('.profile-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.profile-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`panel-${name}`)?.classList.add('active');
  document.querySelector(`[data-panel="${name}"]`)?.classList.add('active');
}

function statusBadge(status) {
  const map = {
    pending: ['Pending', 'status-pending'],
    in_progress: ['In Progress', 'status-in-progress'],
    completed: ['Completed', 'status-completed'],
    failed: ['Failed', 'status-failed']
  };
  const [label, cls] = map[status] || ['Unknown', 'status-pending'];
  return `<span class="status-badge ${cls}">${label}</span>`;
}

function paymentBadge(status) {
  const map = {
    pending: ['Pending', 'status-pending'],
    waiting: ['Waiting', 'status-pending'],
    confirming: ['Confirming', 'status-in-progress'],
    confirmed: ['Paid', 'status-completed'],
    finished: ['Paid', 'status-completed'],
    failed: ['Failed', 'status-failed']
  };
  const [label, cls] = map[status] || ['Unknown', 'status-pending'];
  return `<span class="status-badge ${cls}">${label}</span>`;
}

async function loadOrders(userId) {
  const listEl = document.getElementById('orders-list');
  const noEl = document.getElementById('no-orders');

  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    if (listEl) listEl.innerHTML = '';
    if (noEl) { noEl.style.display = 'block'; noEl.textContent = 'Connect Supabase to view orders.'; }
    return;
  }

  const { data, error } = await db.from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data || !data.length) {
    if (listEl) listEl.innerHTML = '';
    if (noEl) noEl.style.display = 'block';
    return;
  }

  if (noEl) noEl.style.display = 'none';

  if (listEl) listEl.innerHTML = data.map(order => {
    const items = JSON.parse(order.items_json || '[]');
    const itemNames = items.map(i => i.name).join(', ');
    const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `
      <div class="order-row">
        <div style="flex:1;min-width:0;">
          <div class="order-id">#${order.id.slice(0, 8).toUpperCase()}</div>
          <div class="order-items" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:320px;">${itemNames || 'No items'}</div>
          <div style="display:flex;gap:8px;margin-top:4px;flex-wrap:wrap;">
            ${paymentBadge(order.payment_status)}
            ${statusBadge(order.delivery_status)}
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div class="order-price">$${parseFloat(order.total_usd).toFixed(2)}</div>
          <div class="order-date">${date}</div>
          ${order.payment_status === 'confirmed' || order.payment_status === 'finished'
            ? `<a href="/chat.html?order=${order.id}" class="btn btn-outline btn-sm" style="margin-top:8px;">Open Chat</a>`
            : ''
          }
        </div>
      </div>
    `;
  }).join('');
}

async function loadFavorites() {
  const grid = document.getElementById('favorites-grid');
  const noEl = document.getElementById('no-favorites');
  const favIds = JSON.parse(localStorage.getItem('aotr_favs') || '[]');

  if (!favIds.length) {
    if (noEl) noEl.style.display = 'block';
    if (grid) grid.innerHTML = '';
    return;
  }

  if (noEl) noEl.style.display = 'none';

  const cards = await Promise.all(favIds.map(async id => {
    const { data } = await fetchItemById(id);
    if (!data) return '';
    return `
      <div class="item-card" onclick="window.location.href='item.html?id=${data.id}'">
        <div class="item-img-wrap">
          ${data.image_url
            ? `<img class="item-img" src="${data.image_url}" alt="${data.name}" loading="lazy">`
            : `<div class="item-img-placeholder"><span>${data.category}</span></div>`
          }
          ${renderGameBadge(item.game)}
        </div>
        <div class="item-body">
          <span class="item-cat">${data.category}</span>
          <span class="item-name">${data.name}</span>
          <div class="item-price-row">
            <span class="item-price">$${data.price_usd.toFixed(2)}</span>
          </div>
          <button class="item-add-btn" onclick="event.stopPropagation();Cart.add(${JSON.stringify(data).replace(/"/g, '&quot;')})">Add to Cart</button>
        </div>
      </div>
    `;
  }));

  if (grid) grid.innerHTML = cards.join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  // Wait for auth to init
  await new Promise(resolve => setTimeout(resolve, 300));

  const authRequired = document.getElementById('auth-required');
  const profileContent = document.getElementById('profile-content');

  if (!Auth.currentUser) {
    if (authRequired) authRequired.style.display = 'block';
    if (profileContent) profileContent.style.display = 'none';
    // Recheck when auth changes
    db.auth.onAuthStateChange((_e, session) => {
      if (session?.user) window.location.reload();
    });
    return;
  }

  if (authRequired) authRequired.style.display = 'none';
  if (profileContent) profileContent.style.display = 'block';

  // Pre-fill settings
  const emailEl = document.getElementById('settings-email');
  const usernameEl = document.getElementById('settings-username');
  if (emailEl) emailEl.value = Auth.currentUser.email || '';
  if (usernameEl) usernameEl.value = Auth.currentUser.user_metadata?.username || '';

  // Tab from URL param
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  if (tab) switchPanel(tab);

  loadOrders(Auth.currentUser.id);
  loadFavorites();

  // Nav clicks
  document.querySelectorAll('.profile-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const panel = item.dataset.panel;
      if (panel === 'logout') { Auth.signOut(); return; }
      switchPanel(panel);
      if (panel === 'favorites') loadFavorites();
    });
  });

  // Settings save
  document.getElementById('settings-save-btn')?.addEventListener('click', async () => {
    const username = document.getElementById('settings-username')?.value.trim();
    const password = document.getElementById('settings-password')?.value;
    const confirm = document.getElementById('settings-password-confirm')?.value;
    const errEl = document.getElementById('settings-error');

    if (password && password !== confirm) {
      if (errEl) { errEl.textContent = 'Passwords do not match.'; errEl.classList.add('show'); }
      return;
    }

    const updates = {};
    if (username) updates.data = { username };
    if (password) updates.password = password;

    if (!Object.keys(updates).length) return;

    const { error } = await db.auth.updateUser(updates);
    if (error) {
      if (errEl) { errEl.textContent = error.message; errEl.classList.add('show'); }
    } else {
      showToast('Settings saved.', 'success');
      if (errEl) errEl.classList.remove('show');
    }
  });
});
