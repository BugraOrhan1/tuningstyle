# Tuningstyle - 100% Cloud Deploy (geen lokale setup)

Deze setup gebruikt alleen cloud services:

- Frontend: Netlify
- Backend API: Render
- Database: MongoDB Atlas Free Tier

## 1. MongoDB Atlas (gratis)

1. Maak een account op MongoDB Atlas
2. Maak een Free Cluster
3. Maak een database user
4. Voeg Network Access toe (tijdelijk `0.0.0.0/0` of alleen Render egress)
5. Kopieer connection string voor `MONGO_URL`

## 2. Backend op Render

Bestand `render.yaml` staat al in de repo.

Deploy stappen:

1. Render > New > Blueprint
2. Koppel je GitHub repo
3. Render leest automatisch `render.yaml`
4. Zet deze env vars in Render service `tuningstyle-api`:

- `MONGO_URL` = Atlas URI
- `CORS_ORIGINS` = je Netlify URL (bv. `https://jouw-site.netlify.app`)

Deze zijn al in blueprint ingesteld:

- `DB_NAME=tuningstyle`
- `COOKIE_SECURE=true`
- `COOKIE_SAMESITE=none`
- `MONGO_TIMEOUT_MS=5000`
- `JWT_SECRET` wordt automatisch gegenereerd

Na deploy krijg je een backend URL, bv. `https://tuningstyle-api.onrender.com`.

## 3. Frontend op Netlify

Bestand `netlify.toml` staat al in de repo.

Deploy stappen:

1. Netlify > Add new site > Import an existing project
2. Kies je GitHub repo
3. Build settings worden uit `netlify.toml` gelezen
4. Voeg in Netlify environment variable toe:

- `REACT_APP_BACKEND_URL` = je Render backend URL

5. Trigger deploy

## 4. Belangrijk voor auth/cookies

Omdat de app cookie-based auth gebruikt:

- Backend moet HTTPS zijn (Render is HTTPS)
- Frontend moet HTTPS zijn (Netlify is HTTPS)
- `CORS_ORIGINS` moet exact je Netlify domein bevatten

## 5. Resultaat

Geen lokale runtime nodig. Alles draait cloud-only via:

- Netlify (frontend)
- Render (API)
- MongoDB Atlas (database)
