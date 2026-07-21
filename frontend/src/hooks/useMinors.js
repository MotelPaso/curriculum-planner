import { useState, useEffect, useCallback } from "react";
import { getMinors, getMinorCourses } from "../services/API";
import { applyMinorToCourses } from "../utils/buildGraph";

export function useMinors(career, originalCoursesRef) {
	const [minors, setMinors] = useState([]);
	const [selectedMinorId, setSelectedMinorId] = useState(0);

	useEffect(() => {
		async function fetchMinors() {
			try {
				const result = await getMinors(career);
				if (result.state) {
					setMinors(result.data);
				}
			} catch (error) {
				console.error(error);
			}
		}
		fetchMinors();
	}, [career]);

	const applyMinor = useCallback(
		async (minorId) => {
			setSelectedMinorId(minorId);
			if (minorId === 0) return originalCoursesRef.current;

			try {
				const result = await getMinorCourses(minorId);
				if (!result.state) return null;
				return applyMinorToCourses(originalCoursesRef.current, result.data);
			} catch (error) {
				console.error(error);
				return null;
			}
		},
		[originalCoursesRef],
	);

	return { minors, selectedMinorId, applyMinor };
}
