import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
// TiDB Cloud (and most hosted MySQL) requires TLS; set DB_SSL=true there.
const ssl = process.env.DB_SSL === 'true' ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined;

export let pool;

const tables = [
  `CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60) NULL UNIQUE,
    email VARCHAR(190) NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1
  )`,
  `CREATE TABLE IF NOT EXISTS packs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    min_qty VARCHAR(80),
    price_label VARCHAR(80) DEFAULT 'Price on enquiry',
    image VARCHAR(255),
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1
  )`,
  `CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    caption VARCHAR(190) NOT NULL,
    image VARCHAR(255),
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1
  )`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author VARCHAR(120) NOT NULL,
    role VARCHAR(190),
    quote TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1
  )`,
  `CREATE TABLE IF NOT EXISTS faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1
  )`,
  `CREATE TABLE IF NOT EXISTS quotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(40) NOT NULL,
    email VARCHAR(190),
    event_type VARCHAR(80) NOT NULL,
    quantity VARCHAR(40),
    event_date VARCHAR(40),
    city VARCHAR(120),
    message TEXT,
    status ENUM('new','contacted','closed') NOT NULL DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS admin_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_email VARCHAR(190),
    action VARCHAR(20) NOT NULL,
    object_type VARCHAR(60) NOT NULL,
    object_repr VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
];

const seed = {
  categories: [
    ['Mini Succulents', 'Tiny, tidy and loved by every guest — perfect for return gifts and giveaways.', '/images/cat-succulents.jpg'],
    ['Desk Plants', 'Compact greens that brighten work desks — ideal for employees and clients.', '/images/cat-desk.jpg'],
    ['Air-Purifying Plants', 'Snake plants, pothos and peace lilies that give a gift with real benefits.', '/images/cat-airpurifying.jpg'],
    ['Gift Hampers', 'Curated plant hampers with pots, cards and festive extras in one beautiful box.', '/images/cat-hampers.jpg'],
  ],
  packs: [
    ['Succulent Five-Pack Box', 'Five mini succulents in white pots, packed in a kraft box with a jute ribbon.', 'Minimum 50 pieces', '/images/pack-succulent.jpg'],
    ['Desk Green Duo', 'Two easy desk plants in ceramic pots with a gift box and welcome card.', 'Minimum 25 pieces', '/images/pack-desk.jpg'],
    ['Air-Pure Trio', 'Snake plant, pothos and peace lily — a healthier-gift trio in a display box.', 'Minimum 25 pieces', '/images/pack-airpurifying.jpg'],
    ['Festive Delight Hamper', 'Potted plant with diyas, festive accents and sweets in an elegant hamper.', 'Minimum 20 pieces', '/images/pack-festive.jpg'],
  ],
  gallery: [
    ['Wedding return gifts — Bengaluru', '/images/gallery-wedding-1.jpg'],
    ['Employee welcome kits — tech park', '/images/gallery-corporate-1.jpg'],
    ['Personalised pot tags — mehendi favours', '/images/gallery-wedding-2.jpg'],
    ['Diwali hampers — bulk order', '/images/gallery-festive-1.jpg'],
    ['Client gifting — festive edition', '/images/gallery-corporate-2.jpg'],
    ['Table-top succulent settings', '/images/gallery-wedding-3.jpg'],
  ],
  reviews: [
    ['Priya & Arjun', 'Wedding return gifts, Bengaluru', 'Our guests still talk about the little plants! The personalised tags were beautiful and everything arrived a day early.'],
    ['Meera Kulkarni', 'HR Manager, IT services firm', 'We ordered 300 desk plants for employee welcomes. Smooth process, on-time delivery, and the branded pots looked premium.'],
    ['Rahul Shah', 'Event organiser, Mumbai', 'Leafnest handled a last-minute 150-piece order for a Diwali event without breaking a sweat. Excellent packing — zero damage.'],
  ],
  faqs: [
    ['What is your minimum order quantity?', "It depends on the pack — most start at 25–50 pieces. Festive hampers start at 20. Tell us your headcount and we'll suggest the best fit."],
    ['Which areas do you deliver to?', 'We deliver across Bengaluru and ship to major cities across India. Share your delivery city in the quote form and we will confirm.'],
    ['How much lead time do you need?', 'Ideally 2–3 weeks for personalised orders. Rush orders are possible — message us on WhatsApp.'],
    ['Can we customise the pots and tags?', 'Yes. Pots, name tags, cards and ribbons can all carry your names, message or brand.'],
    ['What if plants arrive damaged?', 'We replace the batch, no questions asked.'],
    ['Do the plants need care instructions?', 'Every gift ships with a simple care card. We can also brand it for your event.'],
  ],
};

async function seedTable(table, cols, rows) {
  const [[{ c }]] = await pool.query(`SELECT COUNT(*) c FROM ${table}`);
  if (c > 0) return;
  for (const [i, row] of rows.entries()) {
    await pool.query(
      `INSERT INTO ${table} (${cols.join(',')}, sort_order) VALUES (${cols.map(() => '?').join(',')}, ?)`,
      [...row, i + 1]
    );
  }
}

export async function initDb() {
  try {
    const root = await mysql.createConnection({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASSWORD, ssl });
    await root.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await root.end();
  } catch (err) {
    // Hosted databases may not allow CREATE DATABASE; the target database then has to exist already.
    console.warn(`Skipping CREATE DATABASE (${err.message})`);
  }

  pool = mysql.createPool({
    host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASSWORD, database: DB_NAME, ssl,
    waitForConnections: true, connectionLimit: 10, dateStrings: true,
  });
  for (const sql of tables) await pool.query(sql);

  const [usernameCol] = await pool.query("SHOW COLUMNS FROM admins LIKE 'username'");
  if (!usernameCol.length) {
    // Two steps: TiDB cannot add a UNIQUE column in a single ALTER.
    await pool.query('ALTER TABLE admins ADD COLUMN username VARCHAR(60) NULL AFTER id');
    await pool.query('CREATE UNIQUE INDEX admins_username_uq ON admins (username)');
  }

  const [[{ n }]] = await pool.query('SELECT COUNT(*) n FROM admins');
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  if (n === 0) {
    await pool.query('INSERT INTO admins (username, email, password_hash) VALUES (?, ?, ?)', [process.env.ADMIN_USERNAME, process.env.ADMIN_EMAIL, hash]);
    console.log(`Created admin account: ${process.env.ADMIN_USERNAME}`);
  } else {
    // Accounts created before usernames existed: give the first one the configured username and password once.
    const [[legacy]] = await pool.query('SELECT id FROM admins WHERE username IS NULL ORDER BY id LIMIT 1');
    if (legacy) {
      await pool.query('UPDATE admins SET username = ?, password_hash = ? WHERE id = ?', [process.env.ADMIN_USERNAME, hash, legacy.id]);
      console.log(`Admin account ${legacy.id} now logs in as: ${process.env.ADMIN_USERNAME}`);
    }
  }

  await seedTable('categories', ['title', 'description', 'image'], seed.categories);
  await seedTable('packs', ['title', 'description', 'min_qty', 'image'], seed.packs);
  await seedTable('gallery', ['caption', 'image'], seed.gallery);
  await seedTable('reviews', ['author', 'role', 'quote'], seed.reviews);
  await seedTable('faqs', ['question', 'answer'], seed.faqs);
}
