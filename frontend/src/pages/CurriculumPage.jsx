import { useCallback, useEffect } from "react";
import {
	Navigate,
	useNavigate,
	useParams,
	useSearchParams,
} from "react-router-dom";
import CurriculumGraph from "../components/Graphs/CurriculumGraph";
import StatusScreen from "../components/StatusScreen";
import { coursesForCareer, minorById } from "../data";
import { usePlanner } from "../planner/context";
import { minorQuery, readMinorParam } from "../utils/minorParam";

export default function CurriculumPage() {
	const { career: rawCareer } = useParams();
	const career = rawCareer?.toUpperCase();
	const planner = usePlanner();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const valid = Boolean(coursesForCareer(career));

	const { loadCareer } = planner;
	useEffect(() => {
		if (valid) loadCareer(career);
	}, [career, valid, loadCareer]);

	const requestedMinor = readMinorParam(searchParams);
	// A minor only applies to its own career; ignore stale/shared links.
	const selectedMinorId =
		minorById(requestedMinor)?.career === career ? requestedMinor : 0;

	const setSelectedMinorId = useCallback(
		(minorId) => {
			setSearchParams(
				(previous) => {
					const next = new URLSearchParams(previous);
					if (minorId) next.set("minor", String(minorId));
					else next.delete("minor");
					return next;
				},
				{ replace: true },
			);
		},
		[setSearchParams],
	);

	if (!valid) return <Navigate to="/" replace />;

	if (planner.career !== career || !planner.courses) {
		return (
			<StatusScreen
				error={planner.error}
				onBack={() => navigate("/")}
				backLabel="Elegir carrera"
			/>
		);
	}

	return (
		<CurriculumGraph
			courses={planner.courses}
			setCourses={planner.setCourses}
			baseCourses={planner.baseCourses}
			career={planner.career}
			progress={planner.progress}
			setProgress={planner.setProgress}
			editMode={planner.editMode}
			setEditMode={planner.setEditMode}
			theme={planner.theme}
			setTheme={planner.toggleTheme}
			selectedMinorId={selectedMinorId}
			setSelectedMinorId={setSelectedMinorId}
			onShowCareerSelector={() => navigate("/")}
			onShowProyection={(proyection) =>
				navigate(`/${career}/proyeccion${minorQuery(selectedMinorId)}`, {
					state: { proyection },
				})
			}
		/>
	);
}
