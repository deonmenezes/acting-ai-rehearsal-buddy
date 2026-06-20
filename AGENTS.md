# Acting AI Rehearsal Buddy

An AI-powered acting rehearsal tool that performs real-time facial expression analysis via webcam to give performers feedback during practice sessions.

## Tech Stack

- **Backend**: Python, Flask, Flask-CORS, DeepFace (facial analysis), Pillow, NumPy
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Radix UI / shadcn/ui, Supabase
- **Package Manager**: yarn (frontend), pip (backend)

## Setup

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env   # configure any needed env vars

# Frontend
cd frontend
yarn install
```

## Build / Run / Test

```bash
# Backend — development server (Flask default port 5000)
cd backend
python app.py

# Frontend — development server (Vite, default port 5173)
cd frontend
yarn dev

# Frontend — production build
yarn build

# Frontend — preview production build
yarn preview

# Frontend — lint
yarn lint
```

## Project Structure

```
backend/
  app.py                # Flask app entry point, routes
  facial_analysis.py    # DeepFace facial expression analysis logic
  utils.py              # Shared utility functions
  requirements.txt      # Python dependencies
frontend/
  src/
    App.tsx             # Root React component
    pages/              # Page-level components
    components/         # Reusable UI components
    hooks/              # Custom React hooks
    services/           # API client / service layer
    integrations/       # Third-party integrations (Supabase, etc.)
    lib/                # Utility functions
  supabase/             # Supabase local config / migrations
  vite.config.ts        # Vite build configuration
  tsconfig.json         # TypeScript config
```

## Architecture & Key Files

- `backend/app.py` — Flask server; exposes endpoints for single-frame and batch facial analysis
- `backend/facial_analysis.py` — wraps DeepFace to return dominant emotion, emotion scores, and timeline data
- `frontend/src/services/` — HTTP calls to the Flask backend
- `frontend/src/integrations/` — Supabase client configuration (auth, data persistence)
- `frontend/supabase/` — local Supabase project config; run `supabase start` for local dev

## Conventions & Notes for Agents

- DeepFace downloads model weights on first run; ensure internet access and adequate disk space (~500 MB).
- The backend expects image data as base64 or multipart form; check `app.py` route signatures before modifying the frontend API calls.
- Supabase is used for auth and possibly storing session history; set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `frontend/.env`.
- Flask CORS is wide-open in development; restrict origins before deploying.
- numpy version is pinned to `1.24.3` for DeepFace compatibility — do not upgrade without testing.
