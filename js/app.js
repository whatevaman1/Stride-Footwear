/* ============================================
   STRIDE — Core Application Logic
   Nav, Footer, Cart, Wishlist, Theme, Breadcrumbs
   ============================================ */

// === Path Detection ===
const IS_SUB_PAGE = window.location.pathname.includes('/html/');
const ROOT_PATH = IS_SUB_PAGE ? '../' : '';
const HTML_PATH = IS_SUB_PAGE ? '' : 'html/';
const IMG_PATH = ROOT_PATH + 'assets/images/';

// === Theme Management (Dark/Light) ===
function getTheme() {
  return localStorage.getItem('stride_theme') || 'dark';
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('stride_theme', theme);
  updateThemeToggle(theme);
}

function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

function updateThemeToggle(theme) {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;
  const isDark = theme === 'dark';
  btn.innerHTML = `
    <span class="icon ${isDark ? 'active-icon' : 'hidden-icon'}">🌙</span>
    <span class="icon ${isDark ? 'hidden-icon' : 'active-icon'}">☀️</span>
  `;
}

// === Navigation Builder ===
function buildNavigation() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const cartCount = getCart().reduce((sum, item) => sum + item.qty, 0);
  const wishCount = getWishlist().length;
  const user = getUser();
  const theme = getTheme();

  nav.className = 'fixed top-0 w-full z-50 bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-white/5';
  nav.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <a href="${ROOT_PATH}index.html" class="text-2xl font-extrabold gradient-text tracking-tight" id="nav-logo">STRIDE</a>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-1">
          <a href="${ROOT_PATH}index.html" class="nav-link px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">Home</a>
          <a href="${HTML_PATH}products.html" class="nav-link px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">Shop</a>

          <!-- Categories Dropdown -->
          <div class="relative group" id="nav-categories">
            <button class="nav-link px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all flex items-center gap-1">
              Categories
              <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="absolute top-full left-0 mt-1 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
              <a href="${HTML_PATH}products.html?category=men" class="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-amber-400 transition-all">👟 Men</a>
              <a href="${HTML_PATH}products.html?category=women" class="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-amber-400 transition-all">👠 Women</a>
              <a href="${HTML_PATH}products.html?category=kids" class="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-amber-400 transition-all">👶 Kids</a>
              <div class="border-t border-white/5"></div>
              <a href="${HTML_PATH}products.html?style=traditional" class="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-amber-400 transition-all">🇮🇳 Indian Collection</a>
            </div>
          </div>

          <a href="${HTML_PATH}about.html" class="nav-link px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">About</a>
          <a href="${HTML_PATH}reviews.html" class="nav-link px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">Reviews</a>
          <a href="${HTML_PATH}contact.html" class="nav-link px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">Contact</a>
        </div>

        <!-- Right Side -->
        <div class="flex items-center space-x-2">
          <!-- Theme Toggle -->
          <button class="theme-toggle" id="theme-toggle-btn" onclick="toggleTheme()" title="Toggle theme">
            <span class="icon ${theme === 'dark' ? 'active-icon' : 'hidden-icon'}">🌙</span>
            <span class="icon ${theme === 'dark' ? 'hidden-icon' : 'active-icon'}">☀️</span>
          </button>

          <!-- Wishlist -->
          <a href="${HTML_PATH}wishlist.html" class="relative p-2 rounded-lg hover:bg-white/5 transition-all group" id="nav-wishlist-link" title="Wishlist">
            <svg class="w-5 h-5 text-gray-300 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            <span class="absolute -top-1 -right-1 badge bg-red-500 text-white ${wishCount === 0 ? 'hidden' : ''}" id="nav-wish-count">${wishCount}</span>
          </a>

          <!-- Cart -->
          <a href="${HTML_PATH}cart.html" class="relative p-2 rounded-lg hover:bg-white/5 transition-all group" id="nav-cart-link" title="Cart">
            <svg class="w-5 h-5 text-gray-300 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            <span class="absolute -top-1 -right-1 badge ${cartCount === 0 ? 'hidden' : ''}" id="nav-cart-count">${cartCount}</span>
          </a>

          <!-- Auth -->
          ${user ? `
            <a href="${HTML_PATH}account.html" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all group" id="nav-account-link">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xs font-bold text-black">${user.name.split(' ').map(n => n[0]).join('')}</div>
              <span class="text-sm text-gray-300 group-hover:text-white hidden sm:inline">${user.name.split(' ')[0]}</span>
            </a>
          ` : `
            <a href="${HTML_PATH}login.html" class="btn-primary text-sm px-5 py-2" id="nav-login-btn">Sign In</a>
          `}

          <!-- Mobile Menu Toggle -->
          <button class="md:hidden p-2 rounded-lg hover:bg-white/5 transition-all" id="mobile-menu-btn" onclick="toggleMobileMenu()">
            <svg class="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div class="mobile-overlay" id="mobile-overlay" onclick="toggleMobileMenu()"></div>
    <div class="mobile-menu" id="mobile-menu">
      <div class="flex flex-col space-y-2">
        <a href="${ROOT_PATH}index.html" class="px-4 py-3 rounded-lg text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">🏠 Home</a>
        <a href="${HTML_PATH}products.html" class="px-4 py-3 rounded-lg text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">🛍️ Shop All</a>
        <a href="${HTML_PATH}products.html?category=men" class="px-4 py-3 rounded-lg text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all pl-8">👟 Men</a>
        <a href="${HTML_PATH}products.html?category=women" class="px-4 py-3 rounded-lg text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all pl-8">👠 Women</a>
        <a href="${HTML_PATH}products.html?category=kids" class="px-4 py-3 rounded-lg text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all pl-8">👶 Kids</a>
        <a href="${HTML_PATH}products.html?style=traditional" class="px-4 py-3 rounded-lg text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all pl-8">🇮🇳 Indian Collection</a>
        <a href="${HTML_PATH}about.html" class="px-4 py-3 rounded-lg text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">🏛️ About Us</a>
        <a href="${HTML_PATH}reviews.html" class="px-4 py-3 rounded-lg text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">⭐ Reviews</a>
        <a href="${HTML_PATH}contact.html" class="px-4 py-3 rounded-lg text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">📧 Contact</a>
        <a href="${HTML_PATH}wishlist.html" class="px-4 py-3 rounded-lg text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">❤️ Wishlist (${wishCount})</a>
        <a href="${HTML_PATH}cart.html" class="px-4 py-3 rounded-lg text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">🛒 Cart (${cartCount})</a>
        ${user ? `
          <a href="${HTML_PATH}account.html" class="px-4 py-3 rounded-lg text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">👤 Account</a>
          <button onclick="logout()" class="px-4 py-3 rounded-lg text-red-400 hover:bg-white/5 transition-all text-left">🚪 Logout</button>
        ` : `
          <a href="${HTML_PATH}login.html" class="px-4 py-3 rounded-lg text-amber-400 hover:bg-white/5 transition-all">🔑 Sign In</a>
        `}
        <div class="px-4 py-3">
          <button onclick="toggleTheme()" class="btn-secondary w-full py-2.5 text-sm">
            ${theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>
    </div>
  `;

  highlightActiveNav();
}

function highlightActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.endsWith(currentPage)) {
      link.classList.add('text-amber-400', 'bg-white/5');
      link.classList.remove('text-gray-300');
    }
  });
}

function toggleMobileMenu() {
  document.getElementById('mobile-menu')?.classList.toggle('open');
  document.getElementById('mobile-overlay')?.classList.toggle('open');
}

// === Footer Builder ===
function buildFooter() {
  const footer = document.getElementById('main-footer');
  if (!footer) return;

  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
        <div>
          <h3 class="text-2xl font-extrabold gradient-text mb-4">STRIDE</h3>
          <p class="text-gray-400 text-sm leading-relaxed">Premium footwear for every step of your journey. Quality craftsmanship meets modern design.</p>
          <div class="flex space-x-3 mt-4">
            <a href="#" class="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-amber-400 hover:border-amber-400/30 transition-all text-sm">𝕏</a>
            <a href="#" class="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-amber-400 hover:border-amber-400/30 transition-all text-sm">📸</a>
            <a href="#" class="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-amber-400 hover:border-amber-400/30 transition-all text-sm">📘</a>
          </div>
        </div>
        <div>
          <h4 class="font-semibold text-white mb-4">Shop</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="${HTML_PATH}products.html?category=men" class="text-gray-400 hover:text-amber-400 transition-colors">Men's Collection</a></li>
            <li><a href="${HTML_PATH}products.html?category=women" class="text-gray-400 hover:text-amber-400 transition-colors">Women's Collection</a></li>
            <li><a href="${HTML_PATH}products.html?category=kids" class="text-gray-400 hover:text-amber-400 transition-colors">Kids' Collection</a></li>
            <li><a href="${HTML_PATH}products.html" class="text-gray-400 hover:text-amber-400 transition-colors">New Arrivals</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-white mb-4">Support</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="${HTML_PATH}contact.html" class="text-gray-400 hover:text-amber-400 transition-colors">Contact Us</a></li>
            <li><a href="${HTML_PATH}orders.html" class="text-gray-400 hover:text-amber-400 transition-colors">Track Order</a></li>
            <li><a href="#" class="text-gray-400 hover:text-amber-400 transition-colors">Shipping Policy</a></li>
            <li><a href="#" class="text-gray-400 hover:text-amber-400 transition-colors">Returns</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-white mb-4">Newsletter</h4>
          <p class="text-gray-400 text-sm mb-3">Get 10% off your first order</p>
          <form onsubmit="event.preventDefault(); showToast('Subscribed!', 'success');" class="flex gap-2">
            <input type="email" placeholder="your@email.com" class="form-input text-sm flex-1 py-2.5">
            <button type="submit" class="btn-primary text-sm px-4 py-2.5">→</button>
          </form>
        </div>
      </div>
      <div class="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p class="text-gray-500 text-xs">&copy; 2026 STRIDE. All rights reserved.</p>
        <div class="flex space-x-6 text-xs text-gray-500">
          <a href="#" class="hover:text-gray-300 transition-colors">Privacy Policy</a>
          <a href="#" class="hover:text-gray-300 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  `;
}

// === Cart Management (localStorage) ===
function getCart() {
  try { return JSON.parse(localStorage.getItem('stride_cart')) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem('stride_cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, size, qty = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const cart = getCart();
  const existingIndex = cart.findIndex(item => item.productId === productId && item.size === size);

  if (existingIndex >= 0) {
    cart[existingIndex].qty += qty;
  } else {
    cart.push({
      productId: product.id, name: product.name, price: product.price,
      image: product.image, size: size || product.sizes[0], qty: qty, brand: product.brand
    });
  }

  saveCart(cart);
  showToast(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId, size) {
  let cart = getCart();
  cart = cart.filter(item => !(item.productId === productId && item.size === size));
  saveCart(cart);
  showToast('Item removed from cart', 'info');
}

function updateCartQty(productId, size, newQty) {
  const cart = getCart();
  const item = cart.find(i => i.productId === productId && i.size === size);
  if (item) {
    if (newQty <= 0) { removeFromCart(productId, size); return; }
    item.qty = newQty;
    saveCart(cart);
  }
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function clearCart() {
  localStorage.removeItem('stride_cart');
  updateCartBadge();
}

function updateCartBadge() {
  const count = getCartCount();
  const badge = document.getElementById('nav-cart-count');
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
    if (count > 0) {
      badge.classList.add('badge-pulse');
      setTimeout(() => badge.classList.remove('badge-pulse'), 400);
    }
  }
}

// === Wishlist Management (localStorage) ===
function getWishlist() {
  try { return JSON.parse(localStorage.getItem('stride_wishlist')) || []; }
  catch { return []; }
}

function saveWishlist(list) {
  localStorage.setItem('stride_wishlist', JSON.stringify(list));
  updateWishBadge();
}

function toggleWishlist(productId) {
  let list = getWishlist();
  const idx = list.indexOf(productId);
  if (idx >= 0) {
    list.splice(idx, 1);
    showToast('Removed from wishlist', 'info');
  } else {
    list.push(productId);
    showToast('Added to wishlist! ❤️', 'success');
  }
  saveWishlist(list);
  // Update all heart buttons on page
  document.querySelectorAll(`.wishlist-btn[data-id="${productId}"]`).forEach(btn => {
    btn.classList.toggle('active', list.includes(productId));
    btn.innerHTML = list.includes(productId) ? '❤️' : '🤍';
  });
}

function isInWishlist(productId) {
  return getWishlist().includes(productId);
}

function updateWishBadge() {
  const count = getWishlist().length;
  const badge = document.getElementById('nav-wish-count');
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  }
}

// === Auth Management (localStorage) ===
function getUser() {
  try { return JSON.parse(localStorage.getItem('stride_user')); }
  catch { return null; }
}

function saveUser(user) {
  localStorage.setItem('stride_user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('stride_user');
  showToast('Logged out successfully', 'info');
  setTimeout(() => window.location.href = ROOT_PATH + 'index.html', 800);
}

// === Toast Notifications ===
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// === Breadcrumb Navigation ===
function setBreadcrumbs(items) {
  const container = document.getElementById('breadcrumbs');
  if (!container) return;

  let html = `<a href="${ROOT_PATH}index.html">🏠 Home</a>`;
  items.forEach((item, i) => {
    html += `<span class="separator">›</span>`;
    if (item.href && i < items.length - 1) {
      html += `<a href="${item.href}">${item.label}</a>`;
    } else {
      html += `<span class="current">${item.label}</span>`;
    }
  });

  container.innerHTML = html;
}

// === Star Rating Renderer ===
function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star ${i <= Math.round(rating) ? 'filled' : ''}">★</span>`;
  }
  return html;
}

// === Price Formatter ===
function formatPrice(price) {
  return '₹' + price.toLocaleString('en-IN');
}

// === Skeleton Card Generator ===
function renderSkeletonCards(count = 8) {
  return Array.from({ length: count }, () => `
    <div class="skeleton-card">
      <div class="skel-img skeleton"></div>
      <div class="skel-line short skeleton"></div>
      <div class="skel-line medium skeleton"></div>
      <div class="skel-line skeleton" style="width:55%"></div>
      <div class="skel-btn skeleton"></div>
    </div>
  `).join('');
}

// === Initialize on DOM Load ===
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme
  setTheme(getTheme());
  buildNavigation();
  buildFooter();
});
