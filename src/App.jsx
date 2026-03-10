import { useState } from "react";
import CurriculumGraph from "./CurriculumGraph";
import CareerSelector from "./components/CareerSelector";

export default function App() {
	const [showGraph, setShowGraph] = useState(false);
	const [career, setCareer] = useState(null);
	return (
		<div className="w-screen h-screen bg-grey-100">
			{!showGraph && (
				<CareerSelector setCareer={setCareer} setShowGraph={setShowGraph} />
			)}
			{showGraph && (
				<CurriculumGraph courses={career} setShowGraph={setShowGraph} />
			)}
		</div>
	);
}
