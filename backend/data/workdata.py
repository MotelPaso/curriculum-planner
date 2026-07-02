import json
import psycopg2
import os
from psycopg2.extras import execute_batch
from dotenv import load_dotenv

load_dotenv()
DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'port': os.getenv('DB_PORT'),
    'sslmode': 'require'
}
def formatTitle(title: str) -> str:
    ROMANS = {'I', 'II', 'III'}
    words = title.strip().title().split()
    formatted = []
    for i, word in enumerate(words):
        if word.upper() in ROMANS:
            formatted.append(word.upper())
        else:
            formatted.append(word)
    return ' '.join(formatted)
CAREER = 'ICCI'
courses = []
prerequisites = []
with open(f'{CAREER}.json', 'r') as file:
  data = json.load(file)

for course in data['advancement']:
  course_data = {
    'code': course['originalCourse']['code'],
    'title': formatTitle(course['originalCourse']['name']),
    'credits': course['originalCourse']['credits'],
    'semester' : course['semester'],
    'approvalRate': course['originalCourse']['approvalRate'],
    'isElective': course['originalCourse']['requiresElectiveLine'],
    'career': CAREER,
  }
  courses.append(course_data)
  for code in course['originalCourse']['prerequisites']:
    if any(pattern in code for pattern in ('DCCB', 'ECIN', 'MNOR', 'SSED')):
        prerequisites.append({
        "code": course_data['code'],
        "prereq_code": code,
        "career": CAREER})


conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()
try:
    # primero inserto todo a la base de datos
    execute_batch(cur, """
    INSERT INTO courses (code, career, title, credits, semester, approvalrate, isElective)
    VALUES (%(code)s, %(career)s, %(title)s, %(credits)s, %(semester)s, %(approvalRate)s, %(isElective)s)
    ON CONFLICT (code, career) DO UPDATE SET
        title        = EXCLUDED.title,
        credits      = EXCLUDED.credits,
        semester     = EXCLUDED.semester,
        approvalrate = EXCLUDED.approvalrate,
        isElective   = EXCLUDED.isElective
    """, courses)

    # consigo la id y la convierto en un diccionario
    cur.execute("SELECT id, code, career FROM courses")
    course_map = {(row[1], row[2]): row[0] for row in cur.fetchall()}

    prereq_rows = []
    missing = []
    for p in prerequisites:
        key = (p["prereq_code"], p["career"])
        if key not in course_map:
            missing.append(p["prereq_code"])
            continue
        prereq_rows.append({
            "course_id": course_map[(p["code"], p["career"])],
            "prereq_id": course_map[key]
        })

    if missing:
        print(f"Skipped {len(missing)} unknown prerequisites: {missing}")
    execute_batch(cur, """
    INSERT INTO prerequisites (course_id, prereq_id)
    VALUES (%(course_id)s, %(prereq_id)s)
    ON CONFLICT DO NOTHING
    """, prereq_rows)

    conn.commit()
    print(f"Inserted {len(courses)} courses and {len(prerequisites)} prerequisites.")
except Exception as e:
    conn.rollback()
    print(f"Error: {e}")
    raise

finally:
    cur.close()
    conn.close()

