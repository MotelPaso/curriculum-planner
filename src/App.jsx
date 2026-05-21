import { useEffect, useState } from "react";
import CurriculumGraph from "./CurriculumGraph";
import CareerSelector from "./components/CareerSelector";

export default function App() {
	const [showGraph, setShowGraph] = useState(false);
	const [career, setCareer] = useState(null);
	const [editMode, setEditMode] = useState(false);
	const [theme, setTheme] = useState(
		() => localStorage.getItem("theme") || "dark",
	);
	const [progress, setProgress] = useState(() => {
		const saved = localStorage.getItem("progress");
		return saved ? JSON.parse(saved) : {};
	});
	const toggleTheme = () => {
		const next = localStorage.getItem("theme") === "light" ? "dark" : "light";
		setTheme(next);
		localStorage.setItem("theme", next);
	};

	return (
		<div
			data-theme={theme}
			className={`w-screen h-screen flex items-center justify-center `}
			style={{ background: "var(--color-bg)" }}
		>
			{!showGraph && (
				<CareerSelector
					setCareer={setCareer}
					setShowGraph={setShowGraph}
					setTheme={toggleTheme}
					theme={theme}
				/>
			)}
			{showGraph && (
				<CurriculumGraph
					courses={career}
					progress={progress}
					setProgress={setProgress}
					setShowGraph={setShowGraph}
					setTheme={toggleTheme}
					setEditMode={setEditMode}
					editMode={editMode}
					theme={theme}
				/>
			)}
		</div>
	);
}
