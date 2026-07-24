import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { ReactFlow, Background, Panel, BackgroundVariant } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CourseNextNode from "../Courses/CourseNextNode";
import TopBar from "../TopBar";
import BotBar from "../BotBar";
import { getProyection } from "../../services/API";
import { getPrereq } from "../../utils/prereqs";
import { buildGraph } from "../../utils/buildGraph";
import { useGraphNodes } from "../../hooks/useGraphNodes";
import { useMinors } from "../../hooks/useMinors";
import { useProgressSync } from "../../hooks/useProgressSync";
import ErrorProyection from "../ErrorProyection";

const nodeTypes = { courseNode: CourseNextNode };

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
	editMode,
	theme,
	selectedMinorId,
	setSelectedMinorId,
	baseCourses,
}) {
	const [selectedCourse, setSelectedCourse] = useState(null);
	const [isResetting, setIsResetting] = useState(false);
	const [loadingProyection, setLoadingProyection] = useState(false);
	const [showError, setShowError] = useState(false);

	const originalCoursesRef = useRef(baseCourses);

	const { minors, applyMinor } = useMinors(
		career,
		originalCoursesRef,
		selectedMinorId,
		setSelectedMinorId,
	);
	const { cycleProgress } = useProgressSync(progress, setProgress);

	const { nodes: initialNodes, edges: initialEdges } = useMemo(
		() => buildGraph(courses, progress, theme),
		[courses, progress, theme],
	);

	const highlightedIds = useMemo(() => {
		if (!selectedCourse) return new Set();
		return getPrereq(selectedCourse.id, courses);
	}, [selectedCourse, courses]);

	const {
		nodes,
		edges,
		onNodesChange,
		onEdgesChange,
		resetLayout: baseResetLayout,
	} = useGraphNodes(initialNodes, initialEdges, progress, highlightedIds);

	useEffect(() => {
		originalCoursesRef.current = baseCourses;
	}, [career, baseCourses]);

	const resetLayout = useCallback(() => {
		setIsResetting(true);
		baseResetLayout();
		setTimeout(() => setIsResetting(false), 500);
	}, [baseResetLayout]);

	const handleSendProgress = useCallback(async () => {
		const courses_sent = [];
		for (const [course, status] of Object.entries(progress)) {
			if (status === "completed" || status === "ongoing") {
				courses_sent.push(course);
			}
		}

		setLoadingProyection(true);
		try {
			const result = await getProyection(career, courses_sent, selectedMinorId);
			if (!result.state) {
				setShowError(result.error);
				return;
			}
			setProyection(result.data);
			setSeeProyection(true);
		} catch {
			setShowError("Ha ocurrido un error procesando sus datos...");
		} finally {
			setLoadingProyection(false);
		}
	}, [career, progress, selectedMinorId, setProyection, setSeeProyection]);

	const handleMinorChange = useCallback(
		async (minorId) => {
			const result = await applyMinor(minorId);
			if (!result) {
				setShowError("Ha ocurrido un error obteniendo los cursos del minor...");
				return;
			}
			setCourses(result);
		},
		[applyMinor, setCourses],
	);

	const onNodeClick = useCallback(
		(event, node) => {
			if (editMode) {
				cycleProgress(node.id, getPrereq(node.id, courses));
			} else {
				setSelectedCourse((prev) => (prev?.id === node.id ? null : node));
			}
		},
		[editMode, courses, cycleProgress],
	);

	const onPaneClick = useCallback(() => {
		setSelectedCourse(null);
	}, []);

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
				onNodeClick={onNodeClick}
				onPaneClick={onPaneClick}
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
						theme={theme === "light" ? "black" : "white"}
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
