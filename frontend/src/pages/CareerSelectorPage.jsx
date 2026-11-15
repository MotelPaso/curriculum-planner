import { useNavigate } from "react-router-dom";
import CareerSelector from "../components/CareerSelector/CareerSelector";
import { usePlanner } from "../planner/context";

export default function CareerSelectorPage() {
	const { loading, error, theme, toggleTheme, loadCareer } = usePlanner();
	const navigate = useNavigate();

	const selectCareer = async (code) => {
		const loaded = await loadCareer(code);
		if (loaded) navigate(`/${code.toUpperCase()}`);
	};

	return (
		<CareerSelector
			onSelect={selectCareer}
			loading={loading}
			error={error}
			theme={theme}
			setTheme={toggleTheme}
		/>
	);
}
