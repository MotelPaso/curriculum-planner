export function getPrereq(courseCode, courses) {
	const result = new Set();

	function collectPrereqs(code) {
		const course = courses.find((c) => c.code === code);
		if (!course) return;
		result.add(code);
		for (const prereq of course.prerequisites) {
			if (!result.has(prereq)) {
				collectPrereqs(prereq);
			}
		}
	}

	collectPrereqs(courseCode);
	return result;
}
