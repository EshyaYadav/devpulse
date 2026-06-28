# DevPulse 🚀 (Vercel + Turso Edition)

**DevPulse** is an AI-Powered Smart Watchman & Engineering Analyst that silently watches a software team's GitHub activity in real time and uses 3 specialized AI agents to analyze every code push. 

This version runs **100% free on Vercel Serverless Functions** and uses **Turso (libSQL)** as its database.

## Architecture Highlights
- **Vercel Serverless Webhook**: The GitHub push payload hits `/api/webhook/github`. It synchronously runs all 3 LLM agents (via Groq API) and stores the results directly into Turso.
- **Turso Database**: A serverless SQLite-compatible database to persist events and agent results.
- **React Frontend**: The frontend polls `/api/activity` to stream new analysis results seamlessly onto the live dashboard.

## 1. Create your Turso Database (Free)
1. Go to [turso.tech](https://turso.tech) and sign up for a free account.
2. Install the Turso CLI or use their web dashboard to create a new database.
3. Once created, you need two things:
   - Your **Database URL** (looks like `libsql://your-db-name.turso.io`)
   - Your **Auth Token**
4. Copy these somewhere safe.

## 2. Deploy on Vercel
1. Push this repository to your GitHub account.
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Set the **Framework Preset** to **Vite** (Vercel will usually auto-detect this).
5. Set the **Root Directory** to `frontend`. *(Crucial: This tells Vercel to build your React app while simultaneously deploying the `api/` folder inside as serverless functions!)*
6. Open the **Environment Variables** section and add the following:
   - `GROQ_API_KEY`: Your Groq free API key.
   - `TURSO_DATABASE_URL`: The Turso database URL you copied earlier.
   - `TURSO_AUTH_TOKEN`: The Turso authentication token you copied earlier.
7. Click **Deploy**. Vercel will build your frontend and deploy your serverless APIs automatically.

## 3. Set Up the GitHub Webhook
1. Go to your target GitHub repository (the one you want to monitor) → **Settings** → **Webhooks** → **Add webhook**.
2. **Payload URL**: `https://YOUR-VERCEL-URL.vercel.app/api/webhook/github` (replace with your actual Vercel domain).
3. **Content type**: Select `application/json`.
4. **Which events would you like to trigger this webhook?**: Select "Just the push event."
5. Click **Add webhook**.

*Note: As soon as someone pushes code to that repo, DevPulse will process it using serverless AI agents and save it to Turso!*

## Testing Locally
If you want to run this locally:
1. `cd frontend`
2. Create a `.env` file in the `frontend` folder with your `GROQ_API_KEY`, `TURSO_DATABASE_URL`, and `TURSO_AUTH_TOKEN`.
3. Run `npm install` and then `npm run dev` to start the frontend and local API routes.
4. You can send test payloads to `http://localhost:5173/api/webhook/github`.
