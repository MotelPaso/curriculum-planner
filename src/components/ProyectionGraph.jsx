import { useMemo } from "react";
import { ReactFlow, Background, BackgroundVariant, Panel } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CourseNextNode from "./CourseNextNode";

const SEMESTER_WIDTH = 360;
const COURSE_HEIGHT = 150;
const HEADER_HEIGHT = 60;

function SemesterHeader({ data }) {
	return (
		<div
			style={{
				width: 276,
				textAlign: "center",
				fontWeight: 700,

				color: "var(--course-font)",
			}}
		>
			<p className="text-3xl">{data.semester}</p>
			<p style={{ fontWeight: 400, fontSize: 13 }}>{data.credits} SCT</p>
		</div>
	);
}

const nodeTypes = {
	courseNode: CourseNextNode,
	semesterHeader: SemesterHeader,
};

function buildGraph(courses, proyection, theme) {
	const courseMap = {};
	for (const course of courses) courseMap[course.code] = course;

	const nodes = [];
	const placedCodes = new Set();

	const semesterKeys = Object.keys(proyection)
		.map(Number)
		.sort((a, b) => a - b);

	for (const semesterNum of semesterKeys) {
		const { courses: codes, credits } = proyection[semesterNum];
		const x = (semesterNum - 1) * SEMESTER_WIDTH;

		nodes.push({
			id: `header-${semesterNum}`,
			type: "semesterHeader",
			position: { x, y: -HEADER_HEIGHT },
			data: { semester: semesterNum, credits },
			draggable: false,
			selectable: false,
		});

		codes.forEach((code, index) => {
			const course = courseMap[code];
			if (!course) return; // safety: skip if not found in catalog

			placedCodes.add(code);
			nodes.push({
				id: code,
				type: "courseNode",
				width: 276,
				height: 70,
				position: { x, y: index * COURSE_HEIGHT },
				data: {
					code: course.code,
					title: course.title,
					credits: course.credits,
					approvalRate: course.approvalrate,
					isElective: course.iselective,
					theme,
					status: "not_taking",
				},
			});
		});
	}

	const edges = [];
	for (const code of placedCodes) {
		const course = courseMap[code];
		for (const prereq of course.prerequisites) {
			if (placedCodes.has(prereq)) {
				edges.push({
					id: `${prereq}->${code}`,
					source: prereq,
					target: code,
					style: { stroke: "var(--prereq-low)", strokeWidth: 1 },
					type: "default",
				});
			}
		}
	}

	return { nodes, edges };
}

export default function ProyectionGraph({
	courses,
	proyection,
	theme,
	setShowProyection,
}) {
	const { nodes, edges } = useMemo(
		() => buildGraph(courses, proyection, theme),
		[courses, proyection, theme],
	);

	const returnToMalla = () => {
		setShowProyection(false);
	};

	return (
		<div style={{ width: "100vw", height: "100vh" }}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				fitView
				nodeOrigin={[0, 0]}
				proOptions={{ hideAttribution: true }}
				colorMode={theme}
				nodesDraggable={false}
				nodesConnectable={false}
			>
				<Background
					bgColor={"var(--color-bg)"}
					variant={
						theme === "light" ? BackgroundVariant.Lines : BackgroundVariant.Dots
					}
					gap={20}
					lineWidth={1}
				/>
				<Panel position="top-left">
					<div>
						<button onClick={returnToMalla} title="Volver a la malla">
							SALIR
						</button>
					</div>
				</Panel>
			</ReactFlow>
		</div>
	);
}
