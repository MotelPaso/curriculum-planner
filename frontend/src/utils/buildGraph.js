import { SEMESTER_WIDTH, COURSE_HEIGHT, MINOR_CODES } from "./constants";

export function buildGraph(courses, progress, theme) {
	const bySemester = {};
	for (const course of courses) {
		if (!bySemester[course.semester]) bySemester[course.semester] = [];
		bySemester[course.semester].push(course);
	}

	const nodes = courses.map((course) => {
		const semList = bySemester[course.semester];
		const indexInSem = semList.indexOf(course);

		return {
			id: course.code,
			type: "courseNode",
			width: 276,
			height: 70,
			position: {
				x: (course.semester - 1) * SEMESTER_WIDTH,
				y: indexInSem * COURSE_HEIGHT,
			},
			data: {
				code: course.code,
				title: course.title,
				credits: course.credits,
				approvalRate: course.approvalrate,
				isElective: course.iselective,
				theme: theme,
				status: progress[course.code],
			},
		};
	});

	const edges = courses.flatMap((course) =>
		course.prerequisites.map((prereq) => ({
			id: `${prereq}->${course.code}`,
			source: prereq,
			target: course.code,
			style: {
				stroke: "var(--prereq-arrow)",
				strokeWidth: 1,
			},
			type: "default",
		})),
	);

	return { nodes, edges };
}

export function applyMinorToCourses(courses, minorCourses) {
	const minorBySemester = Object.fromEntries(
		minorCourses.map((c) => [c.semester, c]),
	);

	return courses.map((course) =>
		MINOR_CODES.has(course.code)
			? (minorBySemester[course.semester] ?? course)
			: course,
	);
}
