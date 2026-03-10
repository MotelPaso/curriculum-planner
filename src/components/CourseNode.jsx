import { Handle, Position } from "@xyflow/react";

// Status color config — status takes priority
const STATUS_STYLES = {
	Aprobado: {
		border: "#22c55e",
		bg: "#f0fdf4",
		badge: "#22c55e",
		badgeText: "white",
		label: "Aprobado",
	},
	Reprobado: {
		border: "#ef4444",
		bg: "#fef2f2",
		badge: "#ef4444",
		badgeText: "white",
		label: "Reprobado",
	},
	Inscrito: {
		border: "#3b82f6",
		bg: "#eff6ff",
		badge: "#3b82f6",
		badgeText: "white",
		label: "Inscrito",
	},
	Bloqueado: {
		border: "#d1d5db",
		bg: "#f9fafb",
		badge: "#9ca3af",
		badgeText: "white",
		label: "Bloqueado",
	},
	"No Cursado": null, // falls through to difficulty coloring
};

// Secondary: color by approval rate when status is "No Cursado"
function getDifficultyStyle(approvalRate) {
	if (approvalRate >= 0.85) return { border: "#a3e635", bg: "#f7fee7" }; // easy — lime
	if (approvalRate >= 0.65) return { border: "#facc15", bg: "#fefce8" }; // medium — yellow
	return { border: "#f97316", bg: "#fff7ed" }; // hard — orange
}

function getDifficultyLabel(approvalRate) {
	if (approvalRate >= 0.85) return { text: "Fácil", color: "#65a30d" };
	if (approvalRate >= 0.65) return { text: "Medio", color: "#ca8a04" };
	return { text: "Difícil", color: "#ea580c" };
}

export default function CourseNode({ data }) {
	const {
		title,
		credits,
		approvalRate,
		status,
		isElective,
		colorMode,
		highlighted,
	} = data;

	// Decide which style to use based on colorMode
	let style;
	let diffLabel;
	if (colorMode === "Simple") {
		style = { border: "#94a3b8", bg: "#ffffff" };
		diffLabel = { color: "#4e5661" };
	} else if (colorMode === "Dificultad") {
		style = getDifficultyStyle(approvalRate);
		diffLabel = getDifficultyLabel(approvalRate);
	} else {
		// 'Estado' — status takes priority, falls back to difficulty
		style = STATUS_STYLES[status] ?? getDifficultyStyle(approvalRate);
		diffLabel = getDifficultyLabel(approvalRate);
	}

	const statusStyle = STATUS_STYLES[status];

	return (
		<div
			style={{
				background: style.bg,
				border: highlighted !== "active" ? `2px solid ${style.border}` : 0,
				padding: "10px 14px",
				width: "180px",
				fontFamily: "'Inter', sans-serif",
				boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
				position: "relative",
				opacity: highlighted === "dimmed" ? 0.25 : 1,
				outline: highlighted === "active" ? "3px solid #f59e0b" : "none",
				transition: "opacity 0.2s, outline 0.2s",
			}}
		>
			{/* Incoming handle — left side */}
			<Handle
				type="target"
				position={Position.Left}
				style={{ background: style.border, width: 8, height: 8 }}
			/>

			{/* Elective badge */}
			{isElective && (
				<span
					style={{
						position: "absolute",
						top: -10,
						right: 8,
						background: "#8b5cf6",
						color: "white",
						fontSize: "9px",
						fontWeight: 700,
						padding: "2px 6px",
						borderRadius: "99px",
						letterSpacing: "0.05em",
						textTransform: "uppercase",
					}}
				>
					Electiva
				</span>
			)}

			{/* Course title */}
			<p
				style={{
					fontSize: "11px",
					fontWeight: 700,
					color: "#1e293b",
					marginBottom: "6px",
					lineHeight: 1.3,
					textTransform: "uppercase",
					letterSpacing: "0.02em",
				}}
			>
				{title}
			</p>

			{/* Credits + approval rate row */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				{/* Difficulty / status badge */}
				{statusStyle ? (
					<span
						style={{
							fontSize: "10px",
							fontWeight: 700,
							background: statusStyle.badge,
							color: statusStyle.badgeText,
							padding: "2px 7px",
							borderRadius: "99px",
						}}
					>
						{statusStyle.label}
					</span>
				) : (
					<span
						style={{
							fontSize: "12px",
							fontWeight: 600,
							color: diffLabel.color,
						}}
					>
						{Math.round(approvalRate * 100)}%
					</span>
				)}
				<span
					style={{
						fontSize: "12px",
						color: "#64748b",
						fontWeight: 500,
					}}
				>
					{credits} SCT.
				</span>
			</div>

			{/* Outgoing handle — right side */}
			<Handle
				type="source"
				position={Position.Right}
				style={{ background: style.border, width: 8, height: 8 }}
			/>
		</div>
	);
}
