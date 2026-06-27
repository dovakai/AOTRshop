// Order chat — Supabase Realtime

let chatSubscription = null;
let currentOrderId = null;

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

function renderMessage(msg) {
  const role = msg.sender_role === 'seller' ? 'seller' : 'buyer';
  const time = new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `
    <div class="chat-msg ${role}">
      <div class="chat-bubble">${escapeHtml(msg.message)}</div>
      <span class="chat-meta">${role === 'seller' ? 'Seller' : 'You'} &middot; ${time}</span>
    </div>
  `;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function scrollToBottom() {
  const el = document.getElementById('chat-messages');
  if (el) el.scrollTop = el.scrollHeight;
}

async function loadOrder(orderId) {
  const summaryEl = document.getElementById('order-summary');
  const badgeEl = document.getElementById('order-status-badge');

  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    if (summaryEl) summaryEl.innerHTML = `
      <p style="font-size:.85rem;color:var(--text-muted);">Demo mode — connect Supabase to view orders.</p>`;
    return;
  }

  const { data: order, error } = await db.from('orders').select('*').eq('id', orderId).single();
  if (error || !order) {
    if (summaryEl) summaryEl.innerHTML = '<p style="color:var(--text-faint);font-size:.85rem;">Order not found.</p>';
    return;
  }

  const items = JSON.parse(order.items_json || '[]');
  const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (summaryEl) summaryEl.innerHTML = `
    <p style="font-size:.82rem;color:var(--text-muted);margin-bottom:4px;">Order #${order.id.slice(0, 8).toUpperCase()}</p>
    <p style="font-size:.82rem;color:var(--text-faint);margin-bottom:10px;">${date}</p>
    <p style="font-size:.8rem;font-weight:600;margin-bottom:6px;">Roblox: ${escapeHtml(order.roblox_username)}</p>
    <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:10px;">
      ${items.map(i => `<div style="padding:3px 0;border-bottom:1px solid var(--border);">${escapeHtml(i.name)}</div>`).join('')}
    </div>
    <p style="font-size:.9rem;font-weight:700;color:var(--gold);">Total: $${parseFloat(order.total_usd).toFixed(2)}</p>
    <div style="margin-top:10px;">${statusBadge(order.delivery_status)}</div>
  `;

  if (badgeEl) badgeEl.innerHTML = statusBadge(order.delivery_status);
}

async function loadMessages(orderId) {
  const el = document.getElementById('chat-messages');
  if (!el) return;

  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    el.innerHTML = `
      <div style="padding:20px;text-align:center;color:var(--text-faint);font-size:.85rem;">
        Chat requires Supabase. Connect your credentials in js/config.js.
      </div>`;
    return;
  }

  const { data, error } = await db.from('order_messages')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) { el.innerHTML = '<div style="color:var(--text-faint);padding:20px;font-size:.85rem;">Failed to load messages.</div>'; return; }

  el.innerHTML = data.length
    ? data.map(renderMessage).join('')
    : '<div style="padding:20px;text-align:center;color:var(--text-faint);font-size:.85rem;">No messages yet. The seller will contact you shortly after payment confirmation.</div>';

  scrollToBottom();
}

function subscribeToMessages(orderId) {
  if (chatSubscription) chatSubscription.unsubscribe();
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') return;

  chatSubscription = db.channel(`order-chat-${orderId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'order_messages',
      filter: `order_id=eq.${orderId}`
    }, payload => {
      const el = document.getElementById('chat-messages');
      const placeholder = el?.querySelector('[style*="No messages"]');
      if (placeholder) placeholder.remove();
      el?.insertAdjacentHTML('beforeend', renderMessage(payload.new));
      scrollToBottom();
    })
    .subscribe();
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const message = input?.value.trim();
  if (!message || !currentOrderId || !Auth.currentUser) return;

  input.value = '';

  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    showToast('Connect Supabase to send messages.', 'error');
    return;
  }

  const { error } = await db.from('order_messages').insert({
    order_id: currentOrderId,
    sender_role: 'buyer',
    message
  });

  if (error) showToast('Failed to send message.', 'error');
}

document.addEventListener('DOMContentLoaded', async () => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const params = new URLSearchParams(window.location.search);
  currentOrderId = params.get('order');

  const authRequired = document.getElementById('chat-auth-required');
  const chatContainer = document.getElementById('chat-container');

  if (!Auth.currentUser) {
    if (authRequired) authRequired.style.display = 'block';
    if (chatContainer) chatContainer.style.display = 'none';
    return;
  }

  if (!currentOrderId) {
    document.querySelector('.container').innerHTML = '<p style="color:var(--text-faint);padding:60px 0;text-align:center;">No order specified.</p>';
    return;
  }

  if (authRequired) authRequired.style.display = 'none';
  if (chatContainer) chatContainer.style.display = 'grid';

  await loadOrder(currentOrderId);
  await loadMessages(currentOrderId);
  subscribeToMessages(currentOrderId);

  // Send on button or Enter
  document.getElementById('send-msg-btn')?.addEventListener('click', sendMessage);
  document.getElementById('chat-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
});
