/* ============================================
   STRIDE — Cart Page Logic
   ============================================ */

function initCartPage() {
  renderCartItems();
  updateCartSummary();
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-20 animate-fade-in">
        <div class="text-7xl mb-6">🛒</div>
        <h2 class="text-2xl font-bold text-white mb-3">Your cart is empty</h2>
        <p class="text-gray-400 mb-8 max-w-md mx-auto">Looks like you haven't added anything to your cart yet. Explore our collection and find your perfect pair!</p>
        <a href="${HTML_PATH}products.html" class="btn-primary text-base px-8 py-3">
          🛍️ Start Shopping
        </a>
      </div>
    `;
    document.getElementById('cart-summary')?.classList.add('hidden');
    return;
  }

  document.getElementById('cart-summary')?.classList.remove('hidden');

  container.innerHTML = cart.map((item, index) => `
    <div class="cart-item animate-fade-in-up stagger-${index + 1}" id="cart-item-${item.productId}-${item.size}">
      <!-- Image -->
      <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 flex-shrink-0 overflow-hidden">
        <img src="${IMG_PATH}${item.image}" alt="${item.name}" class="w-full h-full object-contain p-3">
      </div>

      <!-- Details -->
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-xs text-amber-400/70 font-medium uppercase tracking-wider">${item.brand}</p>
            <h3 class="font-semibold text-white mt-0.5">${item.name}</h3>
            <p class="text-gray-400 text-sm mt-1">Size: ${item.size}</p>
          </div>
          <button onclick="removeCartItem(${item.productId}, ${item.size})"
                  class="text-gray-500 hover:text-red-400 transition-colors p-1" title="Remove item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>

        <div class="flex items-center justify-between mt-4">
          <!-- Quantity Controls -->
          <div class="flex items-center gap-2">
            <button class="qty-btn" onclick="changeCartQty(${item.productId}, ${item.size}, -1)">−</button>
            <span class="w-10 text-center text-white font-medium" id="qty-${item.productId}-${item.size}">${item.qty}</span>
            <button class="qty-btn" onclick="changeCartQty(${item.productId}, ${item.size}, 1)">+</button>
          </div>

          <!-- Price -->
          <div class="text-right">
            <p class="text-lg font-bold text-white">${formatPrice(item.price * item.qty)}</p>
            ${item.qty > 1 ? `<p class="text-xs text-gray-500">${formatPrice(item.price)} each</p>` : ''}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function changeCartQty(productId, size, delta) {
  const cart = getCart();
  const item = cart.find(i => i.productId === productId && i.size === size);
  if (!item) return;

  const newQty = item.qty + delta;
  if (newQty <= 0) {
    removeCartItem(productId, size);
    return;
  }

  updateCartQty(productId, size, newQty);

  // Update UI without full re-render
  const qtyEl = document.getElementById(`qty-${productId}-${size}`);
  if (qtyEl) qtyEl.textContent = newQty;

  updateCartSummary();
  renderCartItems(); // Re-render for price update
}

function removeCartItem(productId, size) {
  const el = document.getElementById(`cart-item-${productId}-${size}`);
  if (el) {
    el.style.transform = 'translateX(100px)';
    el.style.opacity = '0';
    setTimeout(() => {
      removeFromCart(productId, size);
      renderCartItems();
      updateCartSummary();
    }, 300);
  } else {
    removeFromCart(productId, size);
    renderCartItems();
    updateCartSummary();
  }
}

function updateCartSummary() {
  const cart = getCart();
  const subtotal = getCartTotal();
  const shipping = subtotal >= 8000 ? 0 : 499;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const itemCountEl = document.getElementById('cart-item-count');
  const subtotalEl = document.getElementById('cart-subtotal');
  const shippingEl = document.getElementById('cart-shipping');
  const taxEl = document.getElementById('cart-tax');
  const totalEl = document.getElementById('cart-total');

  if (itemCountEl) itemCountEl.textContent = `${getCartCount()} item${getCartCount() !== 1 ? 's' : ''}`;
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);
  if (taxEl) taxEl.textContent = formatPrice(tax);
  if (totalEl) totalEl.textContent = formatPrice(total);
}

function proceedToCheckout() {
  const user = getUser();
  if (!user) {
    showToast('Please sign in to proceed to checkout', 'warning');
    setTimeout(() => window.location.href = `${HTML_PATH}login.html`, 1000);
    return;
  }
  if (getCart().length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }
  window.location.href = `${HTML_PATH}payment.html`;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cart-items')) {
    initCartPage();
  }
});
