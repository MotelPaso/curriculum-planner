import { useCallback } from "react";
import { TYPES_PROGRESS } from "../utils/constants";

// Progress itself is persisted by PlannerProvider, so this hook only owns the
// cascade rule for toggling a course and its prerequisites.
export function useProgressSync(setProgress) {
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
