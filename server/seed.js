const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');

const dbPath = path.join(__dirname, 'database.sqlite');
const csvPath = path.join(__dirname, '../shoes_dim.csv');

// Remove existing DB to start fresh
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Create products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT,
      name TEXT,
      brand TEXT,
      price INTEGER,
      originalPrice INTEGER,
      category TEXT,
      subcategory TEXT,
      style TEXT,
      image TEXT,
      description TEXT,
      sizes TEXT,
      rating REAL,
      reviewCount INTEGER,
      color TEXT
    )
  `);

  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    )
  `);

  // Create cart_items table
  db.run(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      size TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `);

  // Create wishlist_items table
  db.run(`
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `);

  // Create orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      shipping INTEGER NOT NULL,
      tax INTEGER NOT NULL,
      total INTEGER NOT NULL,
      billing_address TEXT,
      billing_city TEXT,
      billing_zip TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Create order_items table
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      size TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `);

  // Create reviews table
  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      avatar TEXT,
      rating INTEGER NOT NULL,
      date TEXT NOT NULL,
      title TEXT,
      text TEXT NOT NULL,
      product_id INTEGER,
      verified BOOLEAN DEFAULT 0,
      helpful_count INTEGER DEFAULT 0,
      marked_helpful BOOLEAN DEFAULT 0,
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `);

  const stmt = db.prepare(`
    INSERT INTO products (sku, name, brand, price, originalPrice, category, subcategory, style, image, description, sizes, rating, reviewCount, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let count = 0;

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => {
      // Map gender to category
      let category = 'men';
      if (row.gender === 'W') category = 'women';
      else if (row.gender === 'K') category = 'kids';
      else if (row.gender === 'U') category = 'men'; // Unassigned/Unisex defaults to men

      // Prices & Ratings
      // Random deterministic-like synthetic data using simple math on sku length to avoid true random if possible, or just random
      const randSeed = (row.id.charCodeAt(0) + row.id.charCodeAt(row.id.length - 1));
      const basePrice = Math.floor(Math.random() * 130 + 20) * 100; // 2000 to 15000
      let price = basePrice;
      let originalPrice = Math.random() > 0.5 ? basePrice + Math.floor(Math.random() * 20 + 5) * 100 : null;
      
      const rating = (Math.random() * 2 + 3).toFixed(1);
      const reviewCount = Math.floor(Math.random() * 500) + 12;

      // Sizes
      const sizes = category === 'kids' 
        ? ["2", "3", "4", "5"] 
        : ["6", "7", "8", "9", "10", "11"];

      const styleMapping = {
        'City': 'casual',
        'Racing': 'sports',
        'Neutral': 'sports',
        'Stadium': 'sports',
        'Everyday': 'casual',
        'Stability': 'sports',
        'Cage': 'casual',
        'Day Hiking': 'outdoor'
      };
      
      const style = styleMapping[row.best_for_wear] || 'casual';

      const desc = `Experience the ultimate in comfort and style with the ${row.name}. Engineered for ${row.best_for_wear ? row.best_for_wear.toLowerCase() : 'everyday wear'}, this shoe offers premium durability, striking ${row.dominant_color ? row.dominant_color.toLowerCase() : 'various'} tones, and outstanding performance.`;

      stmt.run(
        row.id,
        row.name,
        'Adidas',
        price,
        originalPrice,
        category,
        row.best_for_wear || 'Footwear',
        style,
        row.image_url,
        desc,
        JSON.stringify(sizes),
        rating,
        reviewCount,
        row.dominant_color
      );
      count++;
    })
    .on('end', () => {
      stmt.finalize();
      
      // Insert initial dummy reviews
      const initialReviews = [
        { name: "Aarav Sharma", avatar: "AS", rating: 5, date: "2026-03-15", title: "Best running shoes I've ever owned!", text: "The Velocity Runner is absolutely incredible. The cushioning is responsive without being too soft, and I've shaved 30 seconds off my 5K time. The breathable mesh keeps my feet cool even during summer runs in Delhi. Worth every rupee!", productId: 1, verified: 1 },
        { name: "Priya Mehta", avatar: "PM", rating: 5, date: "2026-03-12", title: "Beautiful Juttis — perfect for my wedding!", text: "The Embroidered Jutti is stunning! The phulkari work is intricate and the quality is outstanding. I wore them for my sangeet ceremony and got so many compliments. Comfortable enough to dance all night in!", productId: 9, verified: 1 },
        { name: "Rohan Verma", avatar: "RV", rating: 4, date: "2026-03-10", title: "Authentic Kolhapuri — great quality", text: "Really happy with the Kolhapuri Chappal. Comfortable right out of the box with no break-in period. The leather quality is exactly what you'd expect from traditional Maharashtrian craftsmanship. Pairs perfectly with kurtas.", productId: 4, verified: 1 },
        { name: "Ananya Iyer", avatar: "AI", rating: 5, date: "2026-03-08", title: "My daughter loves her Little Mojari!", text: "Got the Little Mojari for my 7-year-old for her school's ethnic day and she won't take them off! The thread work is beautiful and they're surprisingly comfortable. She's now asking for one in every colour.", productId: 14, verified: 1 },
        { name: "Arjun Patel", avatar: "AP", rating: 5, date: "2026-03-05", title: "Premium Nagra shoes — perfect for sherwani", text: "The Nagra Ethnic Shoe is the finest traditional footwear I've owned. The gold thread embroidery is exquisite and the curved toe design is authentic. Wore them with my sherwani at a family wedding — absolutely regal!", productId: 5, verified: 1 },
        { name: "Sneha Kulkarni", avatar: "SK", rating: 4, date: "2026-03-01", title: "Love the Block Heel Ethnic design!", text: "The Block Heel Ethnic is exactly what I needed — modern comfort with traditional aesthetics. The zardozi work is gorgeous and the block heel makes it easy to walk in. Perfect for pujas and office parties alike!", productId: 11, verified: 0 },
        { name: "Vikram Reddy", avatar: "VR", rating: 5, date: "2026-02-28", title: "Trail Blazer conquered the Western Ghats!", text: "The Trail Blazer Boot handled everything I threw at it — rain, muddy trails in Coorg, rocky terrain in Munnar. Completely waterproof and the ankle support is phenomenal. My go-to trekking boot now.", productId: 6, verified: 1 },
        { name: "Divya Nair", avatar: "DN", rating: 4, date: "2026-02-25", title: "Cloud Walker — perfect for Mumbai walks", text: "The Cloud Walker is my go-to everyday sneaker. Whether I'm navigating Mumbai's streets or heading to Marine Drive for a walk, these are incredibly comfortable. The memory foam insole is a game-changer!", productId: 7, verified: 1 }
      ];

      const reviewStmt = db.prepare('INSERT INTO reviews (name, avatar, rating, date, title, text, product_id, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      initialReviews.forEach(r => {
        reviewStmt.run(r.name, r.avatar, r.rating, r.date, r.title, r.text, r.productId, r.verified);
      });
      reviewStmt.finalize(() => {
        console.log(`✅ Database successfully seeded with ${count} products and initial reviews.`);
        db.close();
      });
    });
});
