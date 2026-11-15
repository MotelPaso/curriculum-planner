#!/usr/bin/env python3
"""Build the frontend's frozen curriculum data from a PostgreSQL cluster dump.

Reads the ``COPY public.* FROM stdin`` blocks of the dump (no database server
needed) and writes the JSON files consumed by the frontend:

    frontend/src/data/courses.ICCI.json
    frontend/src/data/courses.ICI.json
    frontend/src/data/courses.ITI.json
    frontend/src/data/minors.json

Usage:
    python3 scripts/build_data.py [--dump PATH] [--out DIR]
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DUMP = REPO_ROOT / "db_cluster-18-09-2026@20-39-28.backup"
DEFAULT_OUT = REPO_ROOT / "frontend" / "src" / "data"

# Column order in the dump's COPY statements.
COURSES_COLS = (
    "id code career title credits semester approvalrate iselective is_minor"
).split()
MINOR_COURSES_COLS = ["minor_id", "course_id", "position"]
MINORS_COLS = ["id", "name", "career", "start_semester"]
PREREQUISITES_COLS = ["course_id", "prereq_id"]

# Expected row counts for the 18-09-2026 dump; guards against silent drift.
EXPECTED_BASE_COURSES = {"ICCI": 60, "ICI": 59, "ITI": 47}
EXPECTED_MINORS = 13
EXPECTED_PREREQUISITES = 251


def read_copy_blocks(dump_path: Path) -> dict[str, list[dict[str, str]]]:
    """Return {table: [ {column: value}, ... ]} for every public.* COPY block."""
    wanted = {
        "courses": COURSES_COLS,
        "minor_courses": MINOR_COURSES_COLS,
        "minors": MINORS_COLS,
        "prerequisites": PREREQUISITES_COLS,
    }
    tables: dict[str, list[dict[str, str]]] = defaultdict(list)
    current: str | None = None

    with dump_path.open(encoding="utf-8") as handle:
        for raw_line in handle:
            line = raw_line.rstrip("\n")
            if line.startswith("COPY public."):
                table = line.split()[1].split(".", 1)[1]
                current = table if table in wanted else None
                continue
            if current is None:
                continue
            if line == "\\.":
                current = None
                continue
            values = line.split("\t")
            columns = wanted[current]
            if len(values) != len(columns):
                raise SystemExit(
                    f"unexpected column count in {current}: "
                    f"{len(values)} != {len(columns)}"
                )
            tables[current].append(dict(zip(columns, values)))

    missing = [table for table in wanted if table not in tables]
    if missing:
        raise SystemExit(f"dump is missing table data for: {', '.join(missing)}")
    return dict(tables)


def as_int(value: str) -> int:
    return int(value)


def as_float(value: str) -> float:
    return float(value)


def as_bool(value: str) -> bool:
    return value.lower() in {"t", "true"}


def build(dump_path: Path, out_dir: Path) -> None:
    tables = read_copy_blocks(dump_path)

    courses = tables["courses"]
    by_id = {as_int(course["id"]): course for course in courses}

    # course_code -> [prereq_code], mirroring backend/connection.py ordering
    prereqs_by_course_id: dict[int, list[int]] = defaultdict(list)
    for row in sorted(
        tables["prerequisites"], key=lambda r: (as_int(r["course_id"]), as_int(r["prereq_id"]))
    ):
        prereqs_by_course_id[as_int(row["course_id"])].append(as_int(row["prereq_id"]))

    for row in courses:
        course_id = as_int(row["id"])
        for prereq_id in prereqs_by_course_id.get(course_id, []):
            if prereq_id not in by_id:
                raise SystemExit(
                    f"course {row['code']} references unknown prerequisite id {prereq_id}"
                )

    careers = sorted({course["career"] for course in courses})

    minors: list[dict] = []
    minors_by_id = {}
    for row in sorted(tables["minors"], key=lambda r: (r["career"], as_int(r["id"]))):
        minor = {
            "id": as_int(row["id"]),
            "name": row["name"],
            "career": row["career"],
            "start_semester": as_int(row["start_semester"]),
            "courses": [],
        }
        minors.append(minor)
        minors_by_id[minor["id"]] = minor

    # Mirrors connection.getMinorCourses: semester derived from start_semester +
    # position, prerequisites are "external" deps only, plus the chain from the
    # previous position in the minor.
    minor_courses_by_minor: dict[int, list[dict]] = defaultdict(list)
    for row in sorted(
        tables["minor_courses"],
        key=lambda r: (as_int(r["minor_id"]), as_int(r["position"])),
    ):
        minor_id = as_int(row["minor_id"])
        if minor_id not in minors_by_id:
            raise SystemExit(f"minor_courses references unknown minor {minor_id}")
        course = by_id.get(as_int(row["course_id"]))
        if course is None:
            raise SystemExit(
                f"minor_courses references unknown course {row['course_id']}"
            )
        minor_courses_by_minor[minor_id].append(
            {
                "code": course["code"],
                "title": course["title"],
                "credits": as_int(course["credits"]),
                "approvalrate": as_float(course["approvalrate"]),
                "iselective": as_bool(course["iselective"]),
                "semester": minors_by_id[minor_id]["start_semester"]
                + as_int(row["position"])
                - 1,
            }
        )

    for minor in minors:
        chain_courses = minor_courses_by_minor.get(minor["id"], [])
        minor_codes = {course["code"] for course in chain_courses}
        for index, course in enumerate(chain_courses):
            course_id = next(
                cid for cid, src in by_id.items() if src["code"] == course["code"]
            )
            external = [
                by_id[prereq_id]["code"]
                for prereq_id in prereqs_by_course_id.get(course_id, [])
                if by_id[prereq_id]["code"] not in minor_codes
            ]
            chain = [chain_courses[index - 1]["code"]] if index > 0 else []
            course["prerequisites"] = external + chain
        minor["courses"] = chain_courses

    out_dir.mkdir(parents=True, exist_ok=True)
    payloads = {}

    for career in careers:
        base = [
            {
                "code": course["code"],
                "title": course["title"],
                "credits": as_int(course["credits"]),
                "semester": as_int(course["semester"]),
                "approvalrate": as_float(course["approvalrate"]),
                "iselective": as_bool(course["iselective"]),
                "prerequisites": [
                    by_id[prereq_id]["code"]
                    for prereq_id in prereqs_by_course_id.get(as_int(course["id"]), [])
                    if not as_bool(by_id[prereq_id]["is_minor"])
                ],
            }
            for course in courses
            if course["career"] == career and not as_bool(course["is_minor"])
        ]
        base.sort(key=lambda c: (c["semester"], c["code"]))
        payloads[f"courses.{career}.json"] = base

        expected = EXPECTED_BASE_COURSES.get(career)
        if expected is not None and len(base) != expected:
            raise SystemExit(
                f"{career}: expected {expected} base courses, found {len(base)}"
            )

    payloads["minors.json"] = minors

    if len(minors) != EXPECTED_MINORS:
        raise SystemExit(f"expected {EXPECTED_MINORS} minors, found {len(minors)}")
    if len(tables["prerequisites"]) != EXPECTED_PREREQUISITES:
        raise SystemExit(
            f"expected {EXPECTED_PREREQUISITES} prerequisite rows, "
            f"found {len(tables['prerequisites'])}"
        )

    for filename, data in payloads.items():
        target = out_dir / filename
        target.write_text(
            json.dumps(data, ensure_ascii=False, indent="\t") + "\n", encoding="utf-8"
        )
        count = len(data) if isinstance(data, list) else len(data.get("courses", data))
        print(f"wrote {target.relative_to(REPO_ROOT)} ({count} entries)")

    # Summary for the operator.
    print()
    for career in careers:
        base = payloads[f"courses.{career}.json"]
        print(
            f"{career}: {len(base)} base courses, "
            f"{len({c['semester'] for c in base})} semesters, "
            f"{sum(1 for c in base if c['prerequisites'])} with prerequisites"
        )
    print(f"minors: {len(minors)} with {sum(len(m['courses']) for m in minors)} courses")


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dump", type=Path, default=DEFAULT_DUMP)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args(argv)

    if not args.dump.exists():
        print(f"dump not found: {args.dump}", file=sys.stderr)
        return 1

    build(args.dump, args.out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
