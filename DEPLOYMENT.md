# Online deployment

Deze codebase draait nu lokaal, maar is geschikt om online te zetten als twee losse diensten:

1. Backend: FastAPI + MongoDB op Render
2. Frontend: React SPA op Vercel
3. Database: MongoDB Atlas

## Backend op Render

Gebruik als startcommand:

```bash
uvicorn server:app --host 0.0.0.0 --port $PORT
```

Stel deze environment variables in:

- `MONGO_URL` = je MongoDB Atlas connection string
- `DB_NAME` = `tuningstyle`
- `JWT_SECRET` = lange random secret
- `CORS_ORIGINS` = je frontend URL, bijvoorbeeld `https://your-frontend.vercel.app`
- `COOKIE_SECURE` = `true`
- `COOKIE_SAMESITE` = `lax`

Opmerking: de backend leest ook zonder `.env` uit de echte environment, dus dit werkt direct in hostingplatforms.

## Frontend op Vercel

Zet deze environment variable:

- `REACT_APP_BACKEND_URL` = de publieke URL van je backend, bijvoorbeeld `https://your-backend.onrender.com`

De file [frontend/vercel.json](frontend/vercel.json) zorgt ervoor dat browserroutes zoals `/files/123` of `/admin` altijd terugvallen op `index.html`.

## MongoDB Atlas

Maak een cluster aan en voeg je hosting-IP toe aan de network access list, of gebruik tijdelijk `0.0.0.0/0` tijdens testen.

## Snelste route

1. Maak MongoDB Atlas aan.
2. Deploy de backend op Render.
3. Kopieer de Render-URL naar `REACT_APP_BACKEND_URL` in Vercel.
4. Deploy de frontend op Vercel.
5. Voeg de Vercel-URL toe aan `CORS_ORIGINS` in Render.

## Controle

Na deployment moet dit werken:

- `https://your-frontend.vercel.app`
- `https://your-backend.onrender.com/api/vehicles/brands`
- Inloggen met de admin seed: `admin@fast-chiptuningfiles.com` / `admin1234`