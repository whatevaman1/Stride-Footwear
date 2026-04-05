const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('--- STRIDE DATABASE EXPORT ---');

db.serialize(() => {
  // Get all table names
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';", (err, tables) => {
    if (err) {
      console.error('Error fetching tables:', err);
      return;
    }

    if (tables.length === 0) {
      console.log('No tables found in database.');
      return;
    }

    tables.forEach((table) => {
      db.all(`SELECT * FROM ${table.name}`, (err, rows) => {
        console.log(`\n[TABLE: ${table.name.toUpperCase()}] (${rows ? rows.length : 0} rows)`);
        if (err) {
          console.error(`Error reading table ${table.name}:`, err.message);
        } else if (rows && rows.length > 0) {
          // Using a simpler log if there are too many columns for console.table in some environments
          console.table(rows);
        } else {
          console.log('(Empty table)');
        }
      });
    });
  });
});

db.close();
