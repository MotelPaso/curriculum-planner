import axios from "axios";

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
