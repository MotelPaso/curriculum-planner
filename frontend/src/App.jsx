import { useEffect, useState } from "react";
import CurriculumGraph from "./components/Graphs/CurriculumGraph";
import CareerSelector from "./components/CareerSelector/CareerSelector";
import ProyectionGraph from "./components/Graphs/ProyectionGraph";

export default function App() {
	const [showGraph, setShowGraph] = useState(false);
	const [courses, setCourses] = useState(null);
	const [career, setCareer] = useState("");
	const [editMode, setEditMode] = useState(false);
	const [theme, setTheme] = useState(
		() => localStorage.getItem("theme") || "dark",
	);
	const [progress, setProgress] = useState(() => {
		try {
			const saved = localStorage.getItem("progress");
			return saved ? JSON.parse(saved) : {};
		} catch (error) {
			console.log(error);
		}
	});
	const [proyection, setProyection] = useState(null);
	const [seeProyection, setSeeProyection] = useState(false);
	const [loading, setLoading] = useState(null);
	const [error, setError] = useState(false);
	const toggleTheme = () => {
		const next = localStorage.getItem("theme") === "light" ? "dark" : "light";
		setTheme(next);
		localStorage.setItem("theme", next);
	};

	return (
		<div
			data-theme={theme}
			className={`w-dvw h-dvh flex items-center justify-center `}
			style={{ background: "var(--color-bg)" }}
		>
			{!showGraph && (
				<CareerSelector
					setCourses={setCourses}
					setCareer={setCareer}
					setShowGraph={setShowGraph}
					setTheme={toggleTheme}
					error={error}
					setError={setError}
					loading={loading}
					setLoading={setLoading}
					theme={theme}
				/>
			)}
			{showGraph && !seeProyection && (
				<CurriculumGraph
					courses={courses}
					career={career}
					progress={progress}
					setCourses={setCourses}
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
