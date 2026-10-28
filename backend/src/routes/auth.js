import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { pool } from '../db.js';
import { requireAdmin } from '../middleware.js';

const router = Router();
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const [[admin]] = await pool.query('SELECT * FROM admins WHERE username = ? OR email = ?', [username || '', username || '']);
    if (!admin || !admin.is_active || !(await bcrypt.compare(password || '', admin.password_hash))) {
      return res.status(401).json({ message: 'Please enter the correct username and password.' });
    }
    await pool.query('UPDATE admins SET last_login = NOW() WHERE id = ?', [admin.id]);
    const who = admin.username || admin.email;
    const token = jwt.sign({ id: admin.id, email: who }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, admin: { id: admin.id, email: who } });
  } catch (e) {
    next(e);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const [[admin]] = await pool.query('SELECT id, email FROM admins WHERE (email = ? OR username = ?) AND is_active = 1 AND email IS NOT NULL', [email || '', email || '']);
    // Same response whether or not the account exists, so emails cannot be probed.
    if (admin) {
      const token = crypto.randomBytes(32).toString('hex');
      await pool.query(
        'INSERT INTO password_resets (admin_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))',
        [admin.id, sha(token)]
      );
      const link = `${process.env.CLIENT_URL}/admin/reset-password/${token}`;
      if (process.env.SMTP_HOST) {
        const transport = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
        await transport.sendMail({
          from: process.env.SMTP_FROM,
          to: admin.email,
          subject: 'Reset your Leafnest admin password',
          text: `Use this link within 1 hour to set a new password:\n\n${link}`,
        });
      } else {
        console.log(`\n[forgot-password] SMTP not configured. Reset link for ${admin.email}:\n${link}\n`);
      }
    }
    res.json({ message: "If that email is registered, we've sent password reset instructions." });
  } catch (e) {
    next(e);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    const [[row]] = await pool.query(
      'SELECT id, admin_id FROM password_resets WHERE token_hash = ? AND used = 0 AND expires_at > NOW()',
      [sha(token || '')]
    );
    if (!row) return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
    await pool.query('UPDATE admins SET password_hash = ? WHERE id = ?', [await bcrypt.hash(password, 10), row.admin_id]);
    await pool.query('UPDATE password_resets SET used = 1 WHERE admin_id = ?', [row.admin_id]);
    res.json({ message: 'Your password has been reset. You can now log in.' });
  } catch (e) {
    next(e);
  }
});

router.post('/change-password', requireAdmin, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const [[admin]] = await pool.query('SELECT * FROM admins WHERE id = ?', [req.admin.id]);
    if (!(await bcrypt.compare(current_password || '', admin.password_hash))) {
      return res.status(400).json({ message: 'Your current password was entered incorrectly.' });
    }
    if (!new_password || new_password.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters.' });
    }
    await pool.query('UPDATE admins SET password_hash = ? WHERE id = ?', [await bcrypt.hash(new_password, 10), admin.id]);
    res.json({ message: 'Your password was changed.' });
  } catch (e) {
    next(e);
  }
});

export default router;
