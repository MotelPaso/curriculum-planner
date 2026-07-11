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
	BackgroundVariant,
	useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CourseNextNode from "./components/CourseNextNode";
import TopBar from "./components/TopBar";
import BotBar from "./components/BotBar";
import { SiConcourse } from "react-icons/si";
import { getMinors, getProyection, getMinorCourses } from "./services/API";
import { getPrereq } from "./utils/prereqs";
import ErrorProyection from "./components/ErrorProyection";
import MinorToggle from "./components/MinorToggle";

// Layout constants
const SEMESTER_WIDTH = 360;
const COURSE_HEIGHT = 150;
const TYPES_PROGRESS = {
	completed: "ongoing",
	ongoing: "not_taking",
	not_taking: "completed",
};
const MINOR_CODES = new Set([
	"UNFP-40001",
	"UNFP-50001",
	"UNFP-60001",
	"UNFP-70001",
	"UNFP-80001",
]);

const nodeTypes = { courseNode: CourseNextNode };

function buildGraph(courses, progress, theme) {
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
			width: 276,
			height: 70,
			position: {
				x: (course.semester - 1) * SEMESTER_WIDTH,
				y: indexInSem * COURSE_HEIGHT,
			},
			data: {
				code: course.code,
				title: course.title,
				credits: course.credits,
				approvalRate: course.approvalrate,
				isElective: course.iselective,
				theme: theme,
				status: progress[course.code],
			},
		};
	});

	const edges = courses.flatMap((course) =>
		course.prerequisites.map((prereq) => ({
			id: `${prereq}->${course.code}`,
			source: prereq,
			target: course.code,
			style: {
				stroke: "var(--prereq-arrow)",
				strokeWidth: 1,
			},
			type: "default",
		})),
	);

	return { nodes, edges };
}

function applyMinorToCourses(courses, minorCourses) {
	const minorBySemester = Object.fromEntries(
		minorCourses.map((c) => [c.semester, c]),
	);
	console.table(minorBySemester);
	return courses.map((course) =>
		MINOR_CODES.has(course.code)
			? (minorBySemester[course.semester] ?? course)
			: course,
	);
}

export default function CurriculumGraph({
	career,
	courses,
	progress,
	setCourses,
	setShowGraph,
	setTheme,
	setEditMode,
	setProgress,
	setProyection,
	setSeeProyection,
	setMinorId,
	editMode,
	theme,
}) {
	const [selectedCourse, setSelectedCourse] = useState(null);
	const [isResetting, setIsResetting] = useState(false);
	const [loadingProyection, setLoadingProyection] = useState(false);
	const [minors, setMinors] = useState([]);
	const [originalCourses, setOriginalCourses] = useState([]);
	const [selectedMinorId, setSelectedMinorId] = useState(0);
	const [showError, setShowError] = useState(false);

	const { nodes: initialNodes, edges: initialEdges } = useMemo(
		() => buildGraph(courses, progress, theme),
		[courses, progress, selectedMinorId],
	);
	const [nodes, setNodes] = useState(initialNodes);
	const [edges, setEdges] = useState(initialEdges);

	const highlightedIds = useMemo(() => {
		if (!selectedCourse) return new Set();
		return getPrereq(selectedCourse.id, courses);
	}, [selectedCourse, courses]);

	useEffect(() => {
		setNodes(initialNodes);
		setEdges(initialEdges);
	}, [initialNodes, initialEdges, selectedMinorId]);

	// toggle highlights on prereqs
	useEffect(() => {
		setNodes((prevNodes) =>
			prevNodes.map((node) => {
				const updated = initialNodes.find((n) => n.id === node.id);
				return updated
					? {
							...node, // keep the node
							data: {
								// change only the highlight
								...updated.data,
								status: progress[node.id] ?? "not_taking",
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
					return {
						...edge,
						style: { stroke: "var(--prereq-low)", strokeWidth: 1 },
					};
				const isHighlighted =
					highlightedIds.has(edge.source) && highlightedIds.has(edge.target);
				return isHighlighted
					? { ...edge, style: { stroke: "var(--prereq-high)", strokeWidth: 3 } }
					: { ...edge, style: { stroke: "var(--prereq-low)", strokeWidth: 0 } }; // reset when not highlighted
			}),
		);
	}, [theme, highlightedIds, progress]);

	// for updating the progress
	useEffect(() => {
		localStorage.setItem("progress", JSON.stringify(progress));
	}, [progress]);

	// on load
	useEffect(() => {
		async function fetchMinors() {
			const result = await getMinors(career);
			if (!result.state) {
				setShowError(result.error);
				return;
			}
			setMinors(result.data);
		}
		fetchMinors();
		setOriginalCourses(courses);
	}, [career]);

	const onNodesChange = useCallback(
		(changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
		[],
	);

	const onEdgesChange = useCallback(
		(changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
		[],
	);

	const resetLayout = useCallback(() => {
		setIsResetting(true);
		setNodes(initialNodes.map((n) => ({ ...n })));
		setTimeout(() => setIsResetting(false), 500);
	}, [initialNodes]);

	const handleSendProgress = async () => {
		const saved = localStorage.getItem("progress");
		const progress = saved ? JSON.parse(saved) : {};

		const courses_sent = [];
		for (const [course, status] of Object.entries(progress)) {
			if (status === "completed" || status == "ongoing") {
				courses_sent.push(course);
			}
		}

		setLoadingProyection(true);
		const result = await getProyection(career, courses_sent, selectedMinorId);
		setLoadingProyection(false);

		if (!result.state) {
			setShowError(result.error);
			return;
		}

		setProyection(result.data);
		setSeeProyection(true);
	};

	const handleMinorChange = async (minorId) => {
		setSelectedMinorId(minorId);
		if (minorId === 0) {
			setCourses(originalCourses);
			return;
		}

		const result = await getMinorCourses(minorId);
		console.log(result);
		if (!result.state) {
			setShowError(result.error);
			return;
		}

		setCourses(applyMinorToCourses(originalCourses, result.data));
	};
	return (
		<div
			style={{ width: "100dvw", height: "100dvh" }}
			className={isResetting ? "is-resetting" : ""}
		>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onNodeClick={(event, node) => {
					if (editMode) {
						const result = getPrereq(node.id, courses);
						setProgress((prev) => {
							const status = TYPES_PROGRESS[prev[node.id] ?? "not_taking"];
							const next = { ...prev };
							for (const course of result) {
								if (status !== "ongoing") next[course] = status;
							}
							next[node.id] = status;
							return next;
						});
					} else {
						setSelectedCourse((prev) => (prev?.id == node.id ? null : node));
					}
				}}
				onPaneClick={() => {
					setSelectedCourse(null);
				}}
				nodeTypes={nodeTypes}
				fitView
				fitViewOptions={{
					maxZoom: 0.5,
					duration: 500,
				}}
				minZoom={0.3}
				maxZoom={3}
				nodeOrigin={[100, 0]}
				proOptions={{ hideAttribution: true }}
				colorMode={theme}
				snapToGrid={true}
			>
				<Background
					bgColor={!editMode ? "var(--color-bg)" : "var(--edit-mode-bg)"}
					variant={BackgroundVariant.Dots}
					gap={20}
					lineWidth={1}
				/>
				<Panel position="top-center">
					<TopBar
						setShowGraph={setShowGraph}
						theme={theme}
						setTheme={setTheme}
						setEditMode={setEditMode}
					/>
				</Panel>
				<Panel position="bottom-left">
					<BotBar
						theme={theme}
						career={career}
						sendProgress={handleSendProgress}
						setEditMode={setEditMode}
						editMode={editMode}
						resetLayout={resetLayout}
						setProgress={setProgress}
						loadingProyection={loadingProyection}
						minors={minors}
						selectedMinorId={selectedMinorId}
						onChange={(id) => {
							handleMinorChange(id);
						}}
					/>
				</Panel>
				<Panel position="bottom-center" style={{ zIndex: 50 }}>
					{showError && (
						<ErrorProyection
							message={showError}
							onClose={() => setShowError(false)}
						/>
					)}
				</Panel>
			</ReactFlow>
		</div>
	);
}
