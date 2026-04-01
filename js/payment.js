/* ============================================
   STRIDE — Payment Form Validation
   Card preview, validation, order simulation
   ============================================ */

function initPaymentPage() {
  renderPaymentSummary();
  setupCardPreview();
  setupPaymentValidation();
}

function renderPaymentSummary() {
  const container = document.getElementById('payment-items');
  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    window.location.href = `${HTML_PATH}cart.html`;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 flex-shrink-0">
        <img src="${IMG_PATH}${item.image}" alt="${item.name}" class="w-full h-full object-contain p-1.5">
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-white truncate">${item.name}</p>
        <p class="text-xs text-gray-400">Size ${item.size} × ${item.qty}</p>
      </div>
      <p class="text-sm font-semibold text-white">${formatPrice(item.price * item.qty)}</p>
    </div>
  `).join('');

  const subtotal = getCartTotal();
  const shipping = subtotal >= 8000 ? 0 : 499;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  document.getElementById('pay-subtotal').textContent = formatPrice(subtotal);
  document.getElementById('pay-shipping').textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);
  document.getElementById('pay-tax').textContent = formatPrice(tax);
  document.getElementById('pay-total').textContent = formatPrice(total);
  document.getElementById('pay-btn-total').textContent = formatPrice(total);
}

function setupCardPreview() {
  const cardNumber = document.getElementById('card-number');
  const cardName = document.getElementById('card-name');
  const cardExpiry = document.getElementById('card-expiry');

  cardNumber?.addEventListener('input', (e) => {
    // Format card number with spaces
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(.{4})/g, '$1 ').trim();
    e.target.value = value.substring(0, 19);

    // Update preview
    const preview = document.getElementById('preview-number');
    if (preview) {
      preview.textContent = value || '•••• •••• •••• ••••';
    }

    // Detect card type
    const typeEl = document.getElementById('card-type-icon');
    if (typeEl) {
      const num = value.replace(/\s/g, '');
      if (/^4/.test(num)) typeEl.textContent = '💳 Visa';
      else if (/^5[1-5]/.test(num)) typeEl.textContent = '💳 Mastercard';
      else if (/^3[47]/.test(num)) typeEl.textContent = '💳 Amex';
      else typeEl.textContent = '💳';
    }
  });

  cardName?.addEventListener('input', (e) => {
    const preview = document.getElementById('preview-name');
    if (preview) {
      preview.textContent = e.target.value.toUpperCase() || 'YOUR NAME';
    }
  });

  cardExpiry?.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;

    const preview = document.getElementById('preview-expiry');
    if (preview) {
      preview.textContent = value || 'MM/YY';
    }
  });
}

function setupPaymentValidation() {
  const form = document.getElementById('payment-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const cardNumber = document.getElementById('card-number');
    const cardName = document.getElementById('card-name');
    const cardExpiry = document.getElementById('card-expiry');
    const cardCvv = document.getElementById('card-cvv');
    const billingAddress = document.getElementById('billing-address');
    const billingCity = document.getElementById('billing-city');
    const billingZip = document.getElementById('billing-zip');

    let valid = true;

    // Card number validation (16 digits)
    const cardNum = cardNumber.value.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cardNum)) {
      setFieldError(cardNumber, cardNumber.parentElement.querySelector('.error-message'), 'Enter a valid 16-digit card number');
      valid = false;
    } else {
      setFieldSuccess(cardNumber, cardNumber.parentElement.querySelector('.error-message'));
    }

    // Cardholder name
    if (!/^[a-zA-Z\s]{2,}$/.test(cardName.value.trim())) {
      setFieldError(cardName, cardName.parentElement.querySelector('.error-message'), 'Enter the cardholder name');
      valid = false;
    } else {
      setFieldSuccess(cardName, cardName.parentElement.querySelector('.error-message'));
    }

    // Expiry validation (MM/YY format, not expired)
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(cardExpiry.value)) {
      setFieldError(cardExpiry, cardExpiry.parentElement.querySelector('.error-message'), 'Enter a valid expiry date (MM/YY)');
      valid = false;
    } else {
      const [month, year] = cardExpiry.value.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month));
      if (expiry < new Date()) {
        setFieldError(cardExpiry, cardExpiry.parentElement.querySelector('.error-message'), 'Card has expired');
        valid = false;
      } else {
        setFieldSuccess(cardExpiry, cardExpiry.parentElement.querySelector('.error-message'));
      }
    }

    // CVV validation (3-4 digits)
    if (!/^\d{3,4}$/.test(cardCvv.value)) {
      setFieldError(cardCvv, cardCvv.parentElement.querySelector('.error-message'), 'Enter a valid CVV (3-4 digits)');
      valid = false;
    } else {
      setFieldSuccess(cardCvv, cardCvv.parentElement.querySelector('.error-message'));
    }

    // Billing address
    if (billingAddress && !billingAddress.value.trim()) {
      setFieldError(billingAddress, billingAddress.parentElement.querySelector('.error-message'), 'Enter your billing address');
      valid = false;
    } else if (billingAddress) {
      setFieldSuccess(billingAddress, billingAddress.parentElement.querySelector('.error-message'));
    }

    // City
    if (billingCity && !billingCity.value.trim()) {
      setFieldError(billingCity, billingCity.parentElement.querySelector('.error-message'), 'Enter your city');
      valid = false;
    } else if (billingCity) {
      setFieldSuccess(billingCity, billingCity.parentElement.querySelector('.error-message'));
    }

    // Zip code
    if (billingZip && !/^\d{5}(-\d{4})?$/.test(billingZip.value.trim())) {
      setFieldError(billingZip, billingZip.parentElement.querySelector('.error-message'), 'Enter a valid ZIP code');
      valid = false;
    } else if (billingZip) {
      setFieldSuccess(billingZip, billingZip.parentElement.querySelector('.error-message'));
    }

    if (valid) {
      processPayment();
    }
  });

  // Clear errors on focus
  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', () => clearFieldState(input));
  });
}

function processPayment() {
  const btn = document.getElementById('pay-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="inline-block animate-spin mr-2">⏳</span> Processing payment...';

  // Simulate payment processing
  setTimeout(() => {
    // Save order data before clearing cart
    const cart = getCart();
    const orderId = 'ORD-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000);
    sessionStorage.setItem('stride_last_order', JSON.stringify({ orderId, items: cart }));

    btn.innerHTML = '✅ Payment Successful!';
    btn.className = 'w-full py-4 rounded-xl font-semibold text-white bg-green-600 cursor-default';

    clearCart();
    showToast('Order placed successfully! 🎉', 'success');

    // Redirect to order confirmation page
    setTimeout(() => {
      window.location.href = 'order-confirmation.html';
    }, 1200);
  }, 2500);
}

function goToOrders() {
  window.location.href = `${HTML_PATH}orders.html`;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('payment-form')) {
    initPaymentPage();
  }
});
