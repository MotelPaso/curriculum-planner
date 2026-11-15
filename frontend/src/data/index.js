import ICCI_COURSES from "./courses.ICCI.json";
import ICI_COURSES from "./courses.ICI.json";
import ITI_COURSES from "./courses.ITI.json";
import MINORS from "./minors.json";

export const COURSES_BY_CAREER = {
	ICCI: ICCI_COURSES,
	ICI: ICI_COURSES,
	ITI: ITI_COURSES,
};

export const MINOR_LIST = MINORS;

export function coursesForCareer(career) {
	return COURSES_BY_CAREER[career?.toUpperCase()] ?? null;
}

export function minorsForCareer(career) {
	return MINOR_LIST.filter((minor) => minor.career === career?.toUpperCase());
}

export function minorById(minorId) {
	return MINOR_LIST.find((minor) => minor.id === Number(minorId)) ?? null;
}
