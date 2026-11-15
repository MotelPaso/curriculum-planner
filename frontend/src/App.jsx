import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PlannerProvider } from "./planner/PlannerProvider";
import { usePlanner } from "./planner/context";
import CareerSelectorPage from "./pages/CareerSelectorPage";
import CurriculumPage from "./pages/CurriculumPage";
import ProyectionPage from "./pages/ProyectionPage";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

function Shell() {
	const { theme } = usePlanner();

	return (
		<div
			data-theme={theme}
			className="w-dvw h-dvh flex items-center justify-center"
			style={{ background: "var(--color-bg)" }}
		>
			<Routes>
				<Route path="/" element={<CareerSelectorPage />} />
				<Route path="/:career" element={<CurriculumPage />} />
				<Route path="/:career/proyeccion" element={<ProyectionPage />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</div>
	);
}

export default function App() {
	return (
		<BrowserRouter basename={basename}>
			<PlannerProvider>
				<Shell />
			</PlannerProvider>
		</BrowserRouter>
	);
}
