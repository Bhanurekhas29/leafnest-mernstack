import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/content', async (_req, res, next) => {
  try {
    const q = (table) => pool.query(`SELECT * FROM ${table} WHERE is_active = 1 ORDER BY sort_order, id`).then(([r]) => r);
    const [categories, packs, gallery, reviews, faqs] = await Promise.all(
      ['categories', 'packs', 'gallery', 'reviews', 'faqs'].map(q)
    );
    res.json({ categories, packs, gallery, reviews, faqs });
  } catch (e) {
    next(e);
  }
});

router.post('/quotes', async (req, res, next) => {
  try {
    const { name, phone, email, event_type, quantity, event_date, city, message } = req.body;
    if (!name?.trim() || !phone?.trim() || !event_type?.trim()) {
      return res.status(400).json({ message: 'Name, phone and event type are required.' });
    }
    await pool.query(
      'INSERT INTO quotes (name, phone, email, event_type, quantity, event_date, city, message) VALUES (?,?,?,?,?,?,?,?)',
      [name.trim(), phone.trim(), email || null, event_type, quantity || null, event_date || null, city || null, message || null]
    );
    res.status(201).json({ message: 'Thank you! We will get back to you shortly.' });
  } catch (e) {
    next(e);
  }
});

export default router;
