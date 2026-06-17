import { useEffect, useState } from "react";
import CurriculumGraph from "./CurriculumGraph";
import CareerSelector from "./components/CareerSelector";
import ProyectionGraph from "./components/ProyectionGraph";

export default function App() {
	const [showGraph, setShowGraph] = useState(false);
	const [courses, setCourses] = useState(null);
	const [career, setCareer] = useState("");
	const [editMode, setEditMode] = useState(false);
	const [theme, setTheme] = useState(
		() => localStorage.getItem("theme") || "dark",
	);
	const [progress, setProgress] = useState(() => {
		const saved = localStorage.getItem("progress");
		return saved ? JSON.parse(saved) : {};
	});
	const [proyection, setProyection] = useState(null);
	const [seeProyection, setSeeProyection] = useState(false);

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
					setCourses={setCourses}
					setCareer={setCareer}
					setShowGraph={setShowGraph}
					setTheme={toggleTheme}
					theme={theme}
				/>
			)}
			{showGraph && !seeProyection && (
				<CurriculumGraph
					courses={courses}
					career={career}
					progress={progress}
					setProgress={setProgress}
					setShowGraph={setShowGraph}
					setTheme={toggleTheme}
					setEditMode={setEditMode}
					editMode={editMode}
					setProyection={setProyection}
					setSeeProyection={setSeeProyection}
					theme={theme}
				/>
			)}
			{showGraph && seeProyection && (
				<ProyectionGraph
					courses={courses}
					proyection={proyection}
					setShowProyection={setSeeProyection}
				/>
			)}
		</div>
	);
}
