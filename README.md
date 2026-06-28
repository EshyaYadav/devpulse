# DevPulse

**DevPulse** is an AI-Powered Smart Watchman & Engineering Analyst. It silently watches a software team's GitHub activity in real time and uses 3 specialized AI agents to analyze every code push, showing everything live on a dashboard.

## Overview

- **Ingestion**: A GitHub Webhook sends commit/push data to our Node.js backend.
- **Queue**: Incoming events are queued in a lightweight SQLite database so data is never dropped.
- **AI Agents**: A polling worker picks up jobs and runs 3 agents in parallel using the Groq Free API (llama-3.3-70b-versatile).
  - 🛡️ **Security Sentinel**: Scans for secrets and vulnerabilities.
  - 🏗️ **Architecture Reviewer**: Checks code against `rules.json`.
  - 🧠 **HR & Productivity Analyst**: Analyzes burnout risk based on commit patterns and time of day.
- **Live Dashboard**: A React frontend receives agent results in real time via Socket.io, displaying them like a live stock ticker feed.

## Prerequisites

- Node.js (v18+)
- A Groq API Key (Free tier)

## Deploy for Free (Render + Vercel)

You can deploy this entire stack for **₹0** using Render and Vercel free tiers!

> **Note on SQLite Storage:** The Render free tier uses ephemeral disk storage. This means the SQLite database will reset on every redeploy or server restart. This is perfectly fine for a live demo or testing, but it is not suitable for permanent data storage in a production app.

### 1. Deploy the Backend on Render.com

1. Sign up/Log in to [Render.com](https://render.com).
2. Click **New** -> **Blueprint** (this uses the `render.yaml` file in the repo).
3. Connect your GitHub account and select this repository.
4. Render will automatically detect the backend settings from `render.yaml`.
5. Under the **Environment Variables** section, you will be prompted to provide values for:
   - `GROQ_API_KEY`: Your Groq API key.
   - `WEBHOOK_SECRET`: A random string you make up (e.g., `my_secret_123`). You will need this for GitHub later.
   - `FRONTEND_URL`: Set this to your existing Vercel frontend URL: `https://devpulse-murex.vercel.app`
6. Click **Apply** or **Create Web Service**. Wait for the deployment to finish and copy your new backend URL (e.g., `https://devpulse-backend-xxxx.onrender.com`).

### 2. Update the Frontend on Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and select your existing `devpulse-murex` project.
2. Navigate to **Settings** -> **Environment Variables**.
3. Add a new variable:
   - **Key**: `VITE_BACKEND_URL`
   - **Value**: Your Render backend URL (e.g., `https://devpulse-backend-xxxx.onrender.com`)
4. Click **Save**.
5. Go to the **Deployments** tab. Click the three dots next to your latest deployment and select **Redeploy**. This builds the frontend with the new backend URL.

### 3. Create the GitHub Webhook

1. Go to your GitHub repository on GitHub.com.
2. Click **Settings** -> **Webhooks** -> **Add webhook**.
3. Fill in the fields:
   - **Payload URL**: Your Render backend URL + `/webhook/github` (e.g., `https://devpulse-backend-xxxx.onrender.com/webhook/github`)
   - **Content type**: `application/json`
   - **Secret**: The exact same string you used for `WEBHOOK_SECRET` on Render (e.g., `my_secret_123`).
   - **Which events would you like to trigger this webhook?**: Select "Just the push event."
4. Click **Add webhook**.

Real commits pushed to your repository will now trigger live analysis on your deployed dashboard!

## Local Setup Instructions

### 1. Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file:
   Copy `.env.example` to `.env` and add your Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```
   *(Note: Never commit your `.env` file!)*

4. Run the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Navigate to the frontend folder (in a new terminal):
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the frontend development server:
   ```bash
   npm run dev
   ```

## Testing Locally (Without a real GitHub Repo)

You can test the entire flow locally using the provided simulation scripts.

1. Ensure both the backend and frontend are running.
2. Open the React dashboard in your browser (usually `http://localhost:5173`).
3. In a new terminal, run the simulation script from the `backend` folder:
   - On Linux/Mac or Git Bash (Windows):
     ```bash
     ./simulate-webhook.sh
     ```
   - On PowerShell (Windows):
     ```powershell
     .\simulate-webhook.ps1
     ```

### What you'll see happening:

- **Terminal Logs (Backend)**: You will see live narration of the process:
  `[Webhook] Received push event...` -> `[Worker] Picked up job ID...` -> `[Agent] Started analysis...` -> `[Worker] Job ID completed. Emitting socket event.`
- **Dashboard (Frontend)**: The React app will instantly update without refreshing. A new event card will slide in showing the commit details, and the 3 agent badges will display the severity, compliance score, and burnout risk in real time. The top stats header will also update automatically.
