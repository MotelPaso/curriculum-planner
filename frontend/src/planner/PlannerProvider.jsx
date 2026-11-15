import { useCallback, useEffect, useMemo, useState } from "react";
import { coursesForCareer } from "../data";
import { getCoursesBase } from "../services/API";
import { PlannerContext } from "./context";

function readProgress() {
	try {
		const saved = localStorage.getItem("progress");
		return saved ? JSON.parse(saved) : {};
	} catch (error) {
		console.error(error);
		return {};
	}
}

/**
 * Owns the state that has to survive route changes (progress, theme, the loaded
 * curriculum). Route components read it through `usePlanner`.
 */
export function PlannerProvider({ children }) {
	const [career, setCareer] = useState("");
	const [courses, setCourses] = useState(null);
	const [baseCourses, setBaseCourses] = useState(null);
	const [loading, setLoading] = useState(null);
	const [error, setError] = useState(null);
	const [editMode, setEditMode] = useState(false);
	const [progress, setProgress] = useState(readProgress);
	const [theme, setTheme] = useState(
		() => localStorage.getItem("theme") || "dark",
	);

	useEffect(() => {
		localStorage.setItem("progress", JSON.stringify(progress));
	}, [progress]);

	useEffect(() => {
		localStorage.setItem("theme", theme);
	}, [theme]);

	const loadCareer = useCallback(
		async (code) => {
			const key = code?.toUpperCase();
			if (!coursesForCareer(key)) {
				setError(`No hay datos disponibles para la carrera ${code}.`);
				return false;
			}
			if (key === career && courses) return true;

			setLoading(key);
			setError(null);
			const result = await getCoursesBase(key);
			setLoading(null);

			if (!result.state) {
				setError(result.error);
				return false;
			}

			setCareer(key);
			setCourses(result.data);
			setBaseCourses(result.data);
			setEditMode(false);
			return true;
		},
		[career, courses],
	);

	const toggleTheme = useCallback(() => {
		setTheme((current) => (current === "light" ? "dark" : "light"));
	}, []);

	const value = useMemo(
		() => ({
			career,
			courses,
			baseCourses,
			loading,
			error,
			editMode,
			progress,
			theme,
			loadCareer,
			setCourses,
			setEditMode,
			setProgress,
			setError,
			toggleTheme,
		}),
		[
			career,
			courses,
			baseCourses,
			loading,
			error,
			editMode,
			progress,
			theme,
			loadCareer,
			toggleTheme,
		],
	);

	return (
		<PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
	);
}
