import { useEffect, useCallback } from "react";
import { TYPES_PROGRESS } from "../utils/constants";

export function useProgressSync(progress, setProgress) {
	useEffect(() => {
		localStorage.setItem("progress", JSON.stringify(progress));
	}, [progress]);

	const cycleProgress = useCallback(
		(courseCode, prereqs) => {
			setProgress((prev) => {
				const status = TYPES_PROGRESS[prev[courseCode] ?? "not_taking"];
				const next = { ...prev };
				for (const code of prereqs) {
					if (status !== "ongoing") next[code] = status;
				}
				next[courseCode] = status;
				return next;
			});
		},
		[setProgress],
	);

	return { cycleProgress };
}
