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


def getCourses(career: str):
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT code, title, credits, semester, approvalrate, iselective
        FROM courses
        WHERE career = %s
    """, (career,))
    courses = cur.fetchall()

    cur.execute("""
        SELECT c1.code AS course_code, c2.code AS prereq_code
        FROM prerequisites p
        JOIN courses c1 ON c1.id = p.course_id
        JOIN courses c2 ON c2.id = p.prereq_id
        WHERE c1.career = %s
    """, (career,))
    prerequisites = cur.fetchall()

    prereq_map = {}
    for row in prerequisites:
        prereq_map.setdefault(row['course_code'], []).append(row['prereq_code'])

    for course in courses:
        course['prerequisites'] = prereq_map.get(course['code'], [])

    cur.close()
    conn.close()
    return list(courses)

def getProyection(courses: dict[str]):

    return None

