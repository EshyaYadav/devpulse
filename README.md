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

## Setup Instructions

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
