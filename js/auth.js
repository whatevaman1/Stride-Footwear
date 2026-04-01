/* ============================================
   STRIDE — Authentication (Login/Signup)
   Form Validation with Regex
   ============================================ */

const VALIDATORS = {
  email: {
    regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: 'Please enter a valid email address'
  },
  password: {
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
    message: 'Password must be 8+ characters with uppercase, lowercase, number, and special character'
  },
  name: {
    regex: /^[a-zA-Z\s]{2,50}$/,
    message: 'Name must be 2-50 characters (letters and spaces only)'
  },
  phone: {
    regex: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
    message: 'Please enter a valid phone number'
  }
};

function validateField(input, validatorKey) {
  const value = input.value.trim();
  const validator = VALIDATORS[validatorKey];
  const errorEl = input.parentElement.querySelector('.error-message');

  if (!value) {
    setFieldError(input, errorEl, 'This field is required');
    return false;
  }

  if (validator && !validator.regex.test(value)) {
    setFieldError(input, errorEl, validator.message);
    return false;
  }

  setFieldSuccess(input, errorEl);
  return true;
}

function setFieldError(input, errorEl, message) {
  input.classList.remove('success');
  input.classList.add('error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
}

function setFieldSuccess(input, errorEl) {
  input.classList.remove('error');
  input.classList.add('success');
  if (errorEl) {
    errorEl.classList.remove('visible');
  }
}

function clearFieldState(input) {
  input.classList.remove('error', 'success');
  const errorEl = input.parentElement.querySelector('.error-message');
  if (errorEl) errorEl.classList.remove('visible');
}

// === Login Form ===
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');

  // Real-time validation
  emailInput?.addEventListener('blur', () => validateField(emailInput, 'email'));
  passwordInput?.addEventListener('blur', () => {
    if (!passwordInput.value.trim()) {
      setFieldError(passwordInput, passwordInput.parentElement.querySelector('.error-message'), 'Password is required');
    } else {
      setFieldSuccess(passwordInput, passwordInput.parentElement.querySelector('.error-message'));
    }
  });

  // Clear errors on focus
  [emailInput, passwordInput].forEach(input => {
    input?.addEventListener('focus', () => clearFieldState(input));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const emailValid = validateField(emailInput, 'email');
    const passwordValid = passwordInput.value.trim().length > 0;

    if (!passwordValid) {
      setFieldError(passwordInput, passwordInput.parentElement.querySelector('.error-message'), 'Password is required');
    }

    if (emailValid && passwordValid) {
      // Simulate login
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<span class="inline-block animate-spin mr-2">⏳</span> Signing in...';

      setTimeout(() => {
        const user = {
          name: emailInput.value.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email: emailInput.value,
          phone: '+1 (555) 123-4567',
          joinDate: new Date().toISOString().split('T')[0]
        };
        saveUser(user);
        showToast('Welcome back! Redirecting...', 'success');
        setTimeout(() => window.location.href = `${HTML_PATH}account.html`, 1000);
      }, 1500);
    }
  });
}

// === Signup Form ===
function initSignupForm() {
  const form = document.getElementById('signup-form');
  if (!form) return;

  const nameInput = document.getElementById('signup-name');
  const emailInput = document.getElementById('signup-email');
  const phoneInput = document.getElementById('signup-phone');
  const passwordInput = document.getElementById('signup-password');
  const confirmPasswordInput = document.getElementById('signup-confirm-password');

  // Real-time validation
  nameInput?.addEventListener('blur', () => validateField(nameInput, 'name'));
  emailInput?.addEventListener('blur', () => validateField(emailInput, 'email'));
  phoneInput?.addEventListener('blur', () => validateField(phoneInput, 'phone'));
  passwordInput?.addEventListener('blur', () => validateField(passwordInput, 'password'));
  confirmPasswordInput?.addEventListener('blur', () => {
    if (confirmPasswordInput.value !== passwordInput.value) {
      setFieldError(confirmPasswordInput, confirmPasswordInput.parentElement.querySelector('.error-message'), 'Passwords do not match');
    } else if (confirmPasswordInput.value) {
      setFieldSuccess(confirmPasswordInput, confirmPasswordInput.parentElement.querySelector('.error-message'));
    }
  });

  // Password strength indicator
  passwordInput?.addEventListener('input', () => updatePasswordStrength(passwordInput.value));

  // Clear errors on focus
  [nameInput, emailInput, phoneInput, passwordInput, confirmPasswordInput].forEach(input => {
    input?.addEventListener('focus', () => clearFieldState(input));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameValid = validateField(nameInput, 'name');
    const emailValid = validateField(emailInput, 'email');
    const phoneValid = validateField(phoneInput, 'phone');
    const passwordValid = validateField(passwordInput, 'password');
    const confirmValid = confirmPasswordInput.value === passwordInput.value;

    if (!confirmValid) {
      setFieldError(confirmPasswordInput, confirmPasswordInput.parentElement.querySelector('.error-message'), 'Passwords do not match');
    }

    if (nameValid && emailValid && phoneValid && passwordValid && confirmValid) {
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<span class="inline-block animate-spin mr-2">⏳</span> Creating account...';

      setTimeout(() => {
        const user = {
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          phone: phoneInput.value.trim(),
          joinDate: new Date().toISOString().split('T')[0]
        };
        saveUser(user);
        showToast('Account created successfully!', 'success');
        setTimeout(() => window.location.href = `${HTML_PATH}account.html`, 1000);
      }, 1500);
    }
  });
}

function updatePasswordStrength(password) {
  const strengthBar = document.getElementById('password-strength');
  const strengthText = document.getElementById('password-strength-text');
  if (!strengthBar || !strengthText) return;

  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[@$!%*?&#]/.test(password)) strength++;

  const levels = [
    { width: '0%', color: 'bg-gray-700', text: '' },
    { width: '25%', color: 'bg-red-500', text: 'Weak' },
    { width: '50%', color: 'bg-amber-500', text: 'Fair' },
    { width: '75%', color: 'bg-blue-500', text: 'Good' },
    { width: '100%', color: 'bg-green-500', text: 'Strong' }
  ];

  const level = levels[strength];
  strengthBar.style.width = level.width;
  strengthBar.className = `h-full rounded-full transition-all duration-300 ${level.color}`;
  strengthText.textContent = level.text;
  strengthText.className = `text-xs mt-1 ${level.color.replace('bg-', 'text-')}`;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initLoginForm();
  initSignupForm();
});
