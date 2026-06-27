// Accounts page logic

let accFilters = {};

function renderAccountCard(acc) {
  const tags = [
    { label: 'Legendary Family', val: acc.has_legendary_family },
    { label: 'Thunder Spears', val: acc.has_thunder_spears },
    { label: 'Serums', val: acc.has_serums },
    { label: 'No Shadow Ban', val: !acc.has_shadow_ban }
  ].filter(t => t.val);

  return `
    <div class="account-card">
      <div class="account-card-top">
        <div class="account-prestige">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.5a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5z"/>
          </svg>
          Prestige ${acc.prestige_level}
        </div>
        ${tags.length ? `<div class="account-card-tags-grid">${tags.map(t => `<span class="account-tag yes">${t.label}</span>`).join('')}</div>` : ''}
      </div>
      <div class="account-card-body">
        <p class="account-desc">${acc.description}</p>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto;">
          <span class="account-price">$${acc.price_usd.toFixed(2)}</span>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();buyAccount('${acc.id}')">Buy</button>
        </div>
      </div>
    </div>
  `;
}

async function loadAccounts() {
  const grid = document.getElementById('accounts-grid');
  const noEl = document.getElementById('no-accounts');
  const countEl = document.getElementById('acc-count');

  if (grid) grid.innerHTML = '<div class="skeleton" style="height:280px;border-radius:10px;"></div>'.repeat(4);

  const { data, error } = await fetchAccounts(accFilters);

  if (error || !data) {
    if (grid) grid.innerHTML = '<p style="color:var(--text-faint);">Failed to load accounts.</p>';
    return;
  }

  if (!data.length) {
    if (grid) grid.innerHTML = '';
    if (noEl) noEl.style.display = 'block';
    if (countEl) countEl.textContent = '0 accounts';
    return;
  }

  if (noEl) noEl.style.display = 'none';
  if (countEl) countEl.textContent = `${data.length} account${data.length !== 1 ? 's' : ''}`;
  if (grid) grid.innerHTML = data.map(renderAccountCard).join('');
  animateCards(grid);
}

function buyAccount(id) {
  if (!Auth.currentUser) { AuthModal.open(); return; }
  // For accounts, redirect to a dedicated checkout (we use cart as single-item purchase)
  // Store account id in sessionStorage and go to a checkout page
  sessionStorage.setItem('account_purchase', id);
  showToast('Contact us via Discord or chat to purchase this account.', 'info');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[name=prestige]').forEach(el => {
    el.addEventListener('change', () => {
      accFilters.prestige = el.value;
      loadAccounts();
    });
  });

  document.getElementById('f-legend')?.addEventListener('change', e => {
    accFilters.has_legendary_family = e.target.checked ? 'yes' : '';
    loadAccounts();
  });
  document.getElementById('f-thunder')?.addEventListener('change', e => {
    accFilters.has_thunder_spears = e.target.checked ? 'yes' : '';
    loadAccounts();
  });
  document.getElementById('f-serums')?.addEventListener('change', e => {
    accFilters.has_serums = e.target.checked ? 'yes' : '';
    loadAccounts();
  });

  document.querySelectorAll('input[name=acc-sort]').forEach(el => {
    el.addEventListener('change', () => {
      accFilters.sort = el.value;
      loadAccounts();
    });
  });

  document.getElementById('reset-acc-filters')?.addEventListener('click', () => {
    accFilters = {};
    document.querySelector('input[name=prestige][value=""]').checked = true;
    document.querySelector('input[name=acc-sort][value=""]').checked = true;
    document.getElementById('f-legend').checked = false;
    document.getElementById('f-thunder').checked = false;
    document.getElementById('f-serums').checked = false;
    document.getElementById('f-no-shadow').checked = false;
    loadAccounts();
  });

  loadAccounts();
});
