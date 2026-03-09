import { useMemo, useState } from "react";
import {
	ReactFlow,
	Background,
	Controls,
	ControlButton,
	MiniMap,
	Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CourseNode from "./components/CourseNode";
import SideBar from "./components/SideBar";

// Layout constants
const SEMESTER_WIDTH = 300;
const COURSE_HEIGHT = 150;

const nodeTypes = { courseNode: CourseNode };

// Build nodes and edges from courses + progress state
function buildGraph(courses, progress, colorMode) {
	// Group courses by semester for Y positioning
	const bySemester = {};
	for (const course of courses) {
		if (!bySemester[course.semester]) bySemester[course.semester] = [];
		bySemester[course.semester].push(course);
	}

	const nodes = courses.map((course) => {
		const semList = bySemester[course.semester];
		const indexInSem = semList.indexOf(course);

		return {
			id: course.code,
			type: "courseNode",
			width: 180,
			height: 70,
			position: {
				x: (course.semester - 1) * SEMESTER_WIDTH,
				y: indexInSem * COURSE_HEIGHT,
			},
			data: {
				title: course.title,
				credits: course.credits,
				approvalRate: course.approvalRate,
				isElective: course.options.length > 0,
				status: progress[course.code] ?? "No Cursado",
				colorMode,
			},
		};
	});

	const edges = courses.flatMap((course) =>
		course.prereqs.map((prereq) => ({
			id: `${prereq}->${course.code}`,
			source: prereq,
			target: course.code,
			style: { stroke: "#94a3b8", strokeWidth: 2 },
			type: "default",
		})),
	);

	return { nodes, edges };
}

export default function CurriculumGraph({ courses, progress = {} }) {
	const [colorMode, setColorMode] = useState("status");
	const [showSideBar, setShowSideBar] = useState(true);
	const { nodes, edges } = useMemo(
		() => buildGraph(courses, progress, colorMode),
		[progress, colorMode],
	);

	return (
		<div style={{ width: "100vw", height: "100vh", background: "#f8fafc" }}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				minZoom={0.3}
				maxZoom={2}
				nodeOrigin={[0, 0]}
				fitView
			>
				<Background color="#e2e8f0" gap={20} />
				<Controls showInteractive={false}>
					<ControlButton
						onClick={() => setShowSideBar((prev) => !prev)}
						title="Toggle sidebar"
					>
						{showSideBar ? ">" : "<"}
					</ControlButton>
				</Controls>
				<MiniMap
					pannable
					nodeColor={(node) => {
						const status = node.data?.status;
						if (status === "Aprobado") return "#22c55e";
						if (status === "Reprobado") return "#ef4444";
						if (status === "Inscrito") return "#3b82f6";
						return "#cbd5e1";
					}}
					maskColor="rgba(248,250,252,0.7)"
				/>
				{showSideBar && (
					<Panel position="bottom-left" style={{ marginLeft: "54px" }}>
						<SideBar colorMode={colorMode} setColorMode={setColorMode} />
					</Panel>
				)}
			</ReactFlow>
		</div>
	);
}
