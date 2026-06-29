// Shared navbar + auth modal — injected synchronously into every page

const NAV_HTML = `
<nav id="navbar">
  <div class="container nav-inner">

    <a href="/index.html" class="nav-logo">
      <img src="/logo.png" alt="AOTRShop" class="nav-logo-img">
    </a>

    <ul class="nav-links">
      <li><a href="/index.html" data-page="home">Home</a></li>
      <li><a href="/shop.html" data-page="shop">Shop</a></li>
      <li><a href="/accounts.html" data-page="accounts">Accounts</a></li>
      <li><a href="/tutorial.html" data-page="tutorial">Tutorial</a></li>
      <li><a href="/faq.html" data-page="faq">FAQ</a></li>
      <li><a href="/proofs.html" data-page="proofs">Proofs</a></li>
      <li><a href="https://discord.gg/M5aAG5TqJ8" target="_blank" class="nav-live">
        <span class="nav-live-dot"></span>LIVE
      </a></li>
    </ul>

    <div class="nav-actions">
      <button class="nav-icon-btn" id="btn-search" title="Search">
        <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="m21 21-4.35-4.35"/>
        </svg>
      </button>
      <button class="nav-icon-btn" id="btn-favorites" title="Favorites" onclick="window.location.href='/profile.html?tab=favorites'">
        <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
      <button class="nav-icon-btn" id="btn-cart" title="Cart" onclick="window.location.href='/cart.html'">
        <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <span class="nav-badge" id="cart-badge">0</span>
      </button>

      <a href="https://discord.gg/M5aAG5TqJ8" target="_blank" class="nav-discord-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.04.033.05a19.868 19.868 0 005.993 3.029.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.029.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/>
        </svg>
        Discord
      </a>

      <button class="btn-login" id="btn-login">Sign In</button>

      <div class="nav-user" id="nav-user" style="display:none">
        <div class="nav-user-avatar" id="nav-user-initial">U</div>
        <span id="nav-user-name"></span>
      </div>
    </div>

    <button class="nav-menu-btn" id="nav-menu-btn">
      <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>
  </div>
</nav>

<!-- Mobile nav drawer -->
<div id="mobile-nav" style="display:none;position:fixed;top:58px;left:0;right:0;bottom:0;z-index:999;background:rgba(7,10,20,0.97);backdrop-filter:blur(12px);padding:20px 24px;border-top:1px solid rgba(255,255,255,0.07);overflow-y:auto;">
  <ul style="display:flex;flex-direction:column;gap:4px;">
    <li><a href="/index.html" style="display:block;padding:12px 14px;font-size:.95rem;font-weight:600;color:#e2e8f0;border-radius:8px;transition:background .15s;" onclick="closeMobileNav()">Home</a></li>
    <li><a href="/shop.html" style="display:block;padding:12px 14px;font-size:.95rem;font-weight:600;color:#e2e8f0;border-radius:8px;" onclick="closeMobileNav()">Shop</a></li>
    <li><a href="/accounts.html" style="display:block;padding:12px 14px;font-size:.95rem;font-weight:600;color:#e2e8f0;border-radius:8px;" onclick="closeMobileNav()">Accounts</a></li>
    <li><a href="/tutorial.html" style="display:block;padding:12px 14px;font-size:.95rem;font-weight:600;color:#e2e8f0;border-radius:8px;" onclick="closeMobileNav()">Tutorial</a></li>
    <li><a href="/faq.html" style="display:block;padding:12px 14px;font-size:.95rem;font-weight:600;color:#e2e8f0;border-radius:8px;" onclick="closeMobileNav()">FAQ</a></li>
    <li><a href="/proofs.html" style="display:block;padding:12px 14px;font-size:.95rem;font-weight:600;color:#e2e8f0;border-radius:8px;" onclick="closeMobileNav()">Proofs</a></li>
    <li style="padding-top:12px;border-top:1px solid rgba(255,255,255,0.07);margin-top:8px;">
      <a href="https://discord.gg/M5aAG5TqJ8" target="_blank" style="display:flex;align-items:center;gap:8px;padding:12px 14px;font-size:.95rem;font-weight:600;color:#8b9cf7;border-radius:8px;background:rgba(88,101,242,0.1);border:1px solid rgba(88,101,242,0.2);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.04.033.05a19.868 19.868 0 005.993 3.029.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.029.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>
        Join Discord
      </a>
    </li>
  </ul>
</div>

<!-- Auth Modal -->
<div id="auth-modal">
  <div class="modal-overlay"></div>
  <div class="modal-box">
    <button class="modal-close" id="auth-modal-close">
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M18 6 6 18M6 6l12 12"/>
      </svg>
    </button>

    <div class="modal-tabs">
      <button class="modal-tab active" data-tab="login">Sign In</button>
      <button class="modal-tab" data-tab="register">Create Account</button>
    </div>

    <form id="login-form" class="modal-form" data-form="login">
      <div class="form-group">
        <label class="form-label" for="login-email">Email</label>
        <input class="form-input" type="email" id="login-email" placeholder="you@example.com" autocomplete="email" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="login-password">Password</label>
        <input class="form-input" type="password" id="login-password" placeholder="Password" autocomplete="current-password" required>
      </div>
      <div class="form-error" id="login-error"></div>
      <button type="submit" class="btn btn-primary btn-full" style="margin-top:8px;">Sign In</button>
    </form>

    <form id="register-form" class="modal-form" data-form="register" style="display:none">
      <div class="form-group">
        <label class="form-label" for="reg-username">Username</label>
        <input class="form-input" type="text" id="reg-username" placeholder="YourUsername" autocomplete="username" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="reg-email">Email</label>
        <input class="form-input" type="email" id="reg-email" placeholder="you@example.com" autocomplete="email" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="reg-password">Password</label>
        <input class="form-input" type="password" id="reg-password" placeholder="Min. 8 characters" autocomplete="new-password" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="reg-confirm">Confirm Password</label>
        <input class="form-input" type="password" id="reg-confirm" placeholder="Repeat password" autocomplete="new-password" required>
      </div>
      <div class="form-error" id="reg-error"></div>
      <button type="submit" class="btn btn-primary btn-full" style="margin-top:8px;">Create Account</button>
    </form>
  </div>
</div>

<!-- Search Overlay -->
<div id="search-overlay">
  <div class="search-overlay-bg"></div>
  <div class="search-box">
    <div class="search-input-wrap">
      <svg class="search-icon-in" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="m21 21-4.35-4.35"/>
      </svg>
      <input class="search-input" type="text" id="search-input" placeholder="Search items, serums, families...">
    </div>
    <div class="search-results" id="search-results"></div>
  </div>
</div>
`;

// Inject synchronously so auth.js DOMContentLoaded handlers find elements
if (document.body) {
  document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
}

document.addEventListener('DOMContentLoaded', () => {
  // Highlight active nav link
  const page = document.body.dataset.page;
  if (page) {
    document.querySelector(`.nav-links a[data-page="${page}"]`)?.classList.add('active');
  }

  // Mobile nav toggle
  const menuBtn = document.getElementById('nav-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      const open = mobileNav.style.display === 'block';
      mobileNav.style.display = open ? 'none' : 'block';
    });
  }
});

function closeMobileNav() {
  const el = document.getElementById('mobile-nav');
  if (el) el.style.display = 'none';
}

// Cursor spotlight effect
(function() {
  const el = document.createElement('div');
  el.id = 'cursor-spotlight';
  document.body.appendChild(el);
  let visible = false;
  document.addEventListener('mousemove', (e) => {
    el.style.left = e.clientX + 'px';
    el.style.top = e.clientY + 'px';
    if (!visible) { el.style.opacity = '1'; visible = true; }
  });
  document.addEventListener('mouseleave', () => { el.style.opacity = '0'; visible = false; });
})();

// Trustpilot review invitation
(function(w,d,s,r,n){w.TrustpilotObject=n;w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
  var a=d.createElement(s);a.async=1;a.src=r;a.type='text/java'+s;var f=d.getElementsByTagName(s)[0];
  f.parentNode.insertBefore(a,f)})(window,document,'script','https://invitejs.trustpilot.com/tp.min.js','tp');
tp('register', '9VNpjmaDr9fZXgQF');
