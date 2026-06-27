// Admin panel logic — requires admin role in Supabase user metadata

function switchAdminPanel(name) {
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`panel-${name}`)?.classList.add('active');
  document.querySelector(`[data-panel="${name}"]`)?.classList.add('active');
}

function statusSelect(orderId, field, current, options) {
  return `<select class="form-input" style="padding:4px 8px;font-size:.78rem;" onchange="updateOrderStatus('${orderId}','${field}',this.value)">
    ${options.map(o => `<option value="${o.val}" ${current === o.val ? 'selected' : ''}>${o.label}</option>`).join('')}
  </select>`;
}

async function updateOrderStatus(orderId, field, value) {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') { showToast('Connect Supabase.', 'error'); return; }
  const { error } = await db.from('orders').update({ [field]: value }).eq('id', orderId);
  if (error) showToast('Update failed: ' + error.message, 'error');
  else showToast('Order updated.', 'success');
}

async function loadAdminOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-faint);">Connect Supabase to view orders.</td></tr>';
    return;
  }

  const { data, error } = await db.from('orders').select('*').order('created_at', { ascending: false });

  if (error || !data) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-faint);">Failed to load orders.</td></tr>';
    return;
  }

  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-faint);">No orders yet.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(order => {
    const items = JSON.parse(order.items_json || '[]');
    const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const deliveryOpts = [
      { val: 'pending', label: 'Pending' },
      { val: 'in_progress', label: 'In Progress' },
      { val: 'completed', label: 'Completed' },
      { val: 'failed', label: 'Failed' }
    ];
    const paymentOpts = [
      { val: 'pending', label: 'Pending' },
      { val: 'confirmed', label: 'Confirmed' },
      { val: 'failed', label: 'Failed' }
    ];
    return `
      <tr>
        <td><span style="font-family:monospace;font-size:.75rem;">${order.id.slice(0, 8)}</span></td>
        <td>${order.roblox_username || '—'}</td>
        <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${items.map(i => i.name).join(', ')}</td>
        <td style="color:var(--gold);font-weight:600;">$${parseFloat(order.total_usd).toFixed(2)}</td>
        <td>${statusSelect(order.id, 'payment_status', order.payment_status, paymentOpts)}</td>
        <td>${statusSelect(order.id, 'delivery_status', order.delivery_status, deliveryOpts)}</td>
        <td>${date}</td>
        <td>
          <a href="/chat.html?order=${order.id}" class="btn btn-ghost btn-sm" style="font-size:.75rem;padding:4px 8px;">Chat</a>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadAdminItems() {
  const tbody = document.getElementById('items-tbody');
  if (!tbody) return;

  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    // Show placeholder items
    tbody.innerHTML = PLACEHOLDER_ITEMS.map(item => `
      <tr>
        <td style="font-weight:500;color:var(--text);">${item.name}</td>
        <td><span class="badge-cat item-badge" style="position:static;display:inline-block;">${item.category}</span></td>
        <td style="color:var(--gold);">$${item.price_usd.toFixed(2)}</td>
        <td style="font-size:.78rem;">${[item.required_gems > 0 ? item.required_gems + ' gems' : null, item.required_gold > 0 ? item.required_gold + ' gold' : null].filter(Boolean).join(' / ') || '—'}</td>
        <td><span class="status-badge ${item.in_stock ? 'status-completed' : 'status-failed'}">${item.in_stock ? 'In Stock' : 'OOS'}</span></td>
        <td>${item.is_featured ? '<span style="color:var(--gold);">Yes</span>' : 'No'}</td>
        <td><span style="color:var(--text-faint);font-size:.75rem;">Demo mode</span></td>
      </tr>
    `).join('');
    return;
  }

  const { data, error } = await db.from('items').select('*').order('created_at', { ascending: false });
  if (error || !data) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-faint);">Failed to load.</td></tr>'; return; }

  tbody.innerHTML = data.map(item => `
    <tr>
      <td style="font-weight:500;color:var(--text);">${item.name}</td>
      <td>${item.category}</td>
      <td style="color:var(--gold);">$${item.price_usd.toFixed(2)}</td>
      <td style="font-size:.78rem;">${[item.required_gems > 0 ? item.required_gems + ' gems' : null, item.required_gold > 0 ? item.required_gold + ' gold' : null].filter(Boolean).join(' / ') || '—'}</td>
      <td>
        <select class="form-input" style="padding:4px 8px;font-size:.78rem;" onchange="updateItem('${item.id}','in_stock',this.value==='true')">
          <option value="true" ${item.in_stock ? 'selected' : ''}>In Stock</option>
          <option value="false" ${!item.in_stock ? 'selected' : ''}>Out of Stock</option>
        </select>
      </td>
      <td>
        <select class="form-input" style="padding:4px 8px;font-size:.78rem;" onchange="updateItem('${item.id}','is_featured',this.value==='true')">
          <option value="true" ${item.is_featured ? 'selected' : ''}>Yes</option>
          <option value="false" ${!item.is_featured ? 'selected' : ''}>No</option>
        </select>
      </td>
      <td>
        <button class="btn btn-danger btn-sm" style="font-size:.75rem;padding:4px 8px;" onclick="deleteItem('${item.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

async function updateItem(id, field, value) {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') return;
  const { error } = await db.from('items').update({ [field]: value }).eq('id', id);
  if (error) showToast('Update failed.', 'error');
  else showToast('Item updated.', 'success');
}

async function deleteItem(id) {
  if (!confirm('Delete this item? This cannot be undone.')) return;
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') { showToast('Connect Supabase.', 'error'); return; }
  const { error } = await db.from('items').delete().eq('id', id);
  if (error) showToast('Delete failed: ' + error.message, 'error');
  else { showToast('Item deleted.', 'success'); loadAdminItems(); }
}

async function loadAdminAccounts() {
  const tbody = document.getElementById('accounts-tbody');
  if (!tbody) return;
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    tbody.innerHTML = PLACEHOLDER_ACCOUNTS.map(a => `
      <tr>
        <td>Prestige ${a.prestige_level}</td>
        <td style="color:var(--gold);">$${a.price_usd.toFixed(2)}</td>
        <td style="font-size:.78rem;color:var(--text-muted);">${[a.has_legendary_family&&'Legendary Fam',a.has_thunder_spears&&'Thunder Spears',a.has_serums&&'Serums'].filter(Boolean).join(', ')||'—'}</td>
        <td><span class="status-badge ${a.in_stock ? 'status-completed' : 'status-failed'}">${a.in_stock ? 'Available' : 'Sold'}</span></td>
        <td><span style="color:var(--text-faint);font-size:.75rem;">Demo mode</span></td>
      </tr>
    `).join('');
    return;
  }
  const { data } = await db.from('accounts_for_sale').select('*').order('created_at', { ascending: false });
  if (!data?.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-faint);">No accounts.</td></tr>'; return; }
  tbody.innerHTML = data.map(a => `
    <tr>
      <td>Prestige ${a.prestige_level}</td>
      <td style="color:var(--gold);">$${a.price_usd.toFixed(2)}</td>
      <td style="font-size:.78rem;">
        ${[a.has_legendary_family&&'Legendary Fam',a.has_thunder_spears&&'Thunder Spears',a.has_serums&&'Serums'].filter(Boolean).join(', ')||'—'}
      </td>
      <td>
        <select class="form-input" style="padding:4px 8px;font-size:.78rem;" onchange="updateAccount('${a.id}','in_stock',this.value==='true')">
          <option value="true" ${a.in_stock ? 'selected' : ''}>Available</option>
          <option value="false" ${!a.in_stock ? 'selected' : ''}>Sold</option>
        </select>
      </td>
      <td><button class="btn btn-danger btn-sm" style="font-size:.75rem;padding:4px 8px;" onclick="deleteAccount('${a.id}')">Delete</button></td>
    </tr>
  `).join('');
}

async function updateAccount(id, field, value) {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') return;
  const { error } = await db.from('accounts_for_sale').update({ [field]: value }).eq('id', id);
  if (error) showToast('Update failed.', 'error');
  else showToast('Account updated.', 'success');
}

async function deleteAccount(id) {
  if (!confirm('Delete this account?')) return;
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') return;
  const { error } = await db.from('accounts_for_sale').delete().eq('id', id);
  if (error) showToast('Delete failed.', 'error');
  else { showToast('Account deleted.', 'success'); loadAdminAccounts(); }
}

document.addEventListener('DOMContentLoaded', async () => {
  await new Promise(resolve => setTimeout(resolve, 400));

  const gateEl = document.getElementById('admin-auth-gate');
  const forbidEl = document.getElementById('admin-forbidden');
  const contentEl = document.getElementById('admin-content');

  if (!Auth.currentUser) {
    if (gateEl) gateEl.style.display = 'block';
    db.auth.onAuthStateChange((_, session) => { if (session?.user) window.location.reload(); });
    return;
  }

  const isAdmin = Auth.currentUser.user_metadata?.role === 'admin'
    || Auth.currentUser.app_metadata?.role === 'admin';

  if (!isAdmin) {
    if (forbidEl) forbidEl.style.display = 'block';
    return;
  }

  if (contentEl) contentEl.style.display = 'block';

  loadAdminOrders();

  document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const panel = item.dataset.panel;
      switchAdminPanel(panel);
      if (panel === 'orders') loadAdminOrders();
      if (panel === 'items') loadAdminItems();
      if (panel === 'accounts') loadAdminAccounts();
    });
  });

  // Add item form
  document.getElementById('add-item-btn')?.addEventListener('click', async () => {
    const errEl = document.getElementById('add-item-error');
    const name = document.getElementById('new-name')?.value.trim();
    const cat = document.getElementById('new-cat')?.value;
    const desc = document.getElementById('new-desc')?.value.trim();
    const price = parseFloat(document.getElementById('new-price')?.value) || 0;
    const prestige = parseInt(document.getElementById('new-prestige')?.value) || 0;
    const gems = parseInt(document.getElementById('new-gems')?.value) || 0;
    const gold = parseInt(document.getElementById('new-gold')?.value) || 0;
    const image = document.getElementById('new-image')?.value.trim() || null;
    const featured = document.getElementById('new-featured')?.checked || false;

    if (!name || !cat) { errEl.textContent = 'Name and category are required.'; errEl.classList.add('show'); return; }
    if (price <= 0) { errEl.textContent = 'Price must be greater than 0.'; errEl.classList.add('show'); return; }
    errEl.classList.remove('show');

    if (SUPABASE_URL === 'YOUR_SUPABASE_URL') { showToast('Connect Supabase to add items.', 'error'); return; }

    const { error } = await db.from('items').insert({
      name, category: cat, description: desc, price_usd: price,
      required_prestige: prestige, required_gems: gems, required_gold: gold,
      image_url: image, in_stock: true, is_featured: featured
    });

    if (error) { errEl.textContent = error.message; errEl.classList.add('show'); }
    else {
      showToast(`"${name}" added successfully.`, 'success');
      document.getElementById('new-name').value = '';
      document.getElementById('new-desc').value = '';
      document.getElementById('new-price').value = '';
    }
  });
});
