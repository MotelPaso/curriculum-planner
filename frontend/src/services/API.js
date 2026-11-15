import { coursesForCareer, minorById, minorsForCareer } from "../data";
import { getProyeccion as project } from "../utils/proyeccion";

export const getProyection = async (career, courses_sent, minor_id) => {
	try {
		return { state: true, data: project(courses_sent, career, minor_id) };
	} catch (error) {
		console.error(error);
		return {
			state: false,
			error: "Ha ocurrido un error procesando sus datos...",
		};
	}
};

export const getCoursesBase = async (career) => {
	const courses = coursesForCareer(career);
	if (!courses) {
		return {
			state: false,
			error: `No hay datos disponibles para la carrera ${career}.`,
		};
	}

	// Copies so no consumer can mutate the frozen catalogue.
	const data = courses.map((course) => ({
		...course,
		prerequisites: [...course.prerequisites],
	}));

	return { state: true, data };
};

export const getMinors = async (career) => {
	try {
		const minors = minorsForCareer(career).map(({ id, name }) => ({ id, name }));
		return { state: true, data: minors };
	} catch (error) {
		console.error(error);
		return {
			state: false,
			error: "Ha ocurrido un error obteniendo los minors...",
		};
	}
};

export const getMinorCourses = async (minorId) => {
	try {
		const minor = minorById(minorId);
		if (!minor) throw new Error(`No existe el minor ${minorId}`);
		return { state: true, data: minor.courses };
	} catch (error) {
		console.error(error);
		return {
			state: false,
			error: "Ha ocurrido un error obteniendo los cursos del minor...",
		};
	}
};
