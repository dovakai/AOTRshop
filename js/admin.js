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
        <td style="font-size:.78rem;color:var(--text-muted);">${item.game || 'AOTR'}</td>
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
  if (error || !data) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-faint);">Failed to load.</td></tr>'; return; }

  tbody.innerHTML = data.map(item => `
    <tr>
      <td style="font-weight:500;color:var(--text);">${item.name}</td>
      <td style="font-size:.78rem;color:var(--text-muted);">${item.game || 'AOTR'}</td>
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

async function loadAdminTrades() {
  const tbody = document.getElementById('trades-tbody');
  if (!tbody) return;

  const { data, error } = await db.from('trades').select('*').order('created_at', { ascending: false });

  if (error || !data) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-faint);">Failed to load.</td></tr>';
    return;
  }
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-faint);">No trades yet. Add the first one!</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(t => {
    const date = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `
      <tr>
        <td>
          ${t.image_url
            ? `<img src="${t.image_url}" style="width:70px;height:48px;object-fit:cover;border-radius:6px;border:1px solid var(--border);cursor:pointer;" onclick="window.open('${t.image_url}','_blank')" alt="">`
            : '<span style="color:var(--text-faint);font-size:.75rem;">—</span>'
          }
        </td>
        <td style="font-weight:600;">${t.game || '—'}</td>
        <td style="color:var(--text-muted);">${t.item}</td>
        <td style="color:var(--gold);font-weight:600;">$${parseFloat(t.price).toFixed(2)}</td>
        <td style="font-size:.78rem;color:var(--text-faint);">${date}</td>
        <td>
          <button class="btn btn-danger btn-sm" style="font-size:.75rem;padding:4px 8px;" onclick="deleteTrade('${t.id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function deleteTrade(id) {
  if (!confirm('Delete this trade proof?')) return;
  const { error } = await db.from('trades').delete().eq('id', id);
  if (error) showToast('Delete failed: ' + error.message, 'error');
  else { showToast('Trade deleted.', 'success'); loadAdminTrades(); }
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
      if (panel === 'trades') loadAdminTrades();
    });
  });

  // Image preview for trade form
  document.getElementById('trade-image')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = document.getElementById('trade-img-preview');
    const thumb = document.getElementById('trade-img-thumb');
    const reader = new FileReader();
    reader.onload = (ev) => { thumb.src = ev.target.result; preview.style.display = 'block'; };
    reader.readAsDataURL(file);
  });

  // Add trade form
  document.getElementById('add-trade-btn')?.addEventListener('click', async () => {
    const errEl = document.getElementById('trade-error');
    const game = document.getElementById('trade-username')?.value.trim() || 'AOTR';
    const item = document.getElementById('trade-item')?.value.trim();
    const price = parseFloat(document.getElementById('trade-price')?.value) || 0;
    const file = document.getElementById('trade-image')?.files[0];

    if (!item) { errEl.textContent = 'Item name is required.'; errEl.classList.add('show'); return; }
    if (price <= 0) { errEl.textContent = 'Price must be greater than 0.'; errEl.classList.add('show'); return; }
    errEl.classList.remove('show');

    const btn = document.getElementById('add-trade-btn');
    btn.disabled = true;
    btn.textContent = 'Uploading...';

    let imageUrl = null;
    if (file) {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await db.storage.from('proofs').upload(path, file, { upsert: false });
      if (uploadErr) {
        errEl.textContent = 'Image upload failed: ' + uploadErr.message;
        errEl.classList.add('show');
        btn.disabled = false;
        btn.textContent = 'Add Proof';
        return;
      }
      const { data: urlData } = db.storage.from('proofs').getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    const { error } = await db.from('trades').insert({ game, item, price, image_url: imageUrl });

    btn.disabled = false;
    btn.textContent = 'Add Proof';

    if (error) { errEl.textContent = error.message; errEl.classList.add('show'); return; }

    showToast(`Proof for "${item}" added!`, 'success');
    document.getElementById('trade-username').value = '';
    document.getElementById('trade-item').value = '';
    document.getElementById('trade-price').value = '';
    document.getElementById('trade-image').value = '';
    document.getElementById('trade-img-preview').style.display = 'none';
    loadAdminTrades();
  });

  // Add item form
  document.getElementById('add-item-btn')?.addEventListener('click', async () => {
    const errEl = document.getElementById('add-item-error');
    const name = document.getElementById('new-name')?.value.trim();
    const game = document.getElementById('new-game')?.value || 'AOTR';
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
      name, game, category: cat, description: desc, price_usd: price,
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
