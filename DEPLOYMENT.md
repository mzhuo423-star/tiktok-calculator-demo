# Deployment: Vercel + Railway

This project is split into two deployable services:

- `backend/`: Express API, deploy to Railway.
- `frontend/`: static website, deploy to Vercel.

## 1. Deploy Backend To Railway

1. Push this project to GitHub.
2. In Railway, create a new project from the GitHub repo.
3. Set the service root directory to `backend`.
4. Railway will use `backend/railway.json` and run `npm start`.
5. In the backend service settings, open `Networking -> Public Networking` and choose `Generate Domain`.
6. Copy the generated domain, for example:

```text
https://your-backend.up.railway.app
```

7. Add this Railway variable after the Vercel domain is known:

```text
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

For local debugging, you can keep:

```text
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.vercel.app
```

## 2. Deploy Frontend To Vercel

1. In Vercel, import the same GitHub repo.
2. Set the project root directory to `frontend`.
3. Vercel will use `frontend/vercel.json`.
4. Add this Vercel environment variable:

```text
VERCEL_API_BASE=https://your-backend.up.railway.app/api
```

5. Deploy the project.

## 3. Final CORS Update

After Vercel gives you the production URL, go back to Railway and set:

```text
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

Then redeploy or restart the Railway backend.

## 4. Local Checks

Backend:

```bash
cd backend
npm start
```

Frontend static preview:

```bash
cd frontend
python -m http.server 5173
```

Production-style frontend build:

```bash
cd frontend
npm run build
```

The build output is written to `frontend/dist`.
