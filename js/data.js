/* ============================================
   STRIDE — Product, Order & Review Data
   Indian Localized Edition
   ============================================ */

var PRODUCTS = [];

// === Indian Reviewer Names ===
var REVIEWS = [];

const DUMMY_ORDERS = [
  {
    id: "ORD-2026-001", date: "2026-03-20", status: "Delivered", deliveryDate: "2026-03-25",
    items: [
      { productId: 1, name: "Velocity Runner", size: 10, qty: 1, price: 12499, image: "shoe-sport.png" }
    ],
    subtotal: 12499, shipping: 0, tax: 1000, total: 13499
  },
  {
    id: "ORD-2026-002", date: "2026-03-15", status: "Shipped", deliveryDate: "2026-03-28",
    items: [
      { productId: 9, name: "Embroidered Jutti", size: 6, qty: 1, price: 2999, image: "shoe-classic.png" },
      { productId: 7, name: "Cloud Walker", size: 7, qty: 1, price: 11499, image: "shoe-classic.png" }
    ],
    subtotal: 14498, shipping: 0, tax: 1160, total: 15658
  },
  {
    id: "ORD-2026-003", date: "2026-03-10", status: "Processing", deliveryDate: null,
    items: [
      { productId: 14, name: "Little Mojari", size: 3, qty: 2, price: 1999, image: "shoe-classic.png" }
    ],
    subtotal: 3998, shipping: 499, tax: 320, total: 4817
  },
  {
    id: "ORD-2026-004", date: "2026-02-28", status: "Delivered", deliveryDate: "2026-03-05",
    items: [
      { productId: 5, name: "Nagra Ethnic Shoe", size: 10, qty: 1, price: 4499, image: "shoe-classic.png" }
    ],
    subtotal: 4499, shipping: 499, tax: 360, total: 5358
  },
  {
    id: "ORD-2026-005", date: "2026-02-20", status: "Cancelled", deliveryDate: null,
    items: [
      { productId: 4, name: "Kolhapuri Chappal", size: 9, qty: 1, price: 2999, image: "shoe-classic.png" }
    ],
    subtotal: 2999, shipping: 499, tax: 240, total: 3738
  }
];

// === Empty Initial Arrays (populated via API) ===
var BRANDS = [];
var STYLES = [];
