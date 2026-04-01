/* ============================================
   STRIDE — Product, Order & Review Data
   Indian Localized Edition
   ============================================ */

const PRODUCTS = [
  // ===== MEN'S SHOES =====
  {
    id: 1, name: "Velocity Runner", brand: "Nike", price: 12499, originalPrice: 15999,
    image: "shoe-sport.png", category: "men", subcategory: "Running",
    rating: 4.8, reviewCount: 234, style: "modern",
    description: "Engineered for speed with responsive cushioning and breathable mesh upper. Perfect for daily training and marathon prep.",
    sizes: [7, 8, 9, 10, 11, 12], colors: ["Black/Orange", "White", "Navy"],
    inStock: true, badge: "Best Seller"
  },
  {
    id: 2, name: "Urban Edge Sneaker", brand: "Adidas", price: 10999, originalPrice: null,
    image: "shoe-sport.png", category: "men", subcategory: "Casual",
    rating: 4.5, reviewCount: 189, style: "modern",
    description: "Street-ready design with premium leather accents. The perfect blend of comfort and urban style for everyday wear.",
    sizes: [7, 8, 9, 10, 11, 12, 13], colors: ["Black", "Gray", "White"],
    inStock: true, badge: null
  },
  {
    id: 3, name: "Rajasthani Jutti", brand: "STRIDE", price: 3499, originalPrice: 4499,
    image: "shoe-classic.png", category: "men", subcategory: "Traditional",
    rating: 4.7, reviewCount: 312, style: "traditional",
    description: "Handcrafted embroidered Jutti from Rajasthan with intricate mirror work and traditional motifs. Ideal for festive occasions and ethnic wear.",
    sizes: [7, 8, 9, 10, 11], colors: ["Gold/Maroon", "Black/Gold", "Cream"],
    inStock: true, badge: "🇮🇳 Indian"
  },
  {
    id: 4, name: "Kolhapuri Chappal", brand: "STRIDE", price: 2999, originalPrice: null,
    image: "shoe-classic.png", category: "men", subcategory: "Traditional",
    rating: 4.6, reviewCount: 278, style: "traditional",
    description: "Authentic hand-stitched Kolhapuri chappal from Maharashtra. Made with premium tanned leather using centuries-old techniques.",
    sizes: [7, 8, 9, 10, 11, 12], colors: ["Tan", "Brown", "Natural"],
    inStock: true, badge: "🇮🇳 Indian"
  },
  {
    id: 5, name: "Nagra Ethnic Shoe", brand: "STRIDE", price: 4499, originalPrice: 5499,
    image: "shoe-classic.png", category: "men", subcategory: "Traditional",
    rating: 4.8, reviewCount: 198, style: "traditional",
    description: "Classic curved-toe Nagra shoes with gold thread embroidery. A timeless choice for sherwani and kurta pyjama pairings.",
    sizes: [7, 8, 9, 10, 11], colors: ["Gold", "Black", "Maroon"],
    inStock: true, badge: "Premium"
  },
  {
    id: 6, name: "Trail Blazer Boot", brand: "Puma", price: 16999, originalPrice: null,
    image: "shoe-sport.png", category: "men", subcategory: "Boots",
    rating: 4.6, reviewCount: 156, style: "modern",
    description: "Waterproof hiking boot with Vibram outsole and Gore-Tex lining. Conquer any terrain from the Himalayas to the Western Ghats.",
    sizes: [8, 9, 10, 11, 12], colors: ["Brown", "Black/Green"],
    inStock: true, badge: null
  },

  // ===== WOMEN'S SHOES =====
  {
    id: 7, name: "Cloud Walker", brand: "New Balance", price: 11499, originalPrice: null,
    image: "shoe-classic.png", category: "women", subcategory: "Sneakers",
    rating: 4.7, reviewCount: 287, style: "modern",
    description: "Lightweight sneaker with memory foam insole and breathable knit upper. All-day comfort meets modern style.",
    sizes: [4, 5, 6, 7, 8, 9], colors: ["White/Rose", "Black", "Blush"],
    inStock: true, badge: "Trending"
  },
  {
    id: 8, name: "Active Flex Runner", brand: "Nike", price: 13499, originalPrice: null,
    image: "shoe-sport.png", category: "women", subcategory: "Running",
    rating: 4.6, reviewCount: 221, style: "modern",
    description: "Responsive running shoe with energy-return midsole and adaptive fit system. Built for performance on Indian roads.",
    sizes: [4, 5, 6, 7, 8, 9], colors: ["Pink/White", "Black/Gold", "Teal"],
    inStock: true, badge: null
  },
  {
    id: 9, name: "Embroidered Jutti", brand: "STRIDE", price: 2999, originalPrice: 3999,
    image: "shoe-classic.png", category: "women", subcategory: "Traditional",
    rating: 4.9, reviewCount: 456, style: "traditional",
    description: "Exquisite Punjabi Jutti with hand-embroidered phulkari patterns and silk thread work. Perfect with salwar kameez, lehenga, or jeans.",
    sizes: [4, 5, 6, 7, 8, 9], colors: ["Red/Gold", "Pink/Silver", "Multi"],
    inStock: true, badge: "Best Seller"
  },
  {
    id: 10, name: "Women's Kolhapuri", brand: "STRIDE", price: 3499, originalPrice: null,
    image: "shoe-classic.png", category: "women", subcategory: "Traditional",
    rating: 4.5, reviewCount: 198, style: "traditional",
    description: "Elegant Kolhapuri sandal with delicate T-strap design. Handcrafted leather with traditional punching patterns from Maharashtra.",
    sizes: [4, 5, 6, 7, 8, 9], colors: ["Natural", "Brown", "Red"],
    inStock: true, badge: "🇮🇳 Indian"
  },
  {
    id: 11, name: "Block Heel Ethnic", brand: "STRIDE", price: 5999, originalPrice: 7499,
    image: "shoe-classic.png", category: "women", subcategory: "Fusion",
    rating: 4.7, reviewCount: 167, style: "fusion",
    description: "Indo-western block heel with traditional zardozi embroidery on a modern silhouette. Bridges ethnic elegance with contemporary design.",
    sizes: [4, 5, 6, 7, 8, 9], colors: ["Black/Gold", "Maroon", "Teal"],
    inStock: true, badge: "🇮🇳 Indian"
  },
  {
    id: 12, name: "Elegance Heel", brand: "Puma", price: 13999, originalPrice: 16999,
    image: "shoe-classic.png", category: "women", subcategory: "Formal",
    rating: 4.8, reviewCount: 198, style: "modern",
    description: "Sculpted stiletto with cushioned footbed and premium suede finish. Confidence in every step, from boardrooms to celebrations.",
    sizes: [4, 5, 6, 7, 8], colors: ["Black", "Nude", "Red"],
    inStock: true, badge: "Sale"
  },

  // ===== KIDS' SHOES =====
  {
    id: 13, name: "Spark Runner Jr", brand: "Adidas", price: 5799, originalPrice: null,
    image: "shoe-sport.png", category: "kids", subcategory: "Sneakers",
    rating: 4.7, reviewCount: 189, style: "modern",
    description: "Lightweight and durable sneaker with easy hook-and-loop closure. Built for endless play and school days.",
    sizes: [1, 2, 3, 4, 5, 6], colors: ["Blue/Red", "Black/Green", "Pink/Purple"],
    inStock: true, badge: "Popular"
  },
  {
    id: 14, name: "Little Mojari", brand: "STRIDE", price: 1999, originalPrice: 2499,
    image: "shoe-classic.png", category: "kids", subcategory: "Traditional",
    rating: 4.8, reviewCount: 234, style: "traditional",
    description: "Adorable handcrafted Mojari for kids with colorful thread work and soft inner lining. Perfect for festivals, weddings, and ethnic day at school.",
    sizes: [1, 2, 3, 4, 5], colors: ["Gold/Red", "Multi", "Blue/Silver"],
    inStock: true, badge: "🇮🇳 Indian"
  },
  {
    id: 15, name: "Junior Sprint", brand: "Puma", price: 4999, originalPrice: 5999,
    image: "shoe-sport.png", category: "kids", subcategory: "Running",
    rating: 4.6, reviewCount: 156, style: "modern",
    description: "Performance running shoe sized for young athletes. Lightweight, supportive, and built for speed on the playground.",
    sizes: [1, 2, 3, 4, 5, 6], colors: ["Black/Lime", "Red/White", "Blue"],
    inStock: true, badge: "Sale"
  },
  {
    id: 16, name: "Cool Kids Slip-On", brand: "New Balance", price: 4499, originalPrice: null,
    image: "shoe-sport.png", category: "kids", subcategory: "Casual",
    rating: 4.4, reviewCount: 112, style: "modern",
    description: "Easy-on canvas slip-on with fun prints and cushioned insole. Style made simple for everyday adventures.",
    sizes: [1, 2, 3, 4, 5, 6], colors: ["Galaxy Print", "Dino Print", "Solid Black"],
    inStock: true, badge: null
  },
  {
    id: 17, name: "Fun Step Sandal", brand: "Nike", price: 3999, originalPrice: null,
    image: "shoe-classic.png", category: "kids", subcategory: "Sandals",
    rating: 4.3, reviewCount: 87, style: "modern",
    description: "Colorful open-toe sandal with adjustable straps and cushioned footbed. Summer favourites for active kids!",
    sizes: [1, 2, 3, 4, 5, 6], colors: ["Multi", "Blue", "Pink"],
    inStock: true, badge: null
  },
  {
    id: 18, name: "Ethnic Sandal Kids", brand: "STRIDE", price: 2499, originalPrice: 2999,
    image: "shoe-classic.png", category: "kids", subcategory: "Fusion",
    rating: 4.5, reviewCount: 145, style: "fusion",
    description: "Trendy Indo-western sandals for kids with mirror work detailing and comfortable sole. Great for family functions and Diwali celebrations.",
    sizes: [1, 2, 3, 4, 5, 6], colors: ["Gold", "Pink/Gold", "Silver"],
    inStock: true, badge: "🇮🇳 Indian"
  }
];

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

// === Popularity Scores ===
PRODUCTS.forEach(p => { p.popularity = p.reviewCount + Math.floor(p.rating * 50); });
const BRANDS = [...new Set(PRODUCTS.map(p => p.brand))].sort();
const STYLES = [...new Set(PRODUCTS.map(p => p.style))].sort();
