/* ============================================
   STRIDE — Products Page Logic
   Advanced Filtering, Search, Sort, Pagination,
   Skeleton Loading, Wishlist, Image Zoom
   ============================================ */

// === Filter State ===
let filters = {
  category: 'all',
  priceMin: 0,
  priceMax: 20000,
  brands: [],
  minRating: 0,
  search: '',
  sort: 'featured',
  styleFilter: 'all'
};

let currentPage = 1;
const PER_PAGE = 8;

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const urlCat = params.get('category');
  const urlStyle = params.get('style');
  if (urlCat && ['men', 'women', 'kids'].includes(urlCat)) filters.category = urlCat;
  if (urlStyle && ['traditional', 'fusion', 'modern'].includes(urlStyle)) filters.styleFilter = urlStyle;

  // Set breadcrumbs
  const catNames = { men: "Men's", women: "Women's", kids: "Kids'" };
  if (typeof setBreadcrumbs === 'function') {
    if (filters.styleFilter !== 'all') {
      const styleNames = { traditional: '🇮🇳 Indian Collection', fusion: 'Fusion', modern: 'Modern' };
      setBreadcrumbs([{ label: 'Shop', href: 'products.html' }, { label: styleNames[filters.styleFilter] }]);
    } else if (filters.category !== 'all') {
      setBreadcrumbs([{ label: 'Shop', href: 'products.html' }, { label: catNames[filters.category] }]);
    } else {
      setBreadcrumbs([{ label: 'Shop' }]);
    }
  }

  // Show skeleton, then render
  const grid = document.getElementById('products-grid');
  if (grid) grid.innerHTML = renderSkeletonCards(PER_PAGE);

  setTimeout(() => {
    renderFilterSidebar();
    renderCategoryPills();
    renderProducts();
    setupEventListeners();
  }, 600);
});

// === Get Filtered Products ===
function getFilteredProducts() {
  let result = [...PRODUCTS];

  // Category
  if (filters.category !== 'all') {
    result = result.filter(p => p.category === filters.category);
  }

  // Price range
  result = result.filter(p => p.price >= filters.priceMin && p.price <= filters.priceMax);

  // Brands
  if (filters.brands.length > 0) {
    result = result.filter(p => filters.brands.includes(p.brand));
  }

  // Rating
  if (filters.minRating > 0) {
    result = result.filter(p => p.rating >= filters.minRating);
  }

  // Style (Traditional / Fusion / Modern)
  if (filters.styleFilter !== 'all') {
    if (filters.styleFilter === 'traditional') {
      result = result.filter(p => p.style === 'traditional' || p.style === 'fusion');
    } else {
      result = result.filter(p => p.style === filters.styleFilter);
    }
  }

  // Search
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  // Sort
  switch (filters.sort) {
    case 'price-low': result.sort((a, b) => a.price - b.price); break;
    case 'price-high': result.sort((a, b) => b.price - a.price); break;
    case 'rating': result.sort((a, b) => b.rating - a.rating); break;
    case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'popularity': result.sort((a, b) => b.popularity - a.popularity); break;
    default: break; // featured = natural order
  }

  return result;
}

// === Render Filter Sidebar ===
function renderFilterSidebar() {
  const sidebar = document.getElementById('filter-sidebar');
  if (!sidebar) return;

  const prices = PRODUCTS.map(p => p.price);
  const minP = Math.floor(Math.min(...prices));
  const maxP = Math.ceil(Math.max(...prices));

  sidebar.innerHTML = `
    <div class="flex justify-between items-center mb-6 lg:hidden">
      <h2 class="text-lg font-bold text-white">Filters</h2>
      <button onclick="toggleFilterSidebar()" class="text-gray-400 hover:text-white text-xl">&times;</button>
    </div>

    <!-- Price Range -->
    <div class="filter-section">
      <h3>💰 Price Range</h3>
      <div class="flex justify-between text-sm mb-2">
        <span class="text-gray-400">₹<span id="price-min-display">${filters.priceMin}</span></span>
        <span class="text-gray-400">₹<span id="price-max-display">${filters.priceMax}</span></span>
      </div>
      <div class="range-slider-container">
        <div class="range-track">
          <div class="range-fill" id="range-fill"></div>
        </div>
        <input type="range" min="${minP}" max="${maxP}" value="${filters.priceMin}" id="price-min-slider" oninput="updatePriceRange()">
        <input type="range" min="${minP}" max="${maxP}" value="${filters.priceMax}" id="price-max-slider" oninput="updatePriceRange()">
      </div>
    </div>

    <!-- Brand -->
    <div class="filter-section">
      <h3>🏷️ Brand</h3>
      <div class="space-y-1">
        ${BRANDS.map(brand => {
          const count = PRODUCTS.filter(p => p.brand === brand).length;
          return `
            <label class="filter-checkbox">
              <input type="checkbox" value="${brand}" ${filters.brands.includes(brand) ? 'checked' : ''} onchange="updateBrandFilter()">
              <span class="check-box"></span>
              <span class="flex-1">${brand}</span>
              <span class="text-xs text-gray-500">(${count})</span>
            </label>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Rating -->
    <div class="filter-section">
      <h3>⭐ Minimum Rating</h3>
      <div class="space-y-1">
        ${[4, 3, 2, 1].map(rating => `
          <div class="star-filter-row ${filters.minRating === rating ? 'active' : ''}" onclick="setRatingFilter(${rating})">
            ${renderStars(rating)}
            <span class="text-xs ml-1">${rating}+</span>
          </div>
        `).join('')}
        <div class="star-filter-row ${filters.minRating === 0 ? 'active' : ''}" onclick="setRatingFilter(0)">
          <span class="text-sm">All Ratings</span>
        </div>
      </div>
    </div>

    <!-- Active Filters Count + Clear -->
    <div id="active-filters-section"></div>
  `;

  updatePriceRangeFill();
  updateActiveFiltersDisplay();
}

// === Price Range Slider ===
function updatePriceRange() {
  const minSlider = document.getElementById('price-min-slider');
  const maxSlider = document.getElementById('price-max-slider');

  let minVal = parseInt(minSlider.value);
  let maxVal = parseInt(maxSlider.value);

  // Prevent crossover
  if (minVal > maxVal - 10) {
    minSlider.value = maxVal - 10;
    minVal = maxVal - 10;
  }

  filters.priceMin = minVal;
  filters.priceMax = maxVal;

  document.getElementById('price-min-display').textContent = minVal;
  document.getElementById('price-max-display').textContent = maxVal;
  updatePriceRangeFill();

  currentPage = 1;
  renderProducts();
}

function updatePriceRangeFill() {
  const fill = document.getElementById('range-fill');
  const minSlider = document.getElementById('price-min-slider');
  const maxSlider = document.getElementById('price-max-slider');
  if (!fill || !minSlider || !maxSlider) return;

  const min = parseInt(minSlider.min);
  const max = parseInt(minSlider.max);
  const left = ((parseInt(minSlider.value) - min) / (max - min)) * 100;
  const right = 100 - ((parseInt(maxSlider.value) - min) / (max - min)) * 100;
  fill.style.left = left + '%';
  fill.style.right = right + '%';
}

// === Brand Filter ===
function updateBrandFilter() {
  filters.brands = [...document.querySelectorAll('.filter-checkbox input:checked')].map(cb => cb.value);
  currentPage = 1;
  renderProducts();
  updateActiveFiltersDisplay();
}

// === Rating Filter ===
function setRatingFilter(rating) {
  filters.minRating = rating;
  document.querySelectorAll('.star-filter-row').forEach(row => row.classList.remove('active'));
  event.currentTarget.classList.add('active');
  currentPage = 1;
  renderProducts();
  updateActiveFiltersDisplay();
}

// === Clear All Filters ===
function clearAllFilters() {
  filters = { category: 'all', priceMin: 0, priceMax: 20000, brands: [], minRating: 0, search: '', sort: 'featured', styleFilter: 'all' };
  currentPage = 1;

  const searchInput = document.getElementById('product-search');
  if (searchInput) searchInput.value = '';
  const sortSelect = document.getElementById('product-sort');
  if (sortSelect) sortSelect.value = 'featured';

  renderFilterSidebar();
  renderCategoryPills();
  renderProducts();
  showToast('All filters cleared', 'info');
}

function updateActiveFiltersDisplay() {
  const section = document.getElementById('active-filters-section');
  if (!section) return;

  let count = 0;
  if (filters.brands.length > 0) count++;
  if (filters.minRating > 0) count++;
  if (filters.priceMin > 0 || filters.priceMax < 20000) count++;
  if (filters.category !== 'all') count++;

  section.innerHTML = count > 0
    ? `<button class="clear-filters-btn" onclick="clearAllFilters()">✕ Clear All Filters (${count})</button>`
    : '';
}

// === Category Pills ===
function renderCategoryPills() {
  const container = document.getElementById('category-pills');
  if (!container) return;

  const cats = [
    { key: 'all', label: '🔥 All Products' },
    { key: 'men', label: '👟 Men\'s' },
    { key: 'women', label: '👠 Women\'s' },
    { key: 'kids', label: '👶 Kids\'' }
  ];

  container.innerHTML = cats.map(c =>
    `<button onclick="setCategory('${c.key}')" class="category-pill ${filters.category === c.key && filters.styleFilter === 'all' ? 'active' : ''}" id="cat-pill-${c.key}">${c.label}</button>`
  ).join('') + `<button onclick="setStyleFilter('traditional')" class="category-pill ${filters.styleFilter === 'traditional' ? 'active' : ''}" id="cat-pill-indian">🇮🇳 Indian</button>`;
}

function setCategory(cat) {
  filters.category = cat;
  filters.styleFilter = 'all';
  currentPage = 1;
  renderCategoryPills();
  renderProducts();
  updateActiveFiltersDisplay();

  // Update breadcrumbs
  const catNames = { men: "Men's", women: "Women's", kids: "Kids'" };
  if (typeof setBreadcrumbs === 'function') {
    setBreadcrumbs(
      cat !== 'all'
        ? [{ label: 'Shop', href: 'products.html' }, { label: catNames[cat] }]
        : [{ label: 'Shop' }]
    );
  }
}

function setStyleFilter(style) {
  filters.styleFilter = style;
  filters.category = 'all';
  currentPage = 1;
  renderCategoryPills();
  renderProducts();
  updateActiveFiltersDisplay();

  if (typeof setBreadcrumbs === 'function') {
    const styleNames = { traditional: '🇮🇳 Indian Collection', fusion: 'Fusion', modern: 'Modern' };
    setBreadcrumbs([{ label: 'Shop', href: 'products.html' }, { label: styleNames[style] || style }]);
  }
}

// === Render Products Grid ===
function renderProducts() {
  const grid = document.getElementById('products-grid');
  const countEl = document.getElementById('product-count');
  if (!grid) return;

  const filtered = getFilteredProducts();
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice(0, currentPage * PER_PAGE);

  if (countEl) countEl.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-20 animate-fade-in">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-semibold text-white mb-2">No products found</h3>
        <p class="text-gray-400 mb-6">Try adjusting your filters or search terms.</p>
        <button onclick="clearAllFilters()" class="btn-primary px-6 py-2.5">Clear Filters</button>
      </div>
    `;
    renderPagination(0, 0);
    return;
  }

  grid.innerHTML = paginated.map((product, i) => {
    const wishlisted = isInWishlist(product.id);
    const discount = product.originalPrice
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

    return `
      <div class="product-card animate-fade-in-up" onclick="window.location.href='product-detail.html?id=${product.id}'" style="cursor: pointer; animation-delay: ${Math.min(i * 0.05, 0.4)}s">
        <div class="product-img relative h-56 bg-gradient-to-br from-gray-900 to-gray-800">
          ${product.badge ? `<div class="product-badge">${product.badge.toUpperCase()}</div>` : ''}
          <button class="wishlist-btn ${wishlisted ? 'active' : ''}" data-id="${product.id}" onclick="event.stopPropagation(); toggleWishlist(${product.id})">
            ${wishlisted ? '❤️' : '🤍'}
          </button>
          <img src="${IMG_PATH}${product.image}" alt="${product.name}" class="w-full h-full object-contain p-6" loading="lazy">
          <div class="zoom-lens" onclick="event.stopPropagation(); openQuickView(${product.id})">
            <span class="text-white/50 text-xs font-medium tracking-wider">QUICK VIEW</span>
          </div>
          <div class="overlay"></div>
        </div>
        <div class="p-5">
          <div class="flex items-center justify-between mb-1">
            <p class="text-xs text-amber-400/70 font-medium uppercase tracking-wider">${product.subcategory}</p>
            <div class="flex items-center gap-1">
              <span class="star filled text-xs">★</span>
              <span class="text-xs text-gray-400">${product.rating}</span>
            </div>
          </div>
          <h3 class="font-semibold text-white">${product.name}</h3>
          <p class="text-xs text-gray-500 mt-1">${product.brand}</p>
          <p class="text-gray-400 text-xs mt-2 line-clamp-2 leading-relaxed">${product.description}</p>
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <div class="flex items-baseline gap-2">
              <span class="text-lg font-bold text-white">${formatPrice(product.price)}</span>
              ${product.originalPrice ? `<span class="text-sm text-gray-500 line-through">${formatPrice(product.originalPrice)}</span>` : ''}
              ${discount > 0 ? `<span class="text-xs text-green-400 font-semibold">${discount}% OFF</span>` : ''}
            </div>
            <button onclick="event.stopPropagation(); quickAddToCart(${product.id})" class="btn-secondary text-xs px-3 py-1.5">+ Add</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  renderPagination(filtered.length, totalPages);
}

// === Pagination ===
function renderPagination(total, totalPages) {
  let container = document.getElementById('pagination-container');
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  const hasMore = currentPage < totalPages;
  const showing = Math.min(currentPage * PER_PAGE, total);

  container.innerHTML = `
    <div class="text-center text-sm text-gray-400 mb-4">
      Showing ${showing} of ${total} products
    </div>
    <div class="pagination">
      <button class="page-btn" ${currentPage <= 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">←</button>
      ${Array.from({ length: totalPages }, (_, i) => {
        const page = i + 1;
        // Show at most 5 page numbers around current
        if (totalPages > 7 && (page > currentPage + 2 || page < currentPage - 2) && page !== 1 && page !== totalPages) {
          if (page === currentPage - 3 || page === currentPage + 3) return `<span class="text-gray-500 px-1">…</span>`;
          return '';
        }
        return `<button class="page-btn ${page === currentPage ? 'active' : ''}" onclick="goToPage(${page})">${page}</button>`;
      }).join('')}
      <button class="page-btn" ${currentPage >= totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">→</button>
    </div>
    ${hasMore ? `<button class="load-more-btn" onclick="loadMore()">Load More Products ↓</button>` : ''}
  `;
}

function goToPage(page) {
  currentPage = page;
  renderProducts();
  window.scrollTo({ top: 300, behavior: 'smooth' });
}

function loadMore() {
  const filtered = getFilteredProducts();
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  if (currentPage < totalPages) {
    currentPage++;
    renderProducts();
  }
}

// === Quick View Modal ===
function openQuickView(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('quick-view-modal');
  if (!modal) return;

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const wishlisted = isInWishlist(product.id);

  modal.innerHTML = `
    <div class="modal-content max-w-lg">
      <div class="flex justify-between items-start mb-4">
        <div>
          <p class="text-amber-400 text-xs font-semibold uppercase tracking-wider">${product.subcategory}</p>
          <h2 class="text-xl font-bold text-white mt-1">${product.name}</h2>
          <p class="text-sm text-gray-500">${product.brand}</p>
        </div>
        <button onclick="closeQuickView()" class="text-gray-400 hover:text-white text-xl transition-colors">&times;</button>
      </div>

      <div class="relative h-64 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 mb-4 overflow-hidden group">
        <img src="${IMG_PATH}${product.image}" alt="${product.name}" class="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-110">
      </div>

      <p class="text-gray-400 text-sm leading-relaxed mb-4">${product.description}</p>

      <div class="flex items-center gap-2 mb-4">
        ${renderStars(product.rating)}
        <span class="text-sm text-gray-400">(${product.reviewCount} reviews)</span>
      </div>

      <div class="flex items-baseline gap-3 mb-5">
        <span class="text-2xl font-bold text-white">${formatPrice(product.price)}</span>
        ${product.originalPrice ? `<span class="text-base text-gray-500 line-through">${formatPrice(product.originalPrice)}</span>` : ''}
        ${discount > 0 ? `<span class="text-sm text-green-400 font-semibold">${discount}% OFF</span>` : ''}
      </div>

      <div class="mb-5">
        <p class="text-sm font-medium text-white mb-2">Size</p>
        <div class="flex flex-wrap gap-2" id="qv-sizes">
          ${product.sizes.map((s, i) => `
            <button onclick="selectQVSize(this, ${s})" class="w-11 h-11 rounded-lg border text-sm font-medium transition-all ${i === 0 ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-white/10 text-gray-400 hover:border-white/30'}">${s}</button>
          `).join('')}
        </div>
      </div>

      <div class="flex gap-3">
        <button onclick="addToCart(${product.id}, selectedQVSize || ${product.sizes[0]}); closeQuickView();" class="btn-primary flex-1 py-3">
          🛒 Add to Cart — ${formatPrice(product.price)}
        </button>
        <button onclick="toggleWishlist(${product.id})" class="btn-secondary px-4 py-3 ${wishlisted ? 'text-red-400' : ''}">
          ${wishlisted ? '❤️' : '🤍'}
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  modal.onclick = (e) => { if (e.target === modal) closeQuickView(); };
  window.selectedQVSize = product.sizes[0];
}

function closeQuickView() {
  document.getElementById('quick-view-modal')?.classList.remove('active');
}

function selectQVSize(btn, size) {
  document.querySelectorAll('#qv-sizes button').forEach(b => {
    b.classList.remove('border-amber-500', 'text-amber-400', 'bg-amber-500/10');
    b.classList.add('border-white/10', 'text-gray-400');
  });
  btn.classList.add('border-amber-500', 'text-amber-400', 'bg-amber-500/10');
  btn.classList.remove('border-white/10', 'text-gray-400');
  window.selectedQVSize = size;
}

// === Quick Add to Cart ===
function quickAddToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (product) addToCart(productId, product.sizes[0]);
}

// === Event Listeners ===
function setupEventListeners() {
  // Live search (keyup)
  const searchInput = document.getElementById('product-search');
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      filters.search = e.target.value;
      currentPage = 1;
      renderProducts();
    });
  }

  // Sort
  const sortSelect = document.getElementById('product-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      filters.sort = e.target.value;
      currentPage = 1;
      renderProducts();
    });
  }
}

// === Mobile Filter Sidebar Toggle ===
function toggleFilterSidebar() {
  document.getElementById('filter-sidebar')?.classList.toggle('open');
  document.getElementById('filter-backdrop')?.classList.toggle('open');
}
