import psycopg2
from psycopg2.extras import RealDictCursor
from variables import DB_CONFIG

cache: dict[str, list] = {}
minor_cache = {}
CREDIT_LIMIT = 32
DISPERSION_LIMIT = 2
PLACEHOLDER_ELECTIVE_CODES = {f"UNFP-{sem}0001": sem for sem in range(4, 9)}

def getCourses(career: str):
    if career in cache and cache[career] != []:
        return cache[career]

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT code, title, credits, semester, approvalrate, iselective
        FROM courses
        WHERE career = %s AND is_minor = false
        ORDER BY semester
    """, (career,))
    courses = cur.fetchall()

    cur.execute("""
        SELECT c1.code AS course_code, c2.code AS prereq_code
        FROM prerequisites p
        JOIN courses c1 ON c1.id = p.course_id
        JOIN courses c2 ON c2.id = p.prereq_id
        WHERE c1.career = %s AND c1.is_minor = false
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

def getMinorCourses(minor_id: int):
    if minor_id == 0:
        return []
    if minor_id in minor_cache and minor_cache[minor_id] != []:
        return minor_cache[minor_id]

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT c.id, c.code, c.title, c.credits, c.approvalrate, c.iselective, mc.position, m.start_semester
        FROM minor_courses mc
        JOIN courses c ON c.id = mc.course_id
        JOIN minors m ON m.id = mc.minor_id
        WHERE mc.minor_id = %s
        ORDER BY mc.position
    """, (minor_id,))
    courses = cur.fetchall()
    for course in courses:
        course['semester'] = course['start_semester'] + course['position'] - 1

    minor_codes = {c['code'] for c in courses}

    course_ids = [c['id'] for c in courses]
    cur.execute("""
        SELECT c1.code AS course_code, c2.code AS prereq_code
        FROM prerequisites p
        JOIN courses c1 ON c1.id = p.course_id
        JOIN courses c2 ON c2.id = p.prereq_id
        WHERE p.course_id = ANY(%s)
    """, (course_ids,))
    prerequisites = cur.fetchall()

    prereq_map = {}
    for row in prerequisites:
        prereq_map.setdefault(row['course_code'], []).append(row['prereq_code'])

    for i, course in enumerate(courses):
        # Only keep prereqs that AREN'T other minor courses (real external deps)
        external = [p for p in prereq_map.get(course['code'], []) if p not in minor_codes]
        # Re-derive the in-minor chain from position, ignoring whatever's stored globally
        chain = [courses[i - 1]['code']] if i > 0 else []
        course['prerequisites'] = external + chain
        course.pop('id', None)

    cur.close()
    conn.close()
    minor_cache[minor_id] = list(courses)
    return minor_cache[minor_id]




def checkDispersion(course, leastSemester):
    return course['semester'] - leastSemester < DISPERSION_LIMIT

def checkPrereqs(course, passedCourses):
    return all(code in passedCourses for code in course['prerequisites'])

def getProyeccion(courses_sent: list, career: str, minor_id: int | None = None):
    courses = getCourses(career)

    if minor_id is not None and minor_id != 0:
        minor_courses = getMinorCourses(minor_id)
        minor_by_semester = {c['semester']: c for c in minor_courses}
        # 5: c
        # 6: c
        # 7: c ...

        new_courses = []
        for course in courses:
            if course['code'] in PLACEHOLDER_ELECTIVE_CODES:
                semester = PLACEHOLDER_ELECTIVE_CODES[course['code']]
                new_courses.append(minor_by_semester[semester])
            else:
                new_courses.append(course)
        courses = new_courses


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