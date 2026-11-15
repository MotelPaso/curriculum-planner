#!/usr/bin/env python3
"""Generate golden fixtures for the JavaScript projection engine.

Runs the real Python implementation (`backend/connection.py::getProyeccion`)
against the frozen frontend data and writes the results to
`frontend/tests/fixtures/proyeccion.json`, which `npm run test` asserts the JS
port against.

The Python module is imported with `psycopg2` and `variables` stubbed out, and
its data accessors are replaced by the frozen JSON, so no database is needed.

Usage:
    python3 scripts/gen_fixtures.py
"""

from __future__ import annotations

import json
import random
import sys
import types
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = REPO_ROOT / "backend"
DATA_DIR = REPO_ROOT / "frontend" / "src" / "data"
FIXTURE_PATH = REPO_ROOT / "frontend" / "tests" / "fixtures" / "proyeccion.json"

CAREERS = ("ICCI", "ICI", "ITI")


def load_data() -> tuple[dict[str, list[dict]], list[dict]]:
    courses = {}
    for career in CAREERS:
        payload = json.loads((DATA_DIR / f"courses.{career}.json").read_text("utf-8"))
        # getCourses() ordered by semester; build_data.py sorts by (semester, code).
        courses[career] = sorted(payload, key=lambda c: (c["semester"], c["code"]))
    minors = json.loads((DATA_DIR / "minors.json").read_text("utf-8"))
    return courses, minors


def import_engine():
    """Import backend/connection.py without a database driver."""
    psycopg2 = types.ModuleType("psycopg2")
    extra = types.ModuleType("psycopg2.extras")
    extra.RealDictCursor = object
    psycopg2.extras = extra
    variables = types.ModuleType("variables")
    variables.DB_CONFIG = {}

    sys.modules.setdefault("psycopg2", psycopg2)
    sys.modules.setdefault("psycopg2.extras", extra)
    sys.modules.setdefault("variables", variables)
    sys.path.insert(0, str(BACKEND_DIR))

    import connection  # noqa: PLC0415  (must follow the stubs above)

    return connection


def profiles(courses: list[dict]) -> list[list[str]]:
    """Deterministic mix of progress profiles."""
    codes = [course["code"] for course in courses]
    semester_prefix = []
    buckets = {}
    for code, course in zip(codes, courses):
        buckets.setdefault(course["semester"], []).append(code)

    result: list[list[str]] = [[]]
    for max_semester in (1, 3, 5, 7, 9):
        prefix = [
            code
            for course in courses
            if course["semester"] <= max_semester
            for code in [course["code"]]
        ]
        result.append(prefix)
        semester_prefix.append(prefix)

    result.append(codes)
    result.append(codes[:1])
    result.append([code for code in codes if codes.index(code) % 2 == 0])
    result.append([code for code in codes if codes.index(code) % 3 == 0])
    result.append([code for code in codes if code.startswith("UNFP-")])
    result.append([code for code in codes if code.startswith("ECIN-008")])

    rng = random.Random(20260918)
    for _ in range(5):
        result.append(sorted(rng.sample(codes, k=max(1, len(codes) // 3))))

    deduped = []
    seen = set()
    for profile in result:
        key = tuple(profile)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(list(profile))
    return deduped


def main() -> int:
    courses_by_career, minors = load_data()
    connection = import_engine()

    connection.getCourses = lambda career: courses_by_career[career]
    connection.getMinorCourses = lambda minor_id: next(
        minor["courses"] for minor in minors if minor["id"] == minor_id
    )

    fixtures = []
    for career in CAREERS:
        for sent in profiles(courses_by_career[career]):
            fixtures.append(
                {
                    "career": career,
                    "courses_sent": sent,
                    "minor_id": 0,
                    "proyeccion": connection.getProyeccion(sent, career, 0),
                }
            )

    for minor in minors:
        career = minor["career"]
        career_courses = courses_by_career[career]
        base_profiles = profiles(career_courses)
        # A representative slice keeps the fixture file small.
        for index in (0, 2, 3, -1):
            sent = base_profiles[index % len(base_profiles)]
            fixtures.append(
                {
                    "career": career,
                    "courses_sent": sent,
                    "minor_id": minor["id"],
                    "proyeccion": connection.getProyeccion(
                        sent, career, minor["id"]
                    ),
                }
            )

    FIXTURE_PATH.parent.mkdir(parents=True, exist_ok=True)
    FIXTURE_PATH.write_text(
        json.dumps(fixtures, ensure_ascii=False, indent="\t") + "\n", encoding="utf-8"
    )
    print(
        f"wrote {FIXTURE_PATH.relative_to(REPO_ROOT)} "
        f"({len(fixtures)} fixtures, {len(minors)} minors)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
