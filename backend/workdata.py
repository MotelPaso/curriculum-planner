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
    'port': os.getenv('DB_PORT')
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
courses = []
prerequisites = []
with open('ICCI.json', 'r') as file:
  data = json.load(file)

for course in data['advancement']:
  course_data = {
    'code': course['originalCourse']['code'],
    'title': formatTitle(course['originalCourse']['name']),
    'credits': course['originalCourse']['credits'],
    'semester' : course['semester'],
    'approvalRate': course['originalCourse']['approvalRate'],
    'isElective': course['originalCourse']['requiresElectiveLine'],
    'career': 'ICCI'
  }
  courses.append(course_data)
  for code in course['originalCourse']['prerequisites']:
    if any(pattern in code for pattern in ('DCCB', 'ECIN', 'MNOR', 'SSED')):
      prerequisites.append((course_data['code'], code))


conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()
try:
    # Courses
    execute_batch(cur, """
        INSERT INTO courses (code, title, credits, semester, approvalRate, isElective, career)
        VALUES (%(code)s, %(title)s, %(credits)s, %(semester)s, %(approvalRate)s, %(isElective)s, %(career)s)
        ON CONFLICT (code) DO UPDATE SET
            title = EXCLUDED.title,
            credits = EXCLUDED.credits,
            semester = EXCLUDED.semester,
            approvalRate = EXCLUDED.approvalRate,
            isElective = EXCLUDED.isElective
    """, courses)

    # Prerequisites
    execute_batch(cur, """
        INSERT INTO course_prerequisites (course_code, prerequisite_code)
        VALUES (%s, %s)
        ON CONFLICT DO NOTHING
    """, prerequisites)

    conn.commit()
    print(f"Inserted {len(courses)} courses and {len(prerequisites)} prerequisites.")
except Exception as e:
    conn.rollback()
    print(f"Error: {e}")
    raise

finally:
    cur.close()
    conn.close()

