import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()
DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'port': os.getenv('DB_PORT')
}


def getCourses():
  conn = psycopg2.connect(**DB_CONFIG)
  cur = conn.cursor(cursor_factory=RealDictCursor)

  cur.execute("SELECT code, title, credits, semester, approvalrate, iselective FROM courses WHERE career = 'ICCI';")
  courses = cur.fetchall()

  cur.execute("SELECT course_code, prerequisite_code FROM course_prerequisites;")
  prerequisites = cur.fetchall()

  prereq_map = {}
  for row in prerequisites:
      prereq_map.setdefault(row['course_code'], []).append(row['prerequisite_code'])

  for course in courses:
      course['prerequisites'] = prereq_map.get(course['code'], [])

  cur.close()
  conn.close()
  return list(courses)

courses = getCourses()
