import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { initDb } from './db.js';
import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploads = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploads, { recursive: true });

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use('/uploads', express.static(uploads));

app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// In production one service serves both the API and the built React app.
const dist = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api\/|uploads\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

const port = process.env.PORT || 5000;
initDb()
  .then(() => app.listen(port, () => console.log(`API running on http://localhost:${port}`)))
  .catch((err) => {
    console.error('Database setup failed:', err.message);
    process.exit(1);
  });
