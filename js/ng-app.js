/* ============================================
   STRIDE — AngularJS Application Module
   Full SPA-like behavior with AngularJS 1.x
   Dark Theme Only
   ============================================ */

// === AngularJS Module ===
var app = angular.module('strideApp', []);

// =============================================
// PATH CONSTANTS
// =============================================
app.constant('PATHS', (function() {
  var isSub = window.location.pathname.includes('/html/');
  return {
    IS_SUB_PAGE: isSub,
    ROOT_PATH: isSub ? '../' : '',
    HTML_PATH: isSub ? '' : 'html/',
    IMG_PATH: (isSub ? '../' : '') + 'assets/images/'
  };
})());

// =============================================
// PRODUCT DATA SERVICE
// =============================================
app.factory('ProductService', function() {
  // Products, Reviews, Orders from data.js (global PRODUCTS, REVIEWS, DUMMY_ORDERS)
  return {
    getProducts: function() { return PRODUCTS; },
    getProductById: function(id) { return PRODUCTS.find(function(p) { return p.id === id; }); },
    getReviews: function() { return REVIEWS; },
    getOrders: function() { return DUMMY_ORDERS; },
    getBrands: function() { return BRANDS; },
    getStyles: function() { return STYLES; },
    formatPrice: function(price) { return '₹' + price.toLocaleString('en-IN'); },
    renderStars: function(rating) {
      var stars = [];
      for (var i = 1; i <= 5; i++) {
        stars.push({ filled: i <= Math.round(rating) });
      }
      return stars;
    }
  };
});

// =============================================
// CART SERVICE (localStorage)
// =============================================
app.factory('CartService', ['$rootScope', function($rootScope) {
  var CART_KEY = 'stride_cart';

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch(e) { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    $rootScope.$broadcast('cart:updated');
  }

  return {
    getCart: getCart,
    getCount: function() {
      return getCart().reduce(function(sum, item) { return sum + item.qty; }, 0);
    },
    getTotal: function() {
      return getCart().reduce(function(sum, item) { return sum + item.price * item.qty; }, 0);
    },
    addToCart: function(product, size, qty) {
      qty = qty || 1;
      var cart = getCart();
      var idx = cart.findIndex(function(item) { return item.productId === product.id && item.size === size; });
      if (idx >= 0) {
        cart[idx].qty += qty;
      } else {
        cart.push({
          productId: product.id, name: product.name, price: product.price,
          image: product.image, size: size || product.sizes[0], qty: qty, brand: product.brand
        });
      }
      saveCart(cart);
      return product.name + ' added to cart!';
    },
    removeFromCart: function(productId, size) {
      var cart = getCart().filter(function(item) {
        return !(item.productId === productId && item.size === size);
      });
      saveCart(cart);
    },
    updateQty: function(productId, size, newQty) {
      var cart = getCart();
      var item = cart.find(function(i) { return i.productId === productId && i.size === size; });
      if (item) {
        if (newQty <= 0) {
          cart = cart.filter(function(i) { return !(i.productId === productId && i.size === size); });
        } else {
          item.qty = newQty;
        }
        saveCart(cart);
      }
    },
    clearCart: function() {
      localStorage.removeItem(CART_KEY);
      $rootScope.$broadcast('cart:updated');
    }
  };
}]);

// =============================================
// WISHLIST SERVICE (localStorage)
// =============================================
app.factory('WishlistService', ['$rootScope', function($rootScope) {
  var WISH_KEY = 'stride_wishlist';

  function getList() {
    try { return JSON.parse(localStorage.getItem(WISH_KEY)) || []; }
    catch(e) { return []; }
  }

  function saveList(list) {
    localStorage.setItem(WISH_KEY, JSON.stringify(list));
    $rootScope.$broadcast('wishlist:updated');
  }

  return {
    getList: getList,
    getCount: function() { return getList().length; },
    isInWishlist: function(productId) { return getList().indexOf(productId) >= 0; },
    toggle: function(productId) {
      var list = getList();
      var idx = list.indexOf(productId);
      var msg;
      if (idx >= 0) {
        list.splice(idx, 1);
        msg = 'Removed from wishlist';
      } else {
        list.push(productId);
        msg = 'Added to wishlist! ❤️';
      }
      saveList(list);
      return { added: idx < 0, message: msg };
    },
    clearAll: function() {
      localStorage.removeItem(WISH_KEY);
      $rootScope.$broadcast('wishlist:updated');
    }
  };
}]);

// =============================================
// AUTH SERVICE (localStorage)
// =============================================
app.factory('AuthService', ['$rootScope', function($rootScope) {
  var USER_KEY = 'stride_user';

  return {
    getUser: function() {
      try { return JSON.parse(localStorage.getItem(USER_KEY)); }
      catch(e) { return null; }
    },
    saveUser: function(user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      $rootScope.$broadcast('auth:updated');
    },
    logout: function() {
      localStorage.removeItem(USER_KEY);
      $rootScope.$broadcast('auth:updated');
    }
  };
}]);

// =============================================
// TOAST SERVICE
// =============================================
app.factory('ToastService', ['$timeout', '$rootScope', function($timeout, $rootScope) {
  return {
    show: function(message, type) {
      type = type || 'info';
      $rootScope.toast = { message: message, type: type, visible: true };
      $timeout(function() {
        $rootScope.toast.visible = false;
      }, 3000);
    }
  };
}]);

// =============================================
// VALIDATORS
// =============================================
app.constant('VALIDATORS', {
  email: {
    regex: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
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
});

// =============================================
// ROOT CONTROLLER (Nav, Footer, Toast, Global State)
// =============================================
app.controller('AppController', ['$scope', '$rootScope', 'PATHS', 'CartService', 'WishlistService', 'AuthService', 'ToastService', 'ProductService',
function($scope, $rootScope, PATHS, CartService, WishlistService, AuthService, ToastService, ProductService) {
  $scope.paths = PATHS;
  $scope.cartCount = CartService.getCount();
  $scope.wishCount = WishlistService.getCount();
  $scope.user = AuthService.getUser();
  $scope.mobileMenuOpen = false;
  $scope.formatPrice = ProductService.formatPrice;
  $scope.renderStars = ProductService.renderStars;

  // Nav links
  $scope.navLinks = [
    { label: 'Home', href: PATHS.ROOT_PATH + 'index.html' },
    { label: 'Shop', href: PATHS.HTML_PATH + 'products.html' },
    { label: 'About', href: PATHS.HTML_PATH + 'about.html' },
    { label: 'Reviews', href: PATHS.HTML_PATH + 'reviews.html' },
    { label: 'Contact', href: PATHS.HTML_PATH + 'contact.html' }
  ];

  $scope.categoryLinks = [
    { label: '👟 Men', href: PATHS.HTML_PATH + 'products.html?category=men' },
    { label: '👠 Women', href: PATHS.HTML_PATH + 'products.html?category=women' },
    { label: '👶 Kids', href: PATHS.HTML_PATH + 'products.html?category=kids' },
    { label: '🇮🇳 Indian Collection', href: PATHS.HTML_PATH + 'products.html?style=traditional', divider: true }
  ];

  $scope.mobileLinks = [
    { label: '🏠 Home', href: PATHS.ROOT_PATH + 'index.html' },
    { label: '🛍️ Shop All', href: PATHS.HTML_PATH + 'products.html' },
    { label: '👟 Men', href: PATHS.HTML_PATH + 'products.html?category=men', indent: true },
    { label: '👠 Women', href: PATHS.HTML_PATH + 'products.html?category=women', indent: true },
    { label: '👶 Kids', href: PATHS.HTML_PATH + 'products.html?category=kids', indent: true },
    { label: '🇮🇳 Indian Collection', href: PATHS.HTML_PATH + 'products.html?style=traditional', indent: true },
    { label: '🏛️ About Us', href: PATHS.HTML_PATH + 'about.html' },
    { label: '⭐ Reviews', href: PATHS.HTML_PATH + 'reviews.html' },
    { label: '📧 Contact', href: PATHS.HTML_PATH + 'contact.html' }
  ];

  // Active page detection
  $scope.currentPage = window.location.pathname.split('/').pop() || 'index.html';
  $scope.isActive = function(href) {
    return href && href.endsWith($scope.currentPage);
  };

  // User initials
  $scope.getUserInitials = function() {
    if (!$scope.user) return '';
    return $scope.user.name.split(' ').map(function(n) { return n[0]; }).join('');
  };

  $scope.getUserFirstName = function() {
    if (!$scope.user) return '';
    return $scope.user.name.split(' ')[0];
  };

  // Toggle mobile menu
  $scope.toggleMobileMenu = function() {
    $scope.mobileMenuOpen = !$scope.mobileMenuOpen;
  };

  // Logout
  $scope.logout = function() {
    AuthService.logout();
    ToastService.show('Logged out successfully', 'info');
    setTimeout(function() { window.location.href = PATHS.ROOT_PATH + 'index.html'; }, 800);
  };

  // Toast
  $rootScope.toast = { message: '', type: 'info', visible: false };
  $scope.toastIcons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  // Quick add to cart (global helper)
  $scope.quickAddToCart = function(productId) {
    var product = ProductService.getProductById(productId);
    if (product) {
      var msg = CartService.addToCart(product, product.sizes[0]);
      ToastService.show(msg, 'success');
    }
  };

  // Toggle wishlist (global helper)
  $scope.toggleWishlist = function(productId, $event) {
    if ($event) $event.stopPropagation();
    var result = WishlistService.toggle(productId);
    ToastService.show(result.message, result.added ? 'success' : 'info');
  };

  $scope.isInWishlist = function(productId) {
    return WishlistService.isInWishlist(productId);
  };

  // Newsletter
  $scope.newsletterEmail = '';
  $scope.subscribeNewsletter = function() {
    if ($scope.newsletterEmail) {
      ToastService.show('Subscribed!', 'success');
      $scope.newsletterEmail = '';
    }
  };

  // Listen for updates
  $scope.$on('cart:updated', function() {
    $scope.cartCount = CartService.getCount();
    if (!$scope.$$phase) $scope.$apply();
  });

  $scope.$on('wishlist:updated', function() {
    $scope.wishCount = WishlistService.getCount();
    if (!$scope.$$phase) $scope.$apply();
  });

  $scope.$on('auth:updated', function() {
    $scope.user = AuthService.getUser();
    if (!$scope.$$phase) $scope.$apply();
  });

  // Footer links
  $scope.shopLinks = [
    { label: "Men's Collection", href: PATHS.HTML_PATH + 'products.html?category=men' },
    { label: "Women's Collection", href: PATHS.HTML_PATH + 'products.html?category=women' },
    { label: "Kids' Collection", href: PATHS.HTML_PATH + 'products.html?category=kids' },
    { label: 'New Arrivals', href: PATHS.HTML_PATH + 'products.html' }
  ];

  $scope.supportLinks = [
    { label: 'Contact Us', href: PATHS.HTML_PATH + 'contact.html' },
    { label: 'Track Order', href: PATHS.HTML_PATH + 'orders.html' },
    { label: 'Shipping Policy', href: '#' },
    { label: 'Returns', href: '#' }
  ];
}]);

// =============================================
// HOME PAGE CONTROLLER
// =============================================
app.controller('HomeController', ['$scope', 'ProductService', 'WishlistService', 'CartService', 'ToastService',
function($scope, ProductService, WishlistService, CartService, ToastService) {
  $scope.featuredProducts = PRODUCTS.filter(function(p) { return p.badge; }).slice(0, 4);
  $scope.reviewPreviews = REVIEWS.slice(0, 3);
  $scope.formatPrice = ProductService.formatPrice;
  $scope.renderStars = ProductService.renderStars;

  $scope.categories = [
    { key: 'men', label: "Men's", emoji: '👟', href: 'html/products.html?category=men',
      gradient: 'from-blue-900/40 to-slate-900/80', hoverGradient: 'from-blue-800/50 to-slate-800/90',
      desc: 'Explore athletic, casual, and formal styles →', image: 'shoe-sport.png' },
    { key: 'women', label: "Women's", emoji: '👠', href: 'html/products.html?category=women',
      gradient: 'from-pink-900/40 to-slate-900/80', hoverGradient: 'from-pink-800/50 to-slate-800/90',
      desc: 'Discover sneakers, heels, and boots →', image: 'shoe-classic.png' },
    { key: 'kids', label: "Kids'", emoji: '👶', href: 'html/products.html?category=kids',
      gradient: 'from-green-900/40 to-slate-900/80', hoverGradient: 'from-green-800/50 to-slate-800/90',
      desc: 'Fun, durable shoes for active kids →', image: 'shoe-sport.png' }
  ];

  $scope.whyStride = [
    { emoji: '🚚', title: 'Free Shipping', desc: 'Free delivery on orders over ₹8,000. Fast and reliable nationwide shipping.' },
    { emoji: '🔄', title: 'Easy Returns', desc: '30-day hassle-free returns. Not the right fit? We\'ve got you covered.' },
    { emoji: '🏆', title: 'Premium Quality', desc: 'Handcrafted with the finest materials for lasting comfort and durability.' },
    { emoji: '💬', title: '24/7 Support', desc: 'Our dedicated team is here to help anytime. Chat, call, or email us.' }
  ];
}]);

// =============================================
// PRODUCTS PAGE CONTROLLER
// =============================================
app.controller('ProductsController', ['$scope', '$timeout', 'ProductService', 'CartService', 'WishlistService', 'ToastService', 'PATHS',
function($scope, $timeout, ProductService, CartService, WishlistService, ToastService, PATHS) {
  $scope.paths = PATHS;
  $scope.formatPrice = ProductService.formatPrice;
  $scope.renderStars = ProductService.renderStars;
  $scope.loading = true;

  // Filters
  $scope.filters = {
    category: 'all',
    priceMin: 0,
    priceMax: 20000,
    brands: {},
    minRating: 0,
    search: '',
    sort: 'featured',
    styleFilter: 'all'
  };

  $scope.currentPage = 1;
  $scope.perPage = 8;
  $scope.brands = BRANDS;

  // Price range
  var prices = PRODUCTS.map(function(p) { return p.price; });
  $scope.priceMin = Math.floor(Math.min.apply(null, prices));
  $scope.priceMax = Math.ceil(Math.max.apply(null, prices));

  // URL params
  var params = new URLSearchParams(window.location.search);
  var urlCat = params.get('category');
  var urlStyle = params.get('style');
  if (urlCat && ['men', 'women', 'kids'].indexOf(urlCat) >= 0) $scope.filters.category = urlCat;
  if (urlStyle && ['traditional', 'fusion', 'modern'].indexOf(urlStyle) >= 0) $scope.filters.styleFilter = urlStyle;

  // Category pills
  $scope.categoryPills = [
    { key: 'all', label: '🔥 All Products' },
    { key: 'men', label: "👟 Men's" },
    { key: 'women', label: "👠 Women's" },
    { key: 'kids', label: "👶 Kids'" }
  ];

  // Breadcrumb
  $scope.breadcrumbs = [];
  function updateBreadcrumbs() {
    var catNames = { men: "Men's", women: "Women's", kids: "Kids'" };
    var styleNames = { traditional: '🇮🇳 Indian Collection', fusion: 'Fusion', modern: 'Modern' };
    if ($scope.filters.styleFilter !== 'all') {
      $scope.breadcrumbs = [{ label: 'Shop', href: 'products.html' }, { label: styleNames[$scope.filters.styleFilter] }];
    } else if ($scope.filters.category !== 'all') {
      $scope.breadcrumbs = [{ label: 'Shop', href: 'products.html' }, { label: catNames[$scope.filters.category] }];
    } else {
      $scope.breadcrumbs = [{ label: 'Shop' }];
    }
  }
  updateBreadcrumbs();

  // Filtered products
  $scope.getFilteredProducts = function() {
    var result = PRODUCTS.slice();

    if ($scope.filters.category !== 'all') {
      result = result.filter(function(p) { return p.category === $scope.filters.category; });
    }

    result = result.filter(function(p) {
      return p.price >= $scope.filters.priceMin && p.price <= $scope.filters.priceMax;
    });

    var selectedBrands = Object.keys($scope.filters.brands).filter(function(b) { return $scope.filters.brands[b]; });
    if (selectedBrands.length > 0) {
      result = result.filter(function(p) { return selectedBrands.indexOf(p.brand) >= 0; });
    }

    if ($scope.filters.minRating > 0) {
      result = result.filter(function(p) { return p.rating >= $scope.filters.minRating; });
    }

    if ($scope.filters.styleFilter !== 'all') {
      if ($scope.filters.styleFilter === 'traditional') {
        result = result.filter(function(p) { return p.style === 'traditional' || p.style === 'fusion'; });
      } else {
        result = result.filter(function(p) { return p.style === $scope.filters.styleFilter; });
      }
    }

    if ($scope.filters.search && $scope.filters.search.trim()) {
      var q = $scope.filters.search.toLowerCase();
      result = result.filter(function(p) {
        return p.name.toLowerCase().indexOf(q) >= 0 ||
               p.brand.toLowerCase().indexOf(q) >= 0 ||
               p.subcategory.toLowerCase().indexOf(q) >= 0 ||
               p.description.toLowerCase().indexOf(q) >= 0 ||
               p.category.toLowerCase().indexOf(q) >= 0;
      });
    }

    switch ($scope.filters.sort) {
      case 'price-low': result.sort(function(a, b) { return a.price - b.price; }); break;
      case 'price-high': result.sort(function(a, b) { return b.price - a.price; }); break;
      case 'rating': result.sort(function(a, b) { return b.rating - a.rating; }); break;
      case 'name': result.sort(function(a, b) { return a.name.localeCompare(b.name); }); break;
      case 'popularity': result.sort(function(a, b) { return b.popularity - a.popularity; }); break;
    }

    return result;
  };

  $scope.filteredProducts = [];
  $scope.paginatedProducts = [];
  $scope.totalPages = 1;

  $scope.refreshProducts = function() {
    $scope.filteredProducts = $scope.getFilteredProducts();
    $scope.totalPages = Math.ceil($scope.filteredProducts.length / $scope.perPage);
    $scope.paginatedProducts = $scope.filteredProducts.slice(0, $scope.currentPage * $scope.perPage);
    updateBreadcrumbs();
  };

  $scope.setCategory = function(cat) {
    $scope.filters.category = cat;
    $scope.filters.styleFilter = 'all';
    $scope.currentPage = 1;
    $scope.refreshProducts();
  };

  $scope.setStyleFilter = function(style) {
    $scope.filters.styleFilter = style;
    $scope.filters.category = 'all';
    $scope.currentPage = 1;
    $scope.refreshProducts();
  };

  $scope.setRatingFilter = function(rating) {
    $scope.filters.minRating = rating;
    $scope.currentPage = 1;
    $scope.refreshProducts();
  };

  $scope.clearAllFilters = function() {
    $scope.filters = {
      category: 'all', priceMin: 0, priceMax: 20000,
      brands: {}, minRating: 0, search: '', sort: 'featured', styleFilter: 'all'
    };
    $scope.currentPage = 1;
    $scope.refreshProducts();
    ToastService.show('All filters cleared', 'info');
  };

  $scope.getActiveFilterCount = function() {
    var count = 0;
    var selectedBrands = Object.keys($scope.filters.brands).filter(function(b) { return $scope.filters.brands[b]; });
    if (selectedBrands.length > 0) count++;
    if ($scope.filters.minRating > 0) count++;
    if ($scope.filters.priceMin > 0 || $scope.filters.priceMax < 20000) count++;
    if ($scope.filters.category !== 'all') count++;
    return count;
  };

  $scope.getBrandCount = function(brand) {
    return PRODUCTS.filter(function(p) { return p.brand === brand; }).length;
  };

  $scope.ratingOptions = [4, 3, 2, 1];

  $scope.goToPage = function(page) {
    if (page < 1 || page > $scope.totalPages) return;
    $scope.currentPage = page;
    $scope.refreshProducts();
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  $scope.loadMore = function() {
    if ($scope.currentPage < $scope.totalPages) {
      $scope.currentPage++;
      $scope.refreshProducts();
    }
  };

  $scope.getPages = function() {
    var pages = [];
    for (var i = 1; i <= $scope.totalPages; i++) pages.push(i);
    return pages;
  };

  $scope.getDiscount = function(product) {
    if (!product.originalPrice) return 0;
    return Math.round((1 - product.price / product.originalPrice) * 100);
  };

  // Quick View Modal
  $scope.quickViewProduct = null;
  $scope.selectedSize = null;

  $scope.openQuickView = function(productId) {
    $scope.quickViewProduct = ProductService.getProductById(productId);
    if ($scope.quickViewProduct) {
      $scope.selectedSize = $scope.quickViewProduct.sizes[0];
    }
  };

  $scope.closeQuickView = function() {
    $scope.quickViewProduct = null;
  };

  $scope.selectSize = function(size) {
    $scope.selectedSize = size;
  };

  $scope.addToCartFromQuickView = function() {
    if ($scope.quickViewProduct) {
      var msg = CartService.addToCart($scope.quickViewProduct, $scope.selectedSize);
      ToastService.show(msg, 'success');
      $scope.closeQuickView();
    }
  };

  // Filter sidebar mobile toggle
  $scope.filterSidebarOpen = false;
  $scope.toggleFilterSidebar = function() {
    $scope.filterSidebarOpen = !$scope.filterSidebarOpen;
  };

  // Watch filters for auto-refresh
  $scope.$watch('filters.search', function(newVal, oldVal) {
    if (newVal !== oldVal) { $scope.currentPage = 1; $scope.refreshProducts(); }
  });
  $scope.$watch('filters.sort', function(newVal, oldVal) {
    if (newVal !== oldVal) { $scope.currentPage = 1; $scope.refreshProducts(); }
  });
  $scope.$watch('filters.priceMin', function(newVal, oldVal) {
    if (newVal !== oldVal) { $scope.currentPage = 1; $scope.refreshProducts(); }
  });
  $scope.$watch('filters.priceMax', function(newVal, oldVal) {
    if (newVal !== oldVal) { $scope.currentPage = 1; $scope.refreshProducts(); }
  });
  $scope.$watchCollection('filters.brands', function(newVal, oldVal) {
    if (newVal !== oldVal) { $scope.currentPage = 1; $scope.refreshProducts(); }
  });

  // Initial load with skeleton delay
  $timeout(function() {
    $scope.loading = false;
    $scope.refreshProducts();
  }, 600);
}]);

// =============================================
// CART PAGE CONTROLLER
// =============================================
app.controller('CartController', ['$scope', '$timeout', 'CartService', 'ProductService', 'ToastService', 'AuthService', 'PATHS',
function($scope, $timeout, CartService, ProductService, ToastService, AuthService, PATHS) {
  $scope.paths = PATHS;
  $scope.formatPrice = ProductService.formatPrice;
  $scope.cart = CartService.getCart();
  $scope.promoCode = '';

  $scope.refreshCart = function() {
    $scope.cart = CartService.getCart();
    var subtotal = CartService.getTotal();
    $scope.subtotal = subtotal;
    $scope.shipping = subtotal >= 8000 ? 0 : 499;
    $scope.tax = subtotal * 0.08;
    $scope.total = subtotal + $scope.shipping + $scope.tax;
    $scope.freeShippingRemaining = Math.max(0, 8000 - subtotal);
    $scope.freeShippingProgress = Math.min(100, (subtotal / 8000) * 100);
  };

  $scope.changeQty = function(item, delta) {
    var newQty = item.qty + delta;
    if (newQty <= 0) {
      $scope.removeItem(item);
      return;
    }
    CartService.updateQty(item.productId, item.size, newQty);
    $scope.refreshCart();
  };

  $scope.removeItem = function(item) {
    CartService.removeFromCart(item.productId, item.size);
    ToastService.show('Item removed from cart', 'info');
    $scope.refreshCart();
  };

  $scope.applyPromo = function() {
    ToastService.show('Promo code applied!', 'success');
  };

  $scope.proceedToCheckout = function() {
    var user = AuthService.getUser();
    if (!user) {
      ToastService.show('Please sign in to proceed to checkout', 'warning');
      setTimeout(function() { window.location.href = PATHS.HTML_PATH + 'login.html'; }, 1000);
      return;
    }
    if ($scope.cart.length === 0) {
      ToastService.show('Your cart is empty!', 'error');
      return;
    }
    window.location.href = PATHS.HTML_PATH + 'payment.html';
  };

  $scope.$on('cart:updated', function() { $scope.refreshCart(); });
  $scope.refreshCart();
}]);

// =============================================
// WISHLIST PAGE CONTROLLER
// =============================================
app.controller('WishlistController', ['$scope', '$timeout', 'WishlistService', 'ProductService', 'CartService', 'ToastService', 'PATHS',
function($scope, $timeout, WishlistService, ProductService, CartService, ToastService, PATHS) {
  $scope.paths = PATHS;
  $scope.formatPrice = ProductService.formatPrice;

  $scope.refreshWishlist = function() {
    var ids = WishlistService.getList();
    $scope.wishlistProducts = PRODUCTS.filter(function(p) { return ids.indexOf(p.id) >= 0; });
  };

  $scope.removeFromWishlist = function(productId, $event) {
    if ($event) $event.stopPropagation();
    WishlistService.toggle(productId);
    ToastService.show('Removed from wishlist', 'info');
    $scope.refreshWishlist();
  };

  $scope.addToCartFromWishlist = function(product, $event) {
    if ($event) $event.stopPropagation();
    var msg = CartService.addToCart(product, product.sizes[0]);
    ToastService.show(msg, 'success');
  };

  $scope.clearWishlist = function() {
    WishlistService.clearAll();
    $scope.refreshWishlist();
    ToastService.show('Wishlist cleared', 'info');
  };

  // Quick View Modal
  $scope.quickViewProduct = null;
  $scope.selectedSize = null;

  $scope.openQuickView = function(productId) {
    $scope.quickViewProduct = ProductService.getProductById(productId);
    if ($scope.quickViewProduct) {
      $scope.selectedSize = $scope.quickViewProduct.sizes[0];
    }
  };

  $scope.closeQuickView = function() {
    $scope.quickViewProduct = null;
  };

  $scope.$on('wishlist:updated', function() { $scope.refreshWishlist(); });
  $scope.refreshWishlist();
}]);

// =============================================
// REVIEWS PAGE CONTROLLER
// =============================================
app.controller('ReviewsController', ['$scope', 'ProductService', 'ToastService', 'PATHS',
function($scope, ProductService, ToastService, PATHS) {
  $scope.paths = PATHS;
  $scope.formatPrice = ProductService.formatPrice;
  $scope.renderStars = ProductService.renderStars;
  $scope.reviews = REVIEWS;
  $scope.currentFilter = 'all';
  $scope.showWriteForm = false;
  $scope.reviewRating = 0;
  $scope.newReview = { name: '', title: '', text: '' };

  // Rating distribution
  $scope.getRatingDistribution = function() {
    var counts = [0, 0, 0, 0, 0];
    REVIEWS.forEach(function(r) { counts[r.rating - 1]++; });
    var total = REVIEWS.length;
    return [5, 4, 3, 2, 1].map(function(star) {
      return { star: star, count: counts[star - 1], pct: total ? (counts[star - 1] / total * 100) : 0 };
    });
  };

  $scope.getOverallRating = function() {
    var total = REVIEWS.length;
    if (!total) return 0;
    return (REVIEWS.reduce(function(s, r) { return s + r.rating; }, 0) / total).toFixed(1);
  };

  $scope.getFilteredReviews = function() {
    if ($scope.currentFilter === 'all') return REVIEWS;
    return REVIEWS.filter(function(r) { return r.rating === $scope.currentFilter; });
  };

  $scope.filterReviews = function(rating) {
    $scope.currentFilter = rating;
  };

  $scope.getProductForReview = function(review) {
    return PRODUCTS.find(function(p) { return p.id === review.productId; });
  };

  $scope.toggleWriteForm = function() {
    $scope.showWriteForm = !$scope.showWriteForm;
  };

  $scope.setReviewRating = function(rating) {
    $scope.reviewRating = rating;
  };

  $scope.submitReview = function() {
    if ($scope.reviewRating === 0) {
      ToastService.show('Please select a rating', 'error');
      return;
    }
    if (!$scope.newReview.name || !$scope.newReview.title || !$scope.newReview.text) {
      ToastService.show('Please fill in all fields', 'error');
      return;
    }

    REVIEWS.unshift({
      id: REVIEWS.length + 1,
      name: $scope.newReview.name,
      avatar: $scope.newReview.name.split(' ').map(function(n) { return n[0]; }).join('').toUpperCase(),
      rating: $scope.reviewRating,
      date: new Date().toISOString().split('T')[0],
      title: $scope.newReview.title,
      text: $scope.newReview.text,
      productId: null,
      verified: false
    });

    ToastService.show('Thank you for your review! ⭐', 'success');
    $scope.newReview = { name: '', title: '', text: '' };
    $scope.reviewRating = 0;
    $scope.showWriteForm = false;
  };

  $scope.markHelpful = function(review) {
    review.helpfulCount = (review.helpfulCount || 0) + 1;
    review.markedHelpful = true;
  };

  $scope.reportReview = function() {
    ToastService.show('Review reported', 'info');
  };
}]);

// =============================================
// LOGIN CONTROLLER
// =============================================
app.controller('LoginController', ['$scope', '$timeout', 'AuthService', 'ToastService', 'VALIDATORS', 'PATHS',
function($scope, $timeout, AuthService, ToastService, VALIDATORS, PATHS) {
  $scope.login = { email: '', password: '', remember: false };
  $scope.loginErrors = {};
  $scope.loginSubmitting = false;

  $scope.validateLoginField = function(field) {
    if (field === 'email') {
      if (!$scope.login.email) { $scope.loginErrors.email = 'This field is required'; return false; }
      if (!VALIDATORS.email.regex.test($scope.login.email)) { $scope.loginErrors.email = VALIDATORS.email.message; return false; }
      $scope.loginErrors.email = '';
      return true;
    }
    if (field === 'password') {
      if (!$scope.login.password) { $scope.loginErrors.password = 'Password is required'; return false; }
      $scope.loginErrors.password = '';
      return true;
    }
  };

  $scope.clearError = function(field) {
    $scope.loginErrors[field] = '';
  };

  $scope.submitLogin = function() {
    var emailValid = $scope.validateLoginField('email');
    var passValid = $scope.validateLoginField('password');

    if (emailValid && passValid) {
      $scope.loginSubmitting = true;
      $timeout(function() {
        var user = {
          name: $scope.login.email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); }),
          email: $scope.login.email,
          phone: '+91 98765 43210',
          joinDate: new Date().toISOString().split('T')[0]
        };
        AuthService.saveUser(user);
        ToastService.show('Welcome back! Redirecting...', 'success');
        $timeout(function() { window.location.href = PATHS.HTML_PATH + 'account.html'; }, 1000);
      }, 1500);
    }
  };

  $scope.socialLogin = function() {
    ToastService.show('Social login coming soon!', 'info');
  };
}]);

// =============================================
// SIGNUP CONTROLLER
// =============================================
app.controller('SignupController', ['$scope', '$timeout', 'AuthService', 'ToastService', 'VALIDATORS', 'PATHS',
function($scope, $timeout, AuthService, ToastService, VALIDATORS, PATHS) {
  $scope.signup = { name: '', email: '', phone: '', password: '', confirmPassword: '', terms: false };
  $scope.signupErrors = {};
  $scope.signupSubmitting = false;
  $scope.passwordStrength = { width: '0%', color: 'bg-gray-700', text: '' };

  $scope.validateSignupField = function(field) {
    var val = $scope.signup[field] || '';
    if (field === 'confirmPassword') {
      if (val !== $scope.signup.password) {
        $scope.signupErrors.confirmPassword = 'Passwords do not match';
        return false;
      }
      if (val) { $scope.signupErrors.confirmPassword = ''; return true; }
      return false;
    }
    var validator = VALIDATORS[field];
    if (!val.trim()) { $scope.signupErrors[field] = 'This field is required'; return false; }
    if (validator && !validator.regex.test(val)) { $scope.signupErrors[field] = validator.message; return false; }
    $scope.signupErrors[field] = '';
    return true;
  };

  $scope.clearSignupError = function(field) {
    $scope.signupErrors[field] = '';
  };

  $scope.updatePasswordStrength = function() {
    var password = $scope.signup.password || '';
    var strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&#]/.test(password)) strength++;

    var levels = [
      { width: '0%', color: 'bg-gray-700', text: '' },
      { width: '25%', color: 'bg-red-500', text: 'Weak' },
      { width: '50%', color: 'bg-amber-500', text: 'Fair' },
      { width: '75%', color: 'bg-blue-500', text: 'Good' },
      { width: '100%', color: 'bg-green-500', text: 'Strong' }
    ];
    $scope.passwordStrength = levels[strength];
  };

  $scope.submitSignup = function() {
    var nameValid = $scope.validateSignupField('name');
    var emailValid = $scope.validateSignupField('email');
    var phoneValid = $scope.validateSignupField('phone');
    var passwordValid = $scope.validateSignupField('password');
    var confirmValid = $scope.validateSignupField('confirmPassword');

    if (nameValid && emailValid && phoneValid && passwordValid && confirmValid) {
      $scope.signupSubmitting = true;
      $timeout(function() {
        var user = {
          name: $scope.signup.name.trim(),
          email: $scope.signup.email.trim(),
          phone: $scope.signup.phone.trim(),
          joinDate: new Date().toISOString().split('T')[0]
        };
        AuthService.saveUser(user);
        ToastService.show('Account created successfully!', 'success');
        $timeout(function() { window.location.href = PATHS.HTML_PATH + 'account.html'; }, 1000);
      }, 1500);
    }
  };
}]);

// =============================================
// CONTACT CONTROLLER
// =============================================
app.controller('ContactController', ['$scope', '$timeout', 'ToastService', 'VALIDATORS',
function($scope, $timeout, ToastService, VALIDATORS) {
  $scope.contact = { name: '', email: '', subject: '', orderId: '', message: '' };
  $scope.contactErrors = {};
  $scope.contactSubmitting = false;
  $scope.contactSuccess = false;

  $scope.subjects = [
    { value: '', label: 'Select a subject...' },
    { value: 'order', label: 'Order Inquiry' },
    { value: 'return', label: 'Returns & Exchanges' },
    { value: 'product', label: 'Product Question' },
    { value: 'shipping', label: 'Shipping Information' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'other', label: 'Other' }
  ];

  $scope.clearContactError = function(field) {
    $scope.contactErrors[field] = '';
  };

  $scope.submitContact = function() {
    var valid = true;

    if (!$scope.contact.name.trim() || !/^[a-zA-Z\s]{2,}$/.test($scope.contact.name.trim())) {
      $scope.contactErrors.name = 'Please enter your name';
      valid = false;
    } else { $scope.contactErrors.name = ''; }

    if (!$scope.contact.email || !VALIDATORS.email.regex.test($scope.contact.email)) {
      $scope.contactErrors.email = VALIDATORS.email.message;
      valid = false;
    } else { $scope.contactErrors.email = ''; }

    if (!$scope.contact.subject) {
      $scope.contactErrors.subject = 'Please select a subject';
      valid = false;
    } else { $scope.contactErrors.subject = ''; }

    if (!$scope.contact.message.trim() || $scope.contact.message.trim().length < 10) {
      $scope.contactErrors.message = 'Message must be at least 10 characters';
      valid = false;
    } else { $scope.contactErrors.message = ''; }

    if (valid) {
      $scope.contactSubmitting = true;
      $timeout(function() {
        $scope.contactSubmitting = false;
        $scope.contactSuccess = true;
        ToastService.show("Message sent! We'll get back to you soon.", 'success');
        $scope.contact = { name: '', email: '', subject: '', orderId: '', message: '' };
        $timeout(function() { $scope.contactSuccess = false; }, 3000);
      }, 1500);
    }
  };
}]);

// =============================================
// ACCOUNT CONTROLLER
// =============================================
app.controller('AccountController', ['$scope', 'AuthService', 'ToastService', 'ProductService', 'PATHS',
function($scope, AuthService, ToastService, ProductService, PATHS) {
  $scope.paths = PATHS;
  $scope.formatPrice = ProductService.formatPrice;
  $scope.user = AuthService.getUser();
  $scope.recentOrders = DUMMY_ORDERS.slice(0, 3);

  if (!$scope.user) {
    ToastService.show('Please sign in to view your account', 'warning');
    setTimeout(function() { window.location.href = PATHS.HTML_PATH + 'login.html'; }, 1000);
  }

  $scope.getUserInitials = function() {
    if (!$scope.user) return '';
    return $scope.user.name.split(' ').map(function(n) { return n[0]; }).join('');
  };

  $scope.editProfile = function() {
    ToastService.show('Profile editor coming soon!', 'info');
  };

  $scope.logout = function() {
    AuthService.logout();
    ToastService.show('Logged out successfully', 'info');
    setTimeout(function() { window.location.href = PATHS.ROOT_PATH + 'index.html'; }, 800);
  };
}]);

// =============================================
// ORDERS CONTROLLER
// =============================================
app.controller('OrdersController', ['$scope', 'ProductService', 'PATHS',
function($scope, ProductService, PATHS) {
  $scope.paths = PATHS;
  $scope.formatPrice = ProductService.formatPrice;
  $scope.orders = DUMMY_ORDERS;

  $scope.stats = {
    total: DUMMY_ORDERS.length,
    delivered: DUMMY_ORDERS.filter(function(o) { return o.status === 'Delivered'; }).length,
    active: DUMMY_ORDERS.filter(function(o) { return o.status === 'Processing' || o.status === 'Shipped'; }).length,
    cancelled: DUMMY_ORDERS.filter(function(o) { return o.status === 'Cancelled'; }).length
  };
}]);

// =============================================
// PAYMENT CONTROLLER
// =============================================
app.controller('PaymentController', ['$scope', '$timeout', 'CartService', 'ProductService', 'AuthService', 'ToastService', 'PATHS',
function($scope, $timeout, CartService, ProductService, AuthService, ToastService, PATHS) {
  $scope.paths = PATHS;
  $scope.formatPrice = ProductService.formatPrice;
  $scope.cart = CartService.getCart();
  $scope.paymentErrors = {};
  $scope.processing = false;
  $scope.paymentSuccess = false;

  // Card form
  $scope.card = { number: '', name: '', expiry: '', cvv: '' };
  $scope.billing = { address: '', city: '', zip: '' };

  // Preview
  $scope.previewNumber = '•••• •••• •••• ••••';
  $scope.previewName = 'YOUR NAME';
  $scope.previewExpiry = 'MM/YY';
  $scope.cardType = '💳';

  // Cart summary
  var subtotal = CartService.getTotal();
  $scope.subtotal = subtotal;
  $scope.shipping = subtotal >= 8000 ? 0 : 499;
  $scope.tax = subtotal * 0.08;
  $scope.total = subtotal + $scope.shipping + $scope.tax;

  if ($scope.cart.length === 0) {
    window.location.href = PATHS.HTML_PATH + 'cart.html';
  }

  $scope.onCardNumberInput = function() {
    var value = ($scope.card.number || '').replace(/\D/g, '');
    value = value.replace(/(.{4})/g, '$1 ').trim();
    $scope.card.number = value.substring(0, 19);
    $scope.previewNumber = value || '•••• •••• •••• ••••';
    var num = value.replace(/\s/g, '');
    if (/^4/.test(num)) $scope.cardType = '💳 Visa';
    else if (/^5[1-5]/.test(num)) $scope.cardType = '💳 Mastercard';
    else if (/^3[47]/.test(num)) $scope.cardType = '💳 Amex';
    else $scope.cardType = '💳';
  };

  $scope.onCardNameInput = function() {
    $scope.previewName = ($scope.card.name || '').toUpperCase() || 'YOUR NAME';
  };

  $scope.onCardExpiryInput = function() {
    var value = ($scope.card.expiry || '').replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    $scope.card.expiry = value;
    $scope.previewExpiry = value || 'MM/YY';
  };

  $scope.clearPaymentError = function(field) {
    $scope.paymentErrors[field] = '';
  };

  $scope.submitPayment = function() {
    var valid = true;

    var cardNum = ($scope.card.number || '').replace(/\s/g, '');
    if (!/^\d{16}$/.test(cardNum)) { $scope.paymentErrors.number = 'Enter a valid 16-digit card number'; valid = false; }
    else { $scope.paymentErrors.number = ''; }

    if (!/^[a-zA-Z\s]{2,}$/.test(($scope.card.name || '').trim())) { $scope.paymentErrors.name = 'Enter the cardholder name'; valid = false; }
    else { $scope.paymentErrors.name = ''; }

    var expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test($scope.card.expiry)) { $scope.paymentErrors.expiry = 'Enter a valid expiry date (MM/YY)'; valid = false; }
    else {
      var parts = $scope.card.expiry.split('/');
      var expiry = new Date(2000 + parseInt(parts[1]), parseInt(parts[0]));
      if (expiry < new Date()) { $scope.paymentErrors.expiry = 'Card has expired'; valid = false; }
      else { $scope.paymentErrors.expiry = ''; }
    }

    if (!/^\d{3,4}$/.test($scope.card.cvv)) { $scope.paymentErrors.cvv = 'Enter a valid CVV (3-4 digits)'; valid = false; }
    else { $scope.paymentErrors.cvv = ''; }

    if (!($scope.billing.address || '').trim()) { $scope.paymentErrors.address = 'Enter your billing address'; valid = false; }
    else { $scope.paymentErrors.address = ''; }

    if (!($scope.billing.city || '').trim()) { $scope.paymentErrors.city = 'Enter your city'; valid = false; }
    else { $scope.paymentErrors.city = ''; }

    if (!/^\d{5,6}$/.test(($scope.billing.zip || '').trim())) { $scope.paymentErrors.zip = 'Enter a valid PIN code'; valid = false; }
    else { $scope.paymentErrors.zip = ''; }

    if (valid) {
      $scope.processing = true;
      $timeout(function() {
        var cart = CartService.getCart();
        var orderId = 'ORD-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000);
        sessionStorage.setItem('stride_last_order', JSON.stringify({ orderId: orderId, items: cart }));
        $scope.paymentSuccess = true;
        CartService.clearCart();
        ToastService.show('Order placed successfully! 🎉', 'success');
        $timeout(function() { window.location.href = 'order-confirmation.html'; }, 1200);
      }, 2500);
    }
  };
}]);

// =============================================
// ORDER CONFIRMATION CONTROLLER
// =============================================
app.controller('OrderConfirmationController', ['$scope', '$timeout', 'ProductService', 'PATHS',
function($scope, $timeout, ProductService, PATHS) {
  $scope.paths = PATHS;
  $scope.formatPrice = ProductService.formatPrice;

  var orderData = JSON.parse(sessionStorage.getItem('stride_last_order') || 'null');
  var today = new Date();
  var deliveryDate = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);

  $scope.orderId = (orderData && orderData.orderId) || ('ORD-2026-' + String(Math.floor(Math.random() * 9000) + 1000));
  $scope.orderDate = today.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  $scope.deliveryDate = deliveryDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  if (orderData && orderData.items) {
    $scope.items = orderData.items;
    var subtotal = orderData.items.reduce(function(s, i) { return s + i.price * i.qty; }, 0);
    $scope.subtotal = subtotal;
    $scope.shipping = subtotal >= 8000 ? 0 : 499;
    $scope.tax = subtotal * 0.08;
    $scope.total = subtotal + $scope.shipping + $scope.tax;
  } else {
    var order = DUMMY_ORDERS[0];
    $scope.orderId = order.id;
    $scope.items = order.items;
    $scope.subtotal = order.subtotal;
    $scope.shipping = order.shipping;
    $scope.tax = order.tax;
    $scope.total = order.total;
  }

  // Confetti
  $scope.confettiPieces = [];
  var colors = ['#f59e0b', '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#ec4899'];
  for (var i = 0; i < 20; i++) {
    $scope.confettiPieces.push({
      background: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100 + '%',
      animationDelay: Math.random() * 0.5 + 's',
      animationDuration: (1 + Math.random()) + 's'
    });
  }
}]);

// =============================================
// CUSTOM DIRECTIVES
// =============================================

// Star rating display directive
app.directive('strideStars', function() {
  return {
    restrict: 'E',
    scope: { rating: '=' },
    template: '<span ng-repeat="i in [1,2,3,4,5]" class="star" ng-class="{filled: i <= rating}">★</span>'
  };
});

// Price range slider directive  
app.directive('priceRangeSlider', function() {
  return {
    restrict: 'A',
    link: function(scope, element) {
      scope.$watchGroup(['filters.priceMin', 'filters.priceMax'], function() {
        var fill = element[0].querySelector('.range-fill');
        var minInput = element[0].querySelector('.range-min');
        var maxInput = element[0].querySelector('.range-max');
        if (!fill || !minInput || !maxInput) return;
        var min = parseInt(minInput.min);
        var max = parseInt(minInput.max);
        var left = ((scope.filters.priceMin - min) / (max - min)) * 100;
        var right = 100 - ((scope.filters.priceMax - min) / (max - min)) * 100;
        fill.style.left = left + '%';
        fill.style.right = right + '%';
      });
    }
  };
});
