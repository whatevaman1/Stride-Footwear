/* ============================================
   STRIDE — Product, Order & Review Data
   Indian Localized Edition
   ============================================ */

var PRODUCTS = [];

// === Indian Reviewer Names ===
const REVIEWS = [
  {
    id: 1, name: "Aarav Sharma", avatar: "AS", rating: 5,
    date: "2026-03-15", title: "Best running shoes I've ever owned!",
    text: "The Velocity Runner is absolutely incredible. The cushioning is responsive without being too soft, and I've shaved 30 seconds off my 5K time. The breathable mesh keeps my feet cool even during summer runs in Delhi. Worth every rupee!",
    productId: 1, verified: true
  },
  {
    id: 2, name: "Priya Mehta", avatar: "PM", rating: 5,
    date: "2026-03-12", title: "Beautiful Juttis — perfect for my wedding!",
    text: "The Embroidered Jutti is stunning! The phulkari work is intricate and the quality is outstanding. I wore them for my sangeet ceremony and got so many compliments. Comfortable enough to dance all night in!",
    productId: 9, verified: true
  },
  {
    id: 3, name: "Rohan Verma", avatar: "RV", rating: 4,
    date: "2026-03-10", title: "Authentic Kolhapuri — great quality",
    text: "Really happy with the Kolhapuri Chappal. Comfortable right out of the box with no break-in period. The leather quality is exactly what you'd expect from traditional Maharashtrian craftsmanship. Pairs perfectly with kurtas.",
    productId: 4, verified: true
  },
  {
    id: 4, name: "Ananya Iyer", avatar: "AI", rating: 5,
    date: "2026-03-08", title: "My daughter loves her Little Mojari!",
    text: "Got the Little Mojari for my 7-year-old for her school's ethnic day and she won't take them off! The thread work is beautiful and they're surprisingly comfortable. She's now asking for one in every colour.",
    productId: 14, verified: true
  },
  {
    id: 5, name: "Arjun Patel", avatar: "AP", rating: 5,
    date: "2026-03-05", title: "Premium Nagra shoes — perfect for sherwani",
    text: "The Nagra Ethnic Shoe is the finest traditional footwear I've owned. The gold thread embroidery is exquisite and the curved toe design is authentic. Wore them with my sherwani at a family wedding — absolutely regal!",
    productId: 5, verified: true
  },
  {
    id: 6, name: "Sneha Kulkarni", avatar: "SK", rating: 4,
    date: "2026-03-01", title: "Love the Block Heel Ethnic design!",
    text: "The Block Heel Ethnic is exactly what I needed — modern comfort with traditional aesthetics. The zardozi work is gorgeous and the block heel makes it easy to walk in. Perfect for pujas and office parties alike!",
    productId: 11, verified: false
  },
  {
    id: 7, name: "Vikram Reddy", avatar: "VR", rating: 5,
    date: "2026-02-28", title: "Trail Blazer conquered the Western Ghats!",
    text: "The Trail Blazer Boot handled everything I threw at it — rain, muddy trails in Coorg, rocky terrain in Munnar. Completely waterproof and the ankle support is phenomenal. My go-to trekking boot now.",
    productId: 6, verified: true
  },
  {
    id: 8, name: "Divya Nair", avatar: "DN", rating: 4,
    date: "2026-02-25", title: "Cloud Walker — perfect for Mumbai walks",
    text: "The Cloud Walker is my go-to everyday sneaker. Whether I'm navigating Mumbai's streets or heading to Marine Drive for a walk, these are incredibly comfortable. The memory foam insole is a game-changer!",
    productId: 7, verified: true
  }
];

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
