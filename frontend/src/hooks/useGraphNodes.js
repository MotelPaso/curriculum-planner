import { useState, useCallback, useEffect } from "react";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";

export function useGraphNodes(
	initialNodes,
	initialEdges,
	progress,
	highlightedIds,
) {
	const [nodes, setNodes] = useState(initialNodes);
	const [edges, setEdges] = useState(initialEdges);

	useEffect(() => {
		setNodes(initialNodes);
		setEdges(initialEdges);
	}, [initialNodes, initialEdges]);

	// Runs auto on click, toggles highlights on each prereq
	useEffect(() => {
		setNodes((prevNodes) =>
			prevNodes.map((node) => {
				const updated = initialNodes.find((n) => n.id === node.id);
				return updated
					? {
							...node,
							data: {
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
						style: { stroke: "var(--prereq-low)", strokeWidth: 2 },
					};
				const isHighlighted =
					highlightedIds.has(edge.source) && highlightedIds.has(edge.target);
				return isHighlighted
					? { ...edge, style: { stroke: "var(--prereq-high)", strokeWidth: 4 } }
					: { ...edge, style: { stroke: "var(--prereq-low)", strokeWidth: 0 } };
			}),
		);
	}, [highlightedIds, progress, initialNodes]);

	const onNodesChange = useCallback(
		(changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
		[],
	);

	const onEdgesChange = useCallback(
		(changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
		[],
	);

	const resetLayout = useCallback(() => {
		setNodes(initialNodes.map((n) => ({ ...n })));
	}, [initialNodes]);

	return { nodes, edges, onNodesChange, onEdgesChange, resetLayout };
}
