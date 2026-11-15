import { describe, expect, it } from "vitest";
import { getProyeccion } from "../src/utils/proyeccion";
import { COURSES_BY_CAREER, MINOR_LIST } from "../src/data";
import fixtures from "./fixtures/proyeccion.json";

const EXPECTED_COURSES = { ICCI: 60, ICI: 59, ITI: 47 };

describe("curriculum data", () => {
	for (const [career, expected] of Object.entries(EXPECTED_COURSES)) {
		it(`${career} has ${expected} courses with resolvable prerequisites`, () => {
			const courses = COURSES_BY_CAREER[career];
			expect(courses).toHaveLength(expected);

			const codes = new Set(courses.map((course) => course.code));
			for (const course of courses) {
				for (const prereq of course.prerequisites) {
					expect(codes.has(prereq), `${course.code} -> ${prereq}`).toBe(true);
				}
			}
		});
	}

	it("every minor has one course per semester, chained by prerequisites", () => {
		expect(MINOR_LIST.length).toBeGreaterThan(0);
		for (const minor of MINOR_LIST) {
			expect(minor.courses).toHaveLength(4);
			minor.courses.forEach((course, index) => {
				expect(course.semester).toBe(minor.start_semester + index);
				if (index > 0) {
					expect(course.prerequisites).toContain(
						minor.courses[index - 1].code,
					);
				}
			});
		}
	});
});

describe("getProyeccion matches the Python engine", () => {
	it.each(fixtures)(
		"$career / minor $minor_id / $courses_sent.length courses sent",
		({ career, courses_sent, minor_id, proyeccion }) => {
			expect(getProyeccion(courses_sent, career, minor_id)).toEqual(proyeccion);
		},
	);
});
