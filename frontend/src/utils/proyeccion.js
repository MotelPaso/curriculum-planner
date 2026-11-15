/**
 * Semester projection engine.
 *
 * This is a direct port of `backend/connection.py::getProyeccion` and the
 * helpers around it. The scheduling rules (credit limit, dispersion, skip and
 * requeue passes) are intentionally kept behaviourally identical; the golden
 * fixtures in `tests/fixtures/proyeccion.json` are generated from the Python
 * implementation and asserted against this module.
 */

import { coursesForCareer, minorById } from "../data";

export const CREDIT_LIMIT = 32;
export const DISPERSION_LIMIT = 3;

// Mirrors the Python constant: only UNFP-{4..8}0001 placeholders are swapped
// out for a minor course. Careers whose placeholders live outside this set
// keep their placeholder rows, exactly as before.
const PLACEHOLDER_ELECTIVE_CODES = new Map(
	[4, 5, 6, 7, 8].map((semester) => [`UNFP-${semester}0001`, semester]),
);

const INTERNSHIPS = new Set(["ECIN-08606", "ECIN-08266", "ECIN-08616"]);

export function checkDispersion(course, leastSemester) {
	return course.semester - leastSemester < DISPERSION_LIMIT;
}

export function checkPrereqs(course, passedCourses) {
	return course.prerequisites.every((code) => passedCourses.has(code));
}

export function getCourses(career) {
	const courses = coursesForCareer(career);
	if (!courses) {
		throw new Error(`No hay datos para la carrera ${career}`);
	}
	return courses;
}

export function getMinorCourses(minorId) {
	if (!minorId) return [];
	const minor = minorById(minorId);
	if (!minor) {
		throw new Error(`No existe el minor ${minorId}`);
	}
	return minor.courses;
}

/**
 * @param {string[]} coursesSent course codes marked as passed / ongoing
 * @param {string} career
 * @param {number|null} minorId
 * @returns {Record<string, {courses: string[], credits: number}>}
 */
export function getProyeccion(coursesSent, career, minorId = null) {
	let courses = getCourses(career);

	if (minorId !== null && minorId !== undefined && Number(minorId) !== 0) {
		const minorBySemester = new Map(
			getMinorCourses(minorId).map((course) => [course.semester, course]),
		);
		courses = courses.map((course) => {
			const placeholderSemester = PLACEHOLDER_ELECTIVE_CODES.get(course.code);
			if (placeholderSemester === undefined) return course;
			// Python raised a KeyError here; a missing semester can only happen
			// with inconsistent data, so fall back to the placeholder row.
			return minorBySemester.get(placeholderSemester) ?? course;
		});
	}

	const sent = coursesSent ?? [];
	const sentSet = new Set(sent);
	const proyection = {};
	let credits = 0;
	let semester = 1;
	let leastSemester = 1;

	if (sent.length > 0) {
		for (const course of courses) {
			if (!sentSet.has(course.code)) break;
			semester = course.semester > semester ? course.semester : semester;
		}
		semester += 1;
	}

	let currCourses = [];
	const passedCourses = new Set(sent);
	let skippedCourses = [];

	for (const course of courses) {
		if (INTERNSHIPS.has(course.code)) continue;
		if (passedCourses.has(course.code)) continue;
		if (!checkPrereqs(course, passedCourses)) {
			skippedCourses.push(course);
			continue;
		}
		if (currCourses.length > 0 && !checkDispersion(course, leastSemester)) {
			skippedCourses.push(course);
			continue;
		}
		if (credits + course.credits > CREDIT_LIMIT) {
			proyection[semester] = {
				courses: currCourses.map((c) => c.code),
				credits,
			};
			credits = 0;
			semester += 1;
			for (const curr of currCourses) passedCourses.add(curr.code);
			currCourses = [];

			const temp = [];
			for (const skip of skippedCourses) {
				const fitsCredits = credits + skip.credits <= CREDIT_LIMIT;
				const fitsDispersion =
					currCourses.length === 0 ||
					checkDispersion(
						skip,
						Math.min(...currCourses.map((c) => c.semester)),
					);
				if (
					checkPrereqs(skip, passedCourses) &&
					fitsCredits &&
					fitsDispersion
				) {
					currCourses.push(skip);
					credits += skip.credits;
				} else {
					temp.push(skip);
				}
			}
			skippedCourses = temp;
		}

		credits += course.credits;
		currCourses.push(course);
		leastSemester = Math.min(...currCourses.map((c) => c.semester));
	}

	if (currCourses.length > 0) {
		proyection[semester] = {
			courses: currCourses.map((c) => c.code),
			credits,
		};
		for (const curr of currCourses) passedCourses.add(curr.code);
		semester += 1;
	}

	while (skippedCourses.length > 0) {
		currCourses = [];
		credits = 0;
		leastSemester = null;
		const temp = [];
		for (const skip of skippedCourses) {
			const fitsCredits = credits + skip.credits <= CREDIT_LIMIT;
			const fitsDispersion =
				leastSemester === null || checkDispersion(skip, leastSemester);
			if (checkPrereqs(skip, passedCourses) && fitsCredits && fitsDispersion) {
				currCourses.push(skip);
				credits += skip.credits;
				leastSemester =
					leastSemester === null
						? skip.semester
						: Math.min(leastSemester, skip.semester);
			} else {
				temp.push(skip);
			}
		}
		if (currCourses.length === 0) {
			proyection[semester] = {
				courses: temp.map((c) => c.code),
				credits: 0,
			};
			break;
		}
		proyection[semester] = {
			courses: currCourses.map((c) => c.code),
			credits,
		};
		for (const curr of currCourses) passedCourses.add(curr.code);
		semester += 1;
		skippedCourses = temp;
	}

	return proyection;
}
