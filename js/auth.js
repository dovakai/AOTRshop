// Auth — Supabase email/password login + register modal

const Auth = {
  currentUser: null,

  async init() {
    const { data: { session } } = await db.auth.getSession();
    Auth.currentUser = session?.user || null;
    Auth.updateNav();

    db.auth.onAuthStateChange((_event, session) => {
      Auth.currentUser = session?.user || null;
      Auth.updateNav();
    });
  },

  updateNav() {
    const loginBtn = document.getElementById('btn-login');
    const userChip = document.getElementById('nav-user');
    const userInitial = document.getElementById('nav-user-initial');
    const userName = document.getElementById('nav-user-name');

    if (Auth.currentUser) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (userChip) {
        userChip.style.display = 'flex';
        const email = Auth.currentUser.email || '';
        const name = Auth.currentUser.user_metadata?.username || email.split('@')[0];
        if (userInitial) userInitial.textContent = name[0].toUpperCase();
        if (userName) userName.textContent = name;
      }
    } else {
      if (loginBtn) loginBtn.style.display = '';
      if (userChip) userChip.style.display = 'none';
    }
  },

  async signIn(email, password) {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  async signUp(email, password, username) {
    const { data, error } = await db.auth.signUp({
      email, password,
      options: { data: { username } }
    });
    return { data, error };
  },

  async signOut() {
    await db.auth.signOut();
    window.location.href = '/';
  },

  requireAuth(redirect = '/profile.html') {
    if (!Auth.currentUser) {
      AuthModal.open();
      return false;
    }
    return true;
  }
};

const AuthModal = {
  el: null,
  activeTab: 'login',

  open(tab = 'login') {
    AuthModal.el = document.getElementById('auth-modal');
    if (!AuthModal.el) return;
    AuthModal.el.classList.add('open');
    AuthModal.switchTab(tab);
    document.body.style.overflow = 'hidden';
  },

  close() {
    if (!AuthModal.el) return;
    AuthModal.el.classList.remove('open');
    document.body.style.overflow = '';
    AuthModal.clearErrors();
  },

  switchTab(tab) {
    AuthModal.activeTab = tab;
    document.querySelectorAll('.modal-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    document.querySelectorAll('.modal-form').forEach(f => {
      f.style.display = f.dataset.form === tab ? 'block' : 'none';
    });
  },

  clearErrors() {
    document.querySelectorAll('.form-error').forEach(e => e.classList.remove('show'));
  },

  showError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.classList.add('show'); }
  },

  async handleLogin(e) {
    e.preventDefault();
    AuthModal.clearErrors();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      AuthModal.showError('login-error', 'Please fill in all fields.');
      return;
    }

    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Signing in...';

    const { error } = await Auth.signIn(email, password);

    btn.disabled = false;
    btn.textContent = 'Sign In';

    if (error) {
      AuthModal.showError('login-error', error.message || 'Invalid email or password.');
    } else {
      AuthModal.close();
      showToast('Signed in successfully.', 'success');
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    AuthModal.clearErrors();
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (!username || !email || !password) {
      AuthModal.showError('reg-error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      AuthModal.showError('reg-error', 'Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      AuthModal.showError('reg-error', 'Password must be at least 8 characters.');
      return;
    }

    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Creating account...';

    const { error } = await Auth.signUp(email, password, username);

    btn.disabled = false;
    btn.textContent = 'Create Account';

    if (error) {
      AuthModal.showError('reg-error', error.message || 'Registration failed.');
    } else {
      AuthModal.close();
      showToast('Account created. Check your email to confirm.', 'success');
    }
  }
};

// ── Toast utility ──────────────────────────────────────────────────────────

function showToast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`,
    error: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>`,
    info: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4M12 8h.01"/></svg>`
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${icons[type] || ''}<span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity .3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── DOM init ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  Auth.init();

  // Login button
  document.getElementById('btn-login')?.addEventListener('click', () => AuthModal.open('login'));

  // Modal close
  document.getElementById('auth-modal-close')?.addEventListener('click', AuthModal.close);
  document.querySelector('#auth-modal .modal-overlay')?.addEventListener('click', AuthModal.close);

  // Tabs
  document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => AuthModal.switchTab(tab.dataset.tab));
  });

  // Forms
  document.getElementById('login-form')?.addEventListener('submit', AuthModal.handleLogin);
  document.getElementById('register-form')?.addEventListener('submit', AuthModal.handleRegister);

  // Nav user chip → profile
  document.getElementById('nav-user')?.addEventListener('click', () => {
    window.location.href = '/profile.html';
  });

  // Search overlay
  const searchBtn = document.getElementById('btn-search');
  const searchOverlay = document.getElementById('search-overlay');
  const searchBg = document.querySelector('.search-overlay-bg');
  const searchInput = document.getElementById('search-input');

  searchBtn?.addEventListener('click', () => {
    searchOverlay?.classList.add('open');
    searchInput?.focus();
    document.body.style.overflow = 'hidden';
  });

  searchBg?.addEventListener('click', () => {
    searchOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      AuthModal.close();
      searchOverlay?.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Search input — live results
  let searchDebounce;
  searchInput?.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(async () => {
      const q = searchInput.value.trim();
      const resultsEl = document.getElementById('search-results');
      if (!resultsEl) return;

      if (!q) { resultsEl.innerHTML = ''; return; }

      const { data } = await fetchItems({ search: q });
      if (!data || !data.length) {
        resultsEl.innerHTML = '<div style="padding:16px;color:var(--text-faint);font-size:.875rem;">No items found.</div>';
        return;
      }

      resultsEl.innerHTML = data.slice(0, 6).map(item => `
        <div class="search-result-item" onclick="window.location.href='item.html?id=${item.id}'">
          <div class="search-result-img">
            ${item.image_url
              ? `<img src="${item.image_url}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;">`
              : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a1a1a,#222);display:flex;align-items:center;justify-content:center;font-size:.55rem;color:var(--text-faint);font-weight:600;letter-spacing:.05em;">AOTR</div>`
            }
          </div>
          <div>
            <div class="search-result-name">${item.name}</div>
            <div class="search-result-cat">${item.category}</div>
          </div>
          <div class="search-result-price">$${item.price_usd.toFixed(2)}</div>
        </div>
      `).join('');
    }, 280);
  });
});
