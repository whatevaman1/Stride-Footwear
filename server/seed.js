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
      console.log(`✅ Database successfully seeded with ${count} products.`);
      db.close();
    });
});
