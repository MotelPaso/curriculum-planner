<div align='center'><h1>Curriculum Planner</h1> </div>

A full-stack web app that helps students plan and visualize their academic curriculum, tracking their academic progress, prerequisites, and projecting future semesters based on credit limits and course dispersion rules.

## Features

- **Progress tracking** -> Check the prerequisites of each course and toggle between passed, currently taking and not passed. 
- **Semester projection** -> Automatically schedules remaining courses via topological sorting, respecting prerequisites, credit limits, and dispersion constraints
- **Privacy First** -> progress saved locally via `localStorage`, with no personal data saved on a server.

## Tech Stack

**Frontend**
- React + Vite
- ReactFlow (graph visualization)
- Tailwind CSS v4

**Backend**
- FastAPI
- PostgreSQL (via Supabase)
- `python-dotenv` for environment management

**Deployment**
- Frontend: GitHub Pages
- Backend: Render
- Database: Supabase

## Project Structure

```
curriculum-planner/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProyectionGraph.jsx   # ReactFlow-based curriculum graph
│   │   └── App.jsx
│   └── vite.config.js
├── backend/
│   ├── main.py                        # FastAPI app entrypoint
│   ├── proyeccion.py                  # getProyeccion() scheduling engine
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- Python 3.10+
- A PostgreSQL database (or Supabase project)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

Create a `.env` file with your database credentials:

```
DATABASE_URL=postgresql://user:password@host:port/dbname
```

Run the API:

```bash
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file with your Supabase credentials:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## How It Works

1. Students mark completed courses in the UI; progress is cascaded recursively across dependent prerequisites.
2. The projection engine (`getProyeccion()`) topologically schedules remaining courses across future semesters, respecting prerequisite order, per-semester credit limits, and course dispersion.
3. The result is rendered as an interactive graph via ReactFlow, showing the recommended semester-by-semester path.

## Roadmap

- [ ] Convert to a PWA via `vite-plugin-pwa`
- [ ] Add API rate limiting with `slowapi`
- [ ] Empty-state onboarding hints for new users
- [ ] Add elective states
- [ ] Ability to save and change my courses

## License

_Add your license here (e.g. MIT)._

## Author

Built by [Paulo Araya](https://github.com/MotelPaso).
