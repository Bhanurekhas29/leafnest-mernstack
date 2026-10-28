import { Router } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { pool } from '../db.js';
import { requireAdmin } from '../middleware.js';

const router = Router();
router.use(requireAdmin);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '..', '..', 'uploads'),
    filename: (_req, file, cb) => cb(null, crypto.randomBytes(8).toString('hex') + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
});

// Each resource is one "model admin": table, editable columns, label column, list ordering.
const resources = {
  categories: { table: 'categories', fields: ['title', 'description', 'image', 'sort_order', 'is_active'], label: 'title', order: 'sort_order, id' },
  packs: { table: 'packs', fields: ['title', 'description', 'min_qty', 'price_label', 'image', 'sort_order', 'is_active'], label: 'title', order: 'sort_order, id' },
  gallery: { table: 'gallery', fields: ['caption', 'image', 'sort_order', 'is_active'], label: 'caption', order: 'sort_order, id' },
  reviews: { table: 'reviews', fields: ['author', 'role', 'quote', 'sort_order', 'is_active'], label: 'author', order: 'sort_order, id' },
  faqs: { table: 'faqs', fields: ['question', 'answer', 'sort_order', 'is_active'], label: 'question', order: 'sort_order, id' },
  quotes: { table: 'quotes', fields: ['name', 'phone', 'email', 'event_type', 'quantity', 'event_date', 'city', 'message', 'status'], label: 'name', order: 'id DESC' },
  admins: { table: 'admins', fields: ['username', 'email', 'is_active'], label: 'username', order: 'id', hidden: ['password_hash'], password: true },
};

const logAction = (req, action, type, repr) =>
  pool.query('INSERT INTO admin_log (admin_email, action, object_type, object_repr) VALUES (?,?,?,?)', [req.admin.email, action, type, String(repr ?? '').slice(0, 255)]);

const pick = (body, fields) => Object.fromEntries(fields.filter((f) => f in body).map((f) => [f, body[f] === '' ? null : body[f]]));

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please choose an image file (max 5 MB).' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

router.get('/stats', async (_req, res, next) => {
  try {
    const out = {};
    for (const [key, r] of Object.entries(resources)) {
      const [[{ c }]] = await pool.query(`SELECT COUNT(*) c FROM ${r.table}`);
      out[key] = c;
    }
    const [[{ c: newQuotes }]] = await pool.query("SELECT COUNT(*) c FROM quotes WHERE status = 'new'");
    const [log] = await pool.query('SELECT * FROM admin_log ORDER BY id DESC LIMIT 10');
    res.json({ counts: out, newQuotes, log });
  } catch (e) {
    next(e);
  }
});

router.param('resource', (req, res, next, name) => {
  req.res_cfg = resources[name];
  if (!req.res_cfg) return res.status(404).json({ message: 'Unknown resource.' });
  next();
});

const strip = (cfg, row) => {
  for (const h of cfg.hidden || []) delete row[h];
  return row;
};

router.get('/:resource', async (req, res, next) => {
  try {
    const cfg = req.res_cfg;
    const search = (req.query.search || '').trim();
    const page = Math.max(1, Number(req.query.page) || 1);
    const size = 20;
    const textCols = cfg.fields.filter((f) => !['sort_order', 'is_active', 'image'].includes(f));
    const where = search ? `WHERE ${textCols.map((c) => `${c} LIKE ?`).join(' OR ')}` : '';
    const params = search ? textCols.map(() => `%${search}%`) : [];
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) total FROM ${cfg.table} ${where}`, params);
    const [rows] = await pool.query(`SELECT * FROM ${cfg.table} ${where} ORDER BY ${cfg.order} LIMIT ? OFFSET ?`, [...params, size, (page - 1) * size]);
    res.json({ total, page, pages: Math.ceil(total / size), rows: rows.map((r) => strip(cfg, r)) });
  } catch (e) {
    next(e);
  }
});

router.get('/:resource/:id', async (req, res, next) => {
  try {
    const cfg = req.res_cfg;
    const [[row]] = await pool.query(`SELECT * FROM ${cfg.table} WHERE id = ?`, [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Not found.' });
    res.json(strip(cfg, row));
  } catch (e) {
    next(e);
  }
});

router.post('/:resource', async (req, res, next) => {
  try {
    const cfg = req.res_cfg;
    const data = pick(req.body, cfg.fields);
    if (cfg.password) {
      if (!req.body.password || req.body.password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
      data.password_hash = await bcrypt.hash(req.body.password, 10);
    }
    const cols = Object.keys(data);
    const [result] = await pool.query(`INSERT INTO ${cfg.table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`, Object.values(data));
    await logAction(req, 'added', cfg.table, data[cfg.label]);
    res.status(201).json({ id: result.insertId });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'A record with that value already exists.' });
    next(e);
  }
});

router.put('/:resource/:id', async (req, res, next) => {
  try {
    const cfg = req.res_cfg;
    const data = pick(req.body, cfg.fields);
    if (cfg.password && req.body.password) {
      if (req.body.password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
      data.password_hash = await bcrypt.hash(req.body.password, 10);
    }
    const cols = Object.keys(data);
    if (!cols.length) return res.status(400).json({ message: 'Nothing to update.' });
    await pool.query(`UPDATE ${cfg.table} SET ${cols.map((c) => `${c} = ?`).join(',')} WHERE id = ?`, [...Object.values(data), req.params.id]);
    await logAction(req, 'changed', cfg.table, data[cfg.label] ?? `#${req.params.id}`);
    res.json({ ok: true });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'A record with that value already exists.' });
    next(e);
  }
});

router.delete('/:resource/:id', async (req, res, next) => {
  try {
    const cfg = req.res_cfg;
    if (cfg.table === 'admins' && Number(req.params.id) === req.admin.id) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }
    const [[row]] = await pool.query(`SELECT * FROM ${cfg.table} WHERE id = ?`, [req.params.id]);
    await pool.query(`DELETE FROM ${cfg.table} WHERE id = ?`, [req.params.id]);
    await logAction(req, 'deleted', cfg.table, row?.[cfg.label]);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
