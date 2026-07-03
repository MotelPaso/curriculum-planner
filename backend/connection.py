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
    'port': os.getenv('DB_PORT'),
    'sslmode': 'require'
}
print("DB_HOST:", os.getenv('DB_HOST'))
cache: dict[str, list] = {}
CREDIT_LIMIT = 32
DISPERSION_LIMIT = 2

def getCourses(career: str):
    if career in cache and cache[career] != []:
        return cache[career]

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    print("Connected!")
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
    cache[career] = list(courses)

    return cache[career]


DISPERSION_LIMIT = 2

def checkDispersion(course, leastSemester):
    return course['semester'] - leastSemester < DISPERSION_LIMIT

def checkPrereqs(course, passedCourses):
    return all(code in passedCourses for code in course['prerequisites'])

def getProyeccion(courses_sent: list, career: str):
    courses = getCourses(career)
    proyection = {}
    internships = ['ECIN-08606', 'ECIN-08266', 'ECIN-08616']
    credits = 0
    semester = 1
    leastSemester = 1
    if courses_sent:
        for course in courses:
            if course['code'] not in courses_sent:
                break
            semester = course['semester'] if course['semester'] > semester else semester
        semester += 1

    currCourses: list = []
    passedCourses: list = [] + courses_sent
    skippedCourses: list = []

    for i in range(len(courses)):
        course = courses[i]
        if course['code'] in internships:
            continue
        if course['code'] in passedCourses:
            continue
        if not checkPrereqs(course, passedCourses):
            skippedCourses.append(course)
            continue
        if currCourses and not checkDispersion(course, leastSemester):
            skippedCourses.append(course)
            continue
        if credits + course['credits'] > CREDIT_LIMIT:
            proyection[semester] = {'courses': [c['code'] for c in currCourses], 'credits': credits}
            credits = 0
            semester += 1
            passedCourses += [c['code'] for c in currCourses]
            currCourses.clear()

            temp = []
            for skip in skippedCourses:
                fits_credits = credits + skip['credits'] <= CREDIT_LIMIT
                fits_dispersion = not currCourses or checkDispersion(skip, min(c['semester'] for c in currCourses))
                if checkPrereqs(skip, passedCourses) and fits_credits and fits_dispersion:
                    currCourses.append(skip)
                    credits += skip['credits']
                else:
                    temp.append(skip)
            skippedCourses.clear()
            skippedCourses += temp

        credits += course['credits']
        currCourses.append(course)
        leastSemester = min([c['semester'] for c in currCourses])

    if currCourses:
        proyection[semester] = {'courses': [c['code'] for c in currCourses], 'credits': credits}
        passedCourses += [c['code'] for c in currCourses]
        semester += 1

    while skippedCourses:
        currCourses = []
        credits = 0
        leastSemester = None
        temp = []
        for skip in skippedCourses:
            fits_credits = credits + skip['credits'] <= CREDIT_LIMIT
            fits_dispersion = leastSemester is None or checkDispersion(skip, leastSemester)
            if checkPrereqs(skip, passedCourses) and fits_credits and fits_dispersion:
                currCourses.append(skip)
                credits += skip['credits']
                leastSemester = skip['semester'] if leastSemester is None else min(leastSemester, skip['semester'])
            else:
                temp.append(skip)
        if not currCourses:
            proyection[semester] = {'courses': [c['code'] for c in temp], 'credits': 0}
            break
        proyection[semester] = {'courses': [c['code'] for c in currCourses], 'credits': credits}
        passedCourses += [c['code'] for c in currCourses]
        semester += 1
        skippedCourses = temp

    return proyection