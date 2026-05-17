import { useMemo, useState, useCallback, useEffect } from "react";
import {
	ReactFlow,
	Background,
	Controls,
	ControlButton,
	MiniMap,
	Panel,
	applyEdgeChanges,
	applyNodeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CourseNode from "./components/CourseNode";
import SideBar from "./components/SideBar";
import BackButton from "./components/BackButton";
import TopBar from "./components/TopBar";

// Layout constants
const SEMESTER_WIDTH = 300;
const COURSE_HEIGHT = 100;

const nodeTypes = { courseNode: CourseNode };

function buildGraph(courses, progress, colorMode) {
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
			width: 200,
			height: 70,
			position: {
				x: (course.semester - 1) * SEMESTER_WIDTH,
				y: indexInSem * COURSE_HEIGHT,
			},
			data: {
				title: course.title,
				credits: course.credits,
				approvalRate: course.approvalRate,
				isElective: course.options.length > 0 || course.requiresElectiveLine,
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
			style: { stroke: "#94a3b8", strokeWidth: 1 },
			type: "default",
		})),
	);

	return { nodes, edges };
}

export default function CurriculumGraph({
	courses,
	progress = {},
	setShowGraph,
	setTheme,
	theme,
}) {
	const [colorMode, setColorMode] = useState("Dificultad");
	const [showSideBar, setShowSideBar] = useState(false);
	const [showTopBar, setShowTopBar] = useState(true);
	const [selectedCourse, setSelectedCourse] = useState(null);
	const [editMode, toggleEditMode] = useState(false);

	const { nodes: initialNodes, edges: initialEdges } = useMemo(
		() => buildGraph(courses, progress, colorMode),
		[progress, colorMode],
	);
	const [nodes, setNodes] = useState(initialNodes);
	const [edges, setEdges] = useState(initialEdges);

	const highlightedIds = useMemo(() => {
		if (!selectedCourse) return new Set();

		const result = new Set();
		function collectPrereqs(courseCode) {
			const course = courses.find((c) => c.code === courseCode);
			if (!course) return;
			result.add(courseCode);
			for (const prereq of course.prereqs) {
				if (!result.has(prereq)) {
					collectPrereqs(prereq);
				}
			}
		}

		collectPrereqs(selectedCourse.id);
		return result;
	}, [selectedCourse, courses]);

	useEffect(() => {
		setNodes((prevNodes) =>
			prevNodes.map((node) => {
				const updated = initialNodes.find((n) => n.id === node.id); // returns bool if found
				return updated
					? {
							...node, // keep the node
							data: {
								// change only the highlight
								...updated.data,
								highlighted:
									highlightedIds.size === 0
										? null
										: highlightedIds.has(node.id)
											? "active"
											: "dimmed",
							},
						}
					: node;
			}),
		);
		setEdges((prevEdges) =>
			prevEdges.map((edge) => {
				if (highlightedIds.size === 0)
					return { ...edge, style: { stroke: "#94a3b8", strokeWidth: 1 } };
				const isHighlighted =
					highlightedIds.has(edge.source) && highlightedIds.has(edge.target);
				return isHighlighted
					? { ...edge, style: { stroke: "#222222", strokeWidth: 3 } }
					: { ...edge, style: { stroke: "#94a3b8", strokeWidth: 0 } }; // reset when not highlighted
			}),
		);
	}, [colorMode, highlightedIds]);

	const onNodesChange = useCallback(
		(changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
		[],
	);

	const onEdgesChange = useCallback(
		(changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
		[],
	);

	return (
		<div style={{ width: "100vw", height: "100vh" }}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onNodeClick={(event, node) => {
					setSelectedCourse((prev) => (prev?.id == node.id ? null : node));
				}}
				onPaneClick={() => {
					setSelectedCourse(null);
				}}
				nodeTypes={nodeTypes}
				minZoom={0.3}
				maxZoom={2}
				nodeOrigin={[0, 0]}
				fitView
				proOptions={{ hideAttribution: true }}
				colorMode={theme}
			>
				<Background
					bgColor={theme == "light" ? "#ffffff" : "#111111"}
					gap={20}
					lineWidth={0}
				/>
				<Controls showZoom={false} showFitView={false}>
					<ControlButton
						onClick={() => setShowSideBar((prev) => !prev)}
						title="Toggle sidebar"
					>
						{!showSideBar ? ">" : "<"}
					</ControlButton>
					<ControlButton
						onClick={() => toggleEditMode((prev) => !prev)}
						title="Toggle Edit Mode"
					>
						{!editMode ? "E" : "!E"}
					</ControlButton>
				</Controls>
				{showSideBar && (
					<Panel position="bottom-left" style={{ marginLeft: "54px" }}>
						<SideBar colorMode={colorMode} setColorMode={setColorMode} />
					</Panel>
				)}
				{showTopBar && (
					<Panel position="top-center">
						<TopBar
							setShowGraph={setShowGraph}
							theme={theme}
							setTheme={setTheme}
						/>
					</Panel>
				)}
			</ReactFlow>
		</div>
	);
}
