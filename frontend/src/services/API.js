import axios from "axios";
import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const BACKEND = axios.create({
	baseURL: API_URL,
});

export const getProyection = async (career, courses_sent, minor_id) => {
	const data = { career, courses_sent, minor_id };
	try {
		const response = await BACKEND.post("/proyection", data);
		return { state: true, data: response.data };
	} catch (error) {
		console.error(error);
		return {
			state: false,
			error: "Ha ocurrido un error procesando sus datos...",
		};
	}
};

// local backend version of getCoursedata, kept just in case
export const getCourseData = async (career) => {
	try {
		const response = await BACKEND.get("/courses", {
			timeout: 5000,
			params: {
				career,
			},
		});
		const courses = response.data;
		return { state: true, data: courses };
	} catch (error) {
		console.error(error);
		return {
			state: false,
			error: "Ha ocurrido un error cargando la malla.\nIntenta más tarde.",
		};
	}
};

export const getCoursesBase = async (career) => {
	try {
		const { data: courses, error: coursesError } = await supabase
			.from("courses")
			.select("code, title, credits, semester, approvalrate, iselective")
			.eq("career", career)
			.is("is_minor", false);

		if (coursesError) throw coursesError;

		const { data: prerequisites, error: prereqError } = await supabase
			.from("prerequisites")
			.select(
				`
        course:course_id(code, career),
        prereq:prereq_id(code)
      `,
			)
			.eq("course.career", career);

		if (prereqError) throw prereqError;

		const prereqMap = {};
		for (const row of prerequisites) {
			if (!row.course) continue;
			const courseCode = row.course.code;
			const prereqCode = row.prereq.code;
			if (!prereqMap[courseCode]) prereqMap[courseCode] = [];
			prereqMap[courseCode].push(prereqCode);
		}

		for (const course of courses) {
			course.prerequisites = prereqMap[course.code] || [];
		}

		return { state: true, data: courses };
	} catch (error) {
		console.log(error);
		return {
			state: false,
			error: "Ha ocurrido un error cargando la malla.\nIntenta más tarde.",
		};
	}
};

export const wakeBackend = async () => {
	try {
		const data = await BACKEND.get("/");
		console.log(".");
	} catch (error) {
		console.log(error);
	}
};

export const getMinors = async (career) => {
	try {
		const { data: minors, error: minorsError } = await supabase
			.from("minors")
			.select("id, name")
			.eq("career", career);
		if (minorsError) throw minorsError;

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
		const response = await BACKEND.get(`/minors/${minorId}/courses`);

		return { state: true, data: response.data };
	} catch (error) {
		console.error(error);
		return {
			state: false,
			error: "Ha ocurrido un error obteniendo los cursos del minor...",
		};
	}
};
