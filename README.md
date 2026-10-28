# Leafnest

MERN-style landing page (React + Vite, Express, MySQL) with a Django-style admin panel.

```
frontend/   React + Vite (landing page in src/site, admin panel in src/admin)
backend/    Express API + MySQL
```

## Run locally

1. Copy `backend/.env.example` to `backend/.env` and fill in your MySQL details.
2. `cd backend && npm install && npm run dev`
3. `cd frontend && npm install && npm run dev`

Site: http://localhost:5173, admin: http://localhost:5173/admin. Tables and sample content are created on first start.

## Deploy (Render + TiDB Cloud)

- Create a TiDB Cloud cluster and note its host, port (4000), user and password.
- Create a Render web service from this repo (`render.yaml` is included) and set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `ADMIN_PASSWORD` and `CLIENT_URL`.
- Render builds the React app and the Express server serves it together with the API.
- Note: Render's free disk is ephemeral, so images uploaded through the admin are lost on redeploy. Use `/images/...` paths for permanent images.
