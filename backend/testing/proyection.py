CREDITLIMIT = 15

def getProyeccion(courses_sent: list, sample_courses):
    proyection = {}
    credits = 0
    semester = 2
    currCourses: list = []

    for course in sample_courses:
        if course['code'] in courses_sent or course['code'] in currCourses:
            continue

        prereqs_met = all(code in courses_sent or code in currCourses for code in course['prerequisites'])
        if not prereqs_met:
            continue

        if credits + course['credits'] > CREDITLIMIT:
            proyection[semester] = {'courses': currCourses, 'credits': credits}
            credits = 0
            semester += 1
            courses_sent = courses_sent + currCourses
            currCourses = []
        credits += course['credits']
        currCourses.append(course['code'])

    if currCourses:
        proyection[semester] = {'courses': currCourses, 'credits': credits}

    return proyection

sample_courses = [
    {"code": "MAT101", "name": "Cálculo I", "semester": 1, "credits": 5, "prerequisites": []},
    {"code": "FIS101", "name": "Física I", "semester": 1, "credits": 5, "prerequisites": []},
    {"code": "ICI101", "name": "Introducción a la Ingeniería", "semester": 1, "credits": 5, "prerequisites": []},
    {"code": "MAT102", "name": "Cálculo II", "semester": 2, "credits": 5, "prerequisites": ["MAT101"]},
    {"code": "FIS102", "name": "Física II", "semester": 2, "credits": 5, "prerequisites": ["FIS101", "MAT101"]},
    {"code": "ICI102", "name": "Programación", "semester": 2, "credits": 4, "prerequisites": ["ICI101"]},
    {"code": "MAT201", "name": "Cálculo III", "semester": 3, "credits": 5, "prerequisites": ["MAT102"]},
    {"code": "ICI201", "name": "Estructuras de Datos", "semester": 3, "credits": 4, "prerequisites": ["ICI102"]},
    {"code": "ICI202", "name": "Arquitectura de Computadores", "semester": 3, "credits": 4, "prerequisites": ["FIS102"]},
    {"code": "ICI301", "name": "Algoritmos", "semester": 4, "credits": 4, "prerequisites": ["ICI201"]},
    {"code": "ICI302", "name": "Bases de Datos", "semester": 4, "credits": 4, "prerequisites": ["ICI201"]},
    {"code": "ICI401", "name": "Redes", "semester": 5, "credits": 4, "prerequisites": ["ICI302", "ICI202"]},
]

print(getProyeccion(["MAT101", "FIS101"], sample_courses))
