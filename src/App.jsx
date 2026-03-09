import { useState } from "react";
import CurriculumGraph from "./CurriculumGraph";
import { ICCI, ICI } from "./data/courses";

export default function App() {
	const [showGraph, setShowGraph] = useState(true);
	const [career, setCareer] = useState(ICCI);
	return (
		<div className="w-screen h-screen bg-gray-100">
			{!showGraph && (
				<CareerSelector setCareer={setCareer} setShowGraph={setShowGraph} />
			)}
			{showGraph && <CurriculumGraph courses={career} />}
		</div>
	);
}
