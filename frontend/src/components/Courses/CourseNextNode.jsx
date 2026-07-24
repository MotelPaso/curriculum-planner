import { Handle, Position } from "@xyflow/react";

export default function CourseNextNode({ data }) {
	const {
		code,
		title,
		credits,
		approvalRate,
		isElective,
		highlighted,
		status,
	} = data;

	const PROGRESS_STYLES = {
		ongoing: { outline: "5px solid #3b82f6" },
		completed: { opacity: 0.35 },
		not_taking: {},
	};
	const progressStyle = PROGRESS_STYLES[status] ?? {};

	return (
		<div className="relative">
			{(code.includes("MNOR") || isElective) && (
				<div
					className="absolute -top-4 -right-3 w-20 text-center align-middle text-md z-10 bg-(--course-elective) text-white"
					style={{
						opacity:
							highlighted === "dimmed" ? 0.15 : (progressStyle.opacity ?? 1),
						transition: "opacity 0.4s, outline 0.4s",
					}}
				>
					<p>{data.code.includes("MNOR") ? "Minor" : "Electivo"}</p>
				</div>
			)}
			<Handle
				type="target"
				position={Position.Left}
				style={{
					backgroundColor: "var(--course-border)",
					width: 8,
					height: 8,
				}}
			/>
			<div
				className="border-2 w-full h-[87px] rounded-md bg-(--course-main) shadow-black shadow-2xs"
				style={{
					opacity:
						highlighted === "dimmed" ? 0.25 : (progressStyle.opacity ?? 1),
					outline:
						highlighted === "active"
							? "3px solid var(--course-selected)"
							: (progressStyle.outline ?? "none"),
					transition: "opacity 0.5s, outline 0.5s",
				}}
			>
				<div className="w-full h-[56px] flex items-center justify-center text-wrap pt-0.5 cursor-pointer">
					<h1 className="text-xl font-extrabold text-center text-(--course-font)">
						{title}
					</h1>
				</div>
				<div className="w-full flex flex-row items-center justify-between text-sm text-(--course-font)">
					<p className="pl-2">{Math.round(approvalRate * 100)}%</p>
					<p className="pl-2 text-center">{code}</p>
					<p className="font-bold pr-2">
						{credits} <span className="font-light">SCT</span>
					</p>
				</div>
				<Handle
					type="source"
					position={Position.Right}
					style={{ background: "var(--course-border)", width: 8, height: 8 }}
				/>
			</div>
		</div>
	);
}
