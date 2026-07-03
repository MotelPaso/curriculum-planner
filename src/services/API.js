import axios from "axios";
import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const BACKEND = axios.create({
	baseURL: API_URL,
});

export async function getProyection(career, courses_sent) {
	const data = { career, courses_sent };
	try {
		const response = await BACKEND.post("/proyection", data);
		return response.data;
	} catch (error) {
		console.error(error);
		return null;
	}
}
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
			.eq("career", career);

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
