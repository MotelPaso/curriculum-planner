export const SEMESTER_WIDTH = 360;
export const COURSE_HEIGHT = 150;

// Minimum time the "Procesando..." state stays visible before switching views,
// so the projection doesn't just flash in since it is computed locally.
export const PROYECTION_MIN_DELAY_MS = 500;

export const TYPES_PROGRESS = {
	completed: "ongoing",
	ongoing: "not_taking",
	not_taking: "completed",
};

export const MINOR_CODES = new Set([
	"UNFP-40001",
	"UNFP-50001",
	"UNFP-60001",
	"UNFP-70001",
	"UNFP-80001",
]);
