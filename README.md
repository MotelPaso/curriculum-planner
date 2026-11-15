<div align='center'><h1>Curriculum Planner</h1> </div>

A single-page web app that helps students plan and visualize their academic curriculum, tracking their academic progress, prerequisites, and projecting future semesters based on credit limits and course dispersion rules.

Everything runs in the browser: there is no backend, no database and no account. The curriculum data ships with the bundle and progress is stored in `localStorage`.

## Features

- **Progress tracking** -> Check the prerequisites of each course and toggle between passed, currently taking and not passed.
- **Semester projection** -> Automatically schedules remaining courses via topological sorting, respecting prerequisites, credit limits, and dispersion constraints
- **Minors** -> Replace the elective placeholders of a career with the courses of a chosen minor
- **Privacy First** -> progress saved locally via `localStorage`, with no personal data saved on a server.

## Tech Stack

- React + Vite
- ReactFlow (graph visualization)
- Tailwind CSS v4

## Project Structure

```
curriculum-planner/
├── frontend/
│   ├── src/
│   │   ├── data/                      # frozen curriculum (courses + minors)
│   │   ├── services/API.js            # local data access, keeps the old async API
│   │   ├── utils/proyeccion.js        # projection engine (port of the Python one)
│   │   └── components/
│   └── tests/                         # golden fixtures + vitest suite
├── scripts/
│   ├── build_data.py                  # dump -> frontend/src/data/*.json
│   └── gen_fixtures.py                # Python engine -> tests/fixtures/*.json
├── backend/                           # legacy FastAPI version, kept for reference
└── README.md
```

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

That's it. No `.env` file, no database, no API server.

Other commands:

```bash
npm run test     # golden-test the JS projection engine against the Python one
npm run build    # production build (base path /curriculum-planner/)
```

Deployments are handled by GitHub Actions on push to `master` (see [Deployment](#deployment)).

## How It Works

1. Students mark completed courses in the UI; progress is cascaded recursively across dependent prerequisites and saved to `localStorage`.
2. The projection engine (`src/utils/proyeccion.js`) topologically schedules remaining courses across future semesters, respecting prerequisite order, per-semester credit limits (32 SCT) and course dispersion.
3. The result is rendered as an interactive graph via ReactFlow, showing the recommended semester-by-semester path.

## Regenerating the data

`frontend/src/data/*.json` is generated from a PostgreSQL dump of the original Supabase project. Put the dump at the repo root (it is gitignored) and run:

```bash
python3 scripts/build_data.py   # dump -> frontend/src/data/
python3 scripts/gen_fixtures.py # regenerates the golden fixtures
cd frontend && npm run test
```

`scripts/build_data.py` parses the `COPY public.* FROM stdin` blocks directly, so no database server is required. Expected counts are asserted (60 ICCI / 59 ICI / 47 ITI courses, 13 minors), so a partial dump fails loudly instead of shipping a half-empty curriculum.

### Behaviour parity

The JS engine is a line-by-line port of `backend/connection.py::getProyeccion`. `scripts/gen_fixtures.py` runs the real Python implementation over the frozen data and records its output for 101 career/minor/progress combinations; `npm run test` asserts the JS engine reproduces every one of them.

The generator reads `CREDIT_LIMIT` and `DISPERSION_LIMIT` straight out of `frontend/src/utils/proyeccion.js` (currently **32 SCT** and **3 semesters**) and applies them to the Python engine, so tuning the rules only means editing one constant and re-running:

```bash
python3 scripts/gen_fixtures.py && cd frontend && npm test
```

One quirk is deliberately preserved: only `UNFP-{4..8}0001` placeholders are swapped for minor courses, so careers with placeholders outside that range keep them.

## Deployment

`.github/workflows/deploy.yml` builds and publishes the app to GitHub Pages whenever `frontend/**` changes on `master` (or manually via *Run workflow*). It runs `npm ci`, the golden tests, `npm run build`, and then deploys `frontend/dist` with `actions/deploy-pages`.

One-time repository setup — **Settings → Pages → Source: GitHub Actions**. If the site was previously published from the `gh-pages` branch, switching the source retires that branch; the legacy `npm run deploy` script and `gh-pages` dev dependency can then be removed.

## Legacy backend

`backend/` still contains the FastAPI + PostgreSQL version. It is not used by the app anymore and is kept only as the reference implementation for the engine and the data import script (`backend/data/workdata.py`).

## Roadmap

- [ ] Make the minor placeholder substitution data-driven for every career
- [ ] Convert to a PWA via `vite-plugin-pwa`
- [ ] Empty-state onboarding hints for new users
- [ ] Add elective states
- [ ] Ability to save and change my courses

## License

MIT — see [LICENSE](LICENSE).

## Author

Built by [Paulo Araya](https://github.com/MotelPaso).
