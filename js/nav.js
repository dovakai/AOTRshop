// Shared navbar + auth modal HTML injected into every page

const NAV_HTML = `
<nav id="navbar">
  <div class="container nav-inner">
    <a href="/index.html" class="nav-logo">AOTR<span>Shop</span></a>

    <ul class="nav-links">
      <li><a href="/shop.html" data-page="shop">Shop</a></li>
      <li><a href="/accounts.html" data-page="accounts">Accounts</a></li>
      <li><a href="/tutorial.html" data-page="tutorial">Tutorial</a></li>
      <li><a href="/faq.html" data-page="faq">FAQ</a></li>
    </ul>

    <div class="nav-actions">
      <button class="nav-icon-btn" id="btn-search" title="Search">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="m21 21-4.35-4.35"/>
        </svg>
      </button>
      <button class="nav-icon-btn" id="btn-favorites" title="Favorites" onclick="window.location.href='/profile.html?tab=favorites'">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
      <button class="nav-icon-btn" id="btn-cart" title="Cart" onclick="window.location.href='/cart.html'">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <span class="nav-badge" id="cart-badge">0</span>
      </button>

      <button class="btn-login" id="btn-login">Sign In</button>

      <div class="nav-user" id="nav-user" style="display:none">
        <div class="nav-user-avatar" id="nav-user-initial">U</div>
        <span id="nav-user-name"></span>
      </div>
    </div>
  </div>
</nav>

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

    <!-- Login form -->
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

    <!-- Register form -->
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

// Inject navbar synchronously so auth.js DOMContentLoaded handlers find the elements
if (document.body) {
  document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
}

document.addEventListener('DOMContentLoaded', () => {
  // Highlight active nav link
  const page = document.body.dataset.page;
  if (page) {
    document.querySelector(`.nav-links a[data-page="${page}"]`)?.classList.add('active');
  }
});

// Trustpilot review invitation
(function(w,d,s,r,n){w.TrustpilotObject=n;w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
  var a=d.createElement(s);a.async=1;a.src=r;a.type='text/java'+s;var f=d.getElementsByTagName(s)[0];
  f.parentNode.insertBefore(a,f)})(window,document,'script','https://invitejs.trustpilot.com/tp.min.js','tp');
tp('register', '9VNpjmaDr9fZXgQF');
