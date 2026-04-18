# Whiteboard Architect - Project Context

## 1. Project Overview
"Whiteboard Architect" is a production-grade full-stack application that transforms static whiteboard sketches (images) into working SQL scripts and database visualizations.
Users upload an image of a database schema, and the system uses Gemini 1.5 Flash to extract the schema, generating both an interactive diagram (React Flow) and optimized PostgreSQL DDL scripts (Monaco Editor).
The UI follows a premium "Brutalist" design system with smooth Framer Motion animations and glassmorphism.

## 2. Technology Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Runtime:** Bun (strictly for package management and script running)
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **Key Libraries:**
  - `reactflow` (Schema Visualization)
  - `@monaco-editor/react` (SQL Display/Editing)
  - `framer-motion` (Advanced Animations)

### Backend (Python)
- **Framework:** FastAPI
- **Security:** SlowAPI (Dual-layer Rate Limiting: IP + Global), CORS (Whitelist), Security Headers (OWASP)
- **AI Model:** Google Generative AI (Gemini 1.5 Flash)
- **Validation:** Pydantic (Strict mode with `extra="forbid"`)
- **Sanitization:** Bleach

## 3. Architecture & Directory Structure
```
/
├── backend/                # FastAPI Backend
│   ├── main.py             # Entry point (Rate limiting, Security, Routes)
│   ├── models.py           # Strict Pydantic Models (Schema definitions)
│   ├── services.py         # Gemini Logic & Graph Transformation
│   ├── requirements.txt    # Dependencies (slowapi, bleach, etc.)
│   └── .env                # GEMINI_API_KEY
├── frontend/               # Next.js Frontend
│   ├── src/app/            # App Router (Home, Whiteboard, Settings)
│   ├── src/app/api/        # Server-side proxy Route Handlers (reads BACKEND_API_URL at runtime)
│   │   ├── generate/       # Proxies POST /api/generate → FastAPI
│   │   ├── generate-data/  # Proxies POST /api/generate-data → FastAPI
│   │   └── deploy/         # Proxies /deploy/supabase, /deploy/firebase → FastAPI
│   ├── src/components/     # UI Components (DatabaseNode, Stitch System)
│   ├── .env.local          # BACKEND_API_URL (private) or NEXT_PUBLIC_API_URL (legacy)
│   └── tailwind.config.ts  # Design Tokens
└── context.md              # Single Source of Truth
```

## 4. Current Feature Status
- [x] **Project Foundation**
  - [x] Create `context.md`
  - [x] Initialize Next.js & FastAPI
  - [x] Implement File Headers for all core files
- [x] **Secure Backend**
  - [x] `/api/generate` Endpoint with Multi-part upload
  - [x] Dual-layer Rate Limiting (5 req/min for AI endpoints)
  - [x] Strict Schema Validation (Pydantic `extra="forbid"`)
  - [x] OWASP Security Headers & CORS Lockdown
- [x] **Premium Frontend**
  - [x] Whiteboard / SQL Generator (`/whiteboard`)
  - [x] Interactive React Flow Diagram with Custom Nodes
  - [x] Monaco Editor with JetBrains Mono font
  - [x] Global Layout & Navigation (Navbar, Sidebar)
  - [x] Home (Landing Page) with Premium Animations & Mesh Background
  - [x] Simplified Settings Page
  - [x] Environment-aware API requests
  - [x] Smooth Error Notifications (AnimatePresence)
  - [x] Fixed port collision and environment loading issues
  - [x] Persistent "Save Schema" and "Schema History" system (localStorage)
  - [x] **Multi-Dialect Support** (PostgreSQL, MySQL, SQLite, MSSQL)
  - [x] **Mock Data Generation** (AI-powered INSERT statements)

## 5. How to Run
### 1. Backend
```bash
cd backend
# 1. Create .env: GEMINI_API_KEY=your_key, ALLOWED_ORIGINS=http://localhost:3000
# 2. Install deps
pip install -r requirements.txt
# 3. Start server
python main.py
```

### 2. Frontend (Local)
```bash
cd frontend
# 1. Create .env.local: NEXT_PUBLIC_API_URL=http://localhost:8000
# 2. Install deps
bun install
# 3. Start dev server
bun run dev
```

## 6. Deployment Guide
### Backend (Railway)
1. **Push Code:** Push the `backend/` folder to a GitHub repository.
2. **New Project:** In Railway, select "Deploy from GitHub repo".
3. **Root Directory:** Set Root Directory to `/backend`.
4. **Environment Variables:**
   - `GEMINI_API_KEY`: Your Gemini API Key.
   - `ALLOWED_ORIGINS`: `https://your-vercel-app.vercel.app,http://localhost:3000` (Add frontend URL after deployment).
   - `PORT`: `8000` (Railway sets this automatically, but good to be aware).
5. **Start Command:** Railway automatically detects `Procfile` (`uvicorn main:app --host 0.0.0.0 --port $PORT`).

### Frontend (Vercel)
1. **Import Project:** Import the same GitHub repo in Vercel.
2. **Root Directory:** Set Root Directory to `/frontend`.
3. **Environment Variables (CRITICAL):**
   - `BACKEND_API_URL`: The **https** URL of your Railway backend (e.g., `https://web-production-1234.up.railway.app`).
   - This is a **private** server-side variable — do NOT prefix with `NEXT_PUBLIC_`.
   - The Next.js API Route Handlers in `src/app/api/` read this at **runtime** (not build time).
4. **Deploy:** Click Deploy.

### Post-Deployment
- Update `ALLOWED_ORIGINS` in Railway with the final Vercel URL.
- Redeploy Backend to apply changes.

## 7. Data Models
### Backend (Pydantic / SQL)
- `Column`: `name (str)`, `type (str)`, `is_primary_key (bool)`, `is_foreign_key (bool)`, `foreign_key_target (str?)`
- `TableModel`: `name (str)`, `columns (List[Column])`
- `Relationship`: `source_table (str)`, `target_table (str)`, `type (1:1|1:N|N:M)`, `source_column (str)`, `target_column (str)`
- `SchemaExtraction`: `tables (List[TableModel])`, `relationships (List[Relationship])`, `sql_code (str)`

### Frontend (React Flow)
- `DatabaseNode`: Custom node rendering table name and column list.
- `Edge`: Directed animated edge representing relationships.

## 7. API Contracts
### `POST /api/generate`
- **Request:** Multipart/Form-Data (Image File)
- **Rate Limit:** 5 requests per minute
- **Response:**
  ```json
  {
    "sql_code": "CREATE TABLE...",
    "graph_data": {
      "nodes": [...],
      "edges": [...]
    }
  }
  ```

## 7. Security Protocol
- **Rate Limiting:** Managed via `SlowAPI`.
- **Validation:** Every field is length-limited and strictly typed.
- **Headers:** `X-Frame-Options`, `X-Content-Type-Options`, `HSTS` enforced.
- **Privacy:** No user data or images are stored on disk; processed in-memory.
## 8. Technical Debt
- [x] Fix CORS preflight error handling with Railway backend.
- [x] Resilient API Url fetching `trim` padding error on Vercel deployment.
- [x] **Root-cause fix: 404 on /api/generate in production** — replaced `next.config.ts` rewrites (which baked `NEXT_PUBLIC_API_URL` at *build time*, silently falling back to `localhost:8000`) with server-side Next.js Route Handlers in `src/app/api/*/route.ts` that read `BACKEND_API_URL` at **request time**.
- [ ] Implement robust error handling for edge cases in graph transformation.
- [ ] Add unit tests for `services.py` transformation logic.
- [x] Implement local schema persistence (Saved via localStorage).
- [ ] Implement database-backed user authentication for saving schemas.
- [ ] Optimize React Flow re-rendering for large diagrams.
- [x] Add support for MySQL and SQLite DDL generation.
- [x] Refactor relative imports to absolute imports.
