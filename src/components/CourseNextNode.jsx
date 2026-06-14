import { Handle, Position } from "@xyflow/react";
import { FaAngleDown } from "react-icons/fa";

export default function CourseNextNode({ data }) {
	const {
		code,
		title,
		credits,
		approvalRate,
		isElective,
		theme,
		highlighted,
		editMode,
		status,
	} = data;

	const PROGRESS_STYLES = {
		ongoing: { outline: "5px solid #3b82f6" }, // blue
		completed: { opacity: 0.35 }, // dimmed
		not_taking: {}, // red
	};
	const progressStyle = PROGRESS_STYLES[status] ?? {};

	return (
		<div className="flex flex-col items-end">
			{data.isElective && (
				<div
					className="relative top-2 left-3 w-20 text-center text-sm"
					style={{
						backgroundColor: "var(--course-elective)",
						color: "#FFFFFF",
						opacity:
							highlighted === "dimmed" ? 0.15 : (progressStyle.opacity ?? 1),
						transition: "opacity 0.4s, outline 0.4s",
					}}
				>
					<p>Electivo</p>
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
				className="border-2 w-full h-[87px] rounded-md"
				style={{
					backgroundColor: "var(--course-main)",
					boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
					opacity:
						highlighted === "dimmed" ? 0.25 : (progressStyle.opacity ?? 1),
					outline:
						highlighted === "active"
							? "3px solid var(--course-selected)"
							: (progressStyle.outline ?? "none"),
					transition: "opacity 0.5s, outline 0.5s",
				}}
			>
				<div className="w-full h-[56px] flex items-center justify-center text-wrap pt-0.5">
					<h1
						className=" text-xl font-extrabold text-center "
						style={{
							color: "var(--course-font)",
						}}
					>
						{data.title}
					</h1>
				</div>
				<div
					className="w-full flex flex-row items-center justify-between text-sm"
					style={{
						color: "var(--course-font)",
					}}
				>
					<p className="pl-2">{Math.round(approvalRate * 100)}%</p>
					<p>{data.code}</p>
					<FaAngleDown color={data.theme == "light" ? "black" : "white"} />
					<p className="font-medium pr-2">
						{data.credits} <span className="font-light">SCT</span>
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
