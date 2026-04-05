const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'stride-super-secret-key-fallback';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  }
});

// GET /api/products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Parse JSON fields
    const products = rows.map(row => {
      return {
        ...row,
        sizes: row.sizes ? JSON.parse(row.sizes) : []
      };
    });
    
    res.json(products);
  });
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row) return res.status(400).json({ error: 'User with this email already exists' });

      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        db.run(
          'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
          [name, email, hashedPassword],
          function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '7d' });
            res.status(201).json({
              message: 'User registered successfully',
              token,
              user: { id: this.lastID, name, email }
            });
          }
        );
      } catch (hashErr) {
        return res.status(500).json({ error: 'Error hashing password' });
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(400).json({ error: 'Invalid credentials' });

      try {
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({
          message: 'Login successful',
          token,
          user: { id: user.id, name: user.name, email: user.email }
        });
      } catch (compareErr) {
        return res.status(500).json({ error: 'Error verifying credentials' });
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// GET /api/users (for debugging)
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// ================= CART ENDPOINTS =================
// Get user's cart
app.get('/api/cart', authenticateToken, (req, res) => {
  const query = `
    SELECT c.id as cart_item_id, c.size, c.quantity, p.* 
    FROM cart_items c 
    JOIN products p ON c.product_id = p.id 
    WHERE c.user_id = ?
  `;
  db.all(query, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const cart = rows.map(row => ({
      ...row,
      sizes: row.sizes ? JSON.parse(row.sizes) : [],
      qty: row.quantity,
      productId: row.id, // the product id because the join uses products.id
      cartItemId: row.cart_item_id
    }));
    res.json(cart);
  });
});

// Add to cart
app.post('/api/cart', authenticateToken, (req, res) => {
  const { productId, size, qty } = req.body;
  const userId = req.user.id;
  
  db.get('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?', [userId, productId, size], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (row) {
      db.run('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [qty, row.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Cart updated' });
      });
    } else {
      db.run('INSERT INTO cart_items (user_id, product_id, size, quantity) VALUES (?, ?, ?, ?)', [userId, productId, size, qty], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Item added to cart' });
      });
    }
  });
});

// Update cart item quantity
app.put('/api/cart', authenticateToken, (req, res) => {
  const { productId, size, qty } = req.body;
  const userId = req.user.id;
  
  if (qty <= 0) {
    db.run('DELETE FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?', [userId, productId, size], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Item removed from cart' });
    });
  } else {
    db.run('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ? AND size = ?', [qty, userId, productId, size], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Cart updated' });
    });
  }
});

// Remove item from cart
app.delete('/api/cart/:productId/:size', authenticateToken, (req, res) => {
  const { productId, size } = req.params;
  const userId = req.user.id;
  
  db.run('DELETE FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?', [userId, productId, size], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Item removed from cart' });
  });
});

// Clear cart
app.delete('/api/cart', authenticateToken, (req, res) => {
  db.run('DELETE FROM cart_items WHERE user_id = ?', [req.user.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Cart cleared' });
  });
});

// ================= WISHLIST ENDPOINTS =================
// Get user's wishlist
app.get('/api/wishlist', authenticateToken, (req, res) => {
  db.all('SELECT product_id FROM wishlist_items WHERE user_id = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(row => row.product_id));
  });
});

// Add to wishlist
app.post('/api/wishlist', authenticateToken, (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;
  
  db.get('SELECT * FROM wishlist_items WHERE user_id = ? AND product_id = ?', [userId, productId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) {
      db.run('INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)', [userId, productId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Added to wishlist', added: true });
      });
    } else {
      res.json({ message: 'Already in wishlist', added: false });
    }
  });
});

// Remove from wishlist
app.delete('/api/wishlist/:productId', authenticateToken, (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;
  
  db.run('DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?', [userId, productId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Removed from wishlist' });
  });
});

// Clear wishlist
app.delete('/api/wishlist', authenticateToken, (req, res) => {
  db.run('DELETE FROM wishlist_items WHERE user_id = ?', [req.user.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Wishlist cleared' });
  });
});

// ================= ORDERS ENDPOINTS =================
// Place an order
app.post('/api/orders', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { address, city, zip } = req.body;

  if (!address || !city || !zip) {
    return res.status(400).json({ error: 'Billing address missing' });
  }

  // 1. Fetch current cart items
  const query = `
    SELECT c.size, c.quantity, p.id as product_id, p.price, p.name, p.image
    FROM cart_items c 
    JOIN products p ON c.product_id = p.id 
    WHERE c.user_id = ?
  `;
  db.all(query, [userId], (err, cartItems) => {
    if (err) return res.status(500).json({ error: err.message });
    if (cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    // 2. Calculate totals
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal >= 8000 ? 0 : 499;
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + shipping + tax;
    const status = 'Processing';

    // 3. Insert order
    db.run(
      'INSERT INTO orders (user_id, status, subtotal, shipping, tax, total, billing_address, billing_city, billing_zip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, status, subtotal, shipping, tax, total, address, city, zip],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        const orderId = this.lastID;

        // 4. Insert order items
        const stmt = db.prepare('INSERT INTO order_items (order_id, product_id, size, quantity, price) VALUES (?, ?, ?, ?, ?)');
        cartItems.forEach(item => {
          stmt.run([orderId, item.product_id, item.size, item.quantity, item.price]);
        });
        stmt.finalize((err) => {
          if (err) return res.status(500).json({ error: err.message });

          // 5. Clear user cart
          db.run('DELETE FROM cart_items WHERE user_id = ?', [userId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Return success with order summary similar to frontend dummy models
            const formattedOrder = {
              orderId: 'ORD-' + new Date().getFullYear() + '-' + String(orderId).padStart(3, '0'),
              items: cartItems.map(i => ({
                productId: i.product_id,
                name: i.name,
                image: i.image,
                size: i.size,
                qty: i.quantity,
                price: i.price
              }))
            };
            res.json({ message: 'Order placed successfully', order: formattedOrder });
          });
        });
      }
    );
  });
});

// Get user orders
app.get('/api/orders', authenticateToken, (req, res) => {
  const userId = req.user.id;
  db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, ordersData) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (ordersData.length === 0) return res.json([]);

    const orderIds = ordersData.map(o => o.id);
    const placeholders = orderIds.map(() => '?').join(',');

    const sql = `
      SELECT oi.*, p.name, p.image 
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id IN (${placeholders})
    `;

    db.all(sql, orderIds, (err, itemsData) => {
      if (err) return res.status(500).json({ error: err.message });

      const finalOrders = ordersData.map(order => {
        const items = itemsData
          .filter(i => i.order_id === order.id)
          .map(i => ({
            productId: i.product_id,
            name: i.name,
            size: i.size,
            qty: i.quantity,
            price: i.price,
            image: i.image
          }));

        // Estimate delivery date (5 days later)
        const orderDate = new Date(order.created_at || new Date());
        const deliveryDate = new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000);

        return {
          id: 'ORD-' + orderDate.getFullYear() + '-' + String(order.id).padStart(3, '0'),
          db_id: order.id,
          date: orderDate.toISOString().split('T')[0],
          status: order.status,
          deliveryDate: deliveryDate.toISOString().split('T')[0],
          subtotal: order.subtotal,
          shipping: order.shipping,
          tax: order.tax,
          total: order.total,
          billing_address: order.billing_address,
          billing_city: order.billing_city,
          billing_zip: order.billing_zip,
          items: items
        };
      });

      res.json(finalOrders);
    });
  });
});

// ================= REVIEWS ENDPOINTS =================
// Get all reviews
app.get('/api/reviews', (req, res) => {
  db.all('SELECT * FROM reviews ORDER BY date DESC, id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Post a new review
app.post('/api/reviews', (req, res) => {
  const { name, rating, title, text, productId } = req.body;
  if (!name || !rating || !text) {
    return res.status(400).json({ error: 'Name, rating, and text are required' });
  }

  const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const date = new Date().toISOString().split('T')[0];

  db.run(
    'INSERT INTO reviews (name, avatar, rating, date, title, text, product_id, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [name, avatar, rating, date, title, text, productId || null, 0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      db.get('SELECT * FROM reviews WHERE id = ?', [this.lastID], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json(row);
      });
    }
  );
});

// Mark review as helpful
app.put('/api/reviews/:id/helpful', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Marked as helpful' });
  });
});

app.listen(port, () => {
  console.log(`✅ Stride Footwear Backend API listening at http://localhost:${port}`);
});
