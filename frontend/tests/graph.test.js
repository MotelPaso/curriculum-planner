import { describe, expect, it } from "vitest";
import { buildGraph, applyMinorToCourses } from "../src/utils/buildGraph";
import { COURSES_BY_CAREER, MINOR_LIST } from "../src/data";

describe("buildGraph", () => {
	it("creates one node per course and one edge per prerequisite", () => {
		const courses = COURSES_BY_CAREER.ICCI;
		const { nodes, edges } = buildGraph(courses, {});

		expect(nodes).toHaveLength(courses.length);
		expect(edges).toHaveLength(
			courses.reduce((total, course) => total + course.prerequisites.length, 0),
		);
		expect(nodes[0]).toMatchObject({
			type: "courseNode",
			data: { status: undefined },
		});
	});

	it("maps every course field the node component renders", () => {
		for (const course of COURSES_BY_CAREER.ICCI) {
			const { nodes } = buildGraph([course], {});
			const data = nodes[0].data;
			expect(data.code).toBe(course.code);
			expect(data.title).toBe(course.title);
			expect(data.credits).toBe(course.credits);
			expect(typeof data.approvalRate).toBe("number");
			expect(typeof data.isElective).toBe("boolean");
		}
	});
});

describe("applyMinorToCourses", () => {
	it("swaps the elective placeholders that overlap the minor semesters", () => {
		const courses = COURSES_BY_CAREER.ICCI;
		const minor = MINOR_LIST.find((entry) => entry.career === "ICCI");
		const result = applyMinorToCourses(courses, minor.courses);

		const placed = result.filter((course) =>
			minor.courses.some((minorCourse) => minorCourse.code === course.code),
		);
		expect(placed).toHaveLength(4);
		expect(result).toHaveLength(courses.length);
	});

	it("leaves the career untouched when no minor is selected", () => {
		const courses = COURSES_BY_CAREER.ICCI;
		expect(applyMinorToCourses(courses, [])).toEqual(courses);
	});
});
