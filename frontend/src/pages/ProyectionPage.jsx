import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import ProyectionGraph from "../components/Graphs/ProyectionGraph";
import StatusScreen from "../components/StatusScreen";
import { coursesForCareer, minorById } from "../data";
import { usePlanner } from "../planner/context";
import { getProyection } from "../services/API";
import { minorQuery, readMinorParam } from "../utils/minorParam";

export default function ProyectionPage() {
	const { career: rawCareer } = useParams();
	const career = rawCareer?.toUpperCase();
	const planner = usePlanner();
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const valid = Boolean(coursesForCareer(career));

	const requestedMinor = readMinorParam(searchParams);
	const minorId = minorById(requestedMinor)?.career === career ? requestedMinor : 0;

	// When arriving from the curriculum view the projection is already computed.
	const [proyection, setProyection] = useState(location.state?.proyection ?? null);
	const [error, setError] = useState(null);

	const { loadCareer } = planner;
	useEffect(() => {
		if (valid) loadCareer(career);
	}, [career, valid, loadCareer]);

	useEffect(() => {
		if (!valid || proyection || planner.career !== career) return;

		let cancelled = false;
		const coursesSent = Object.entries(planner.progress)
			.filter(([, status]) => status === "completed" || status === "ongoing")
			.map(([code]) => code);

		getProyection(career, coursesSent, minorId).then((result) => {
			if (cancelled) return;
			if (result.state) setProyection(result.data);
			else setError(result.error);
		});

		return () => {
			cancelled = true;
		};
	}, [valid, proyection, planner.career, career, planner.progress, minorId]);

	if (!valid) return <Navigate to="/" replace />;

	if (error) {
		return (
			<StatusScreen
				error={error}
				onBack={() => navigate(`/${career}${minorQuery(minorId)}`)}
				backLabel="Volver a la malla"
			/>
		);
	}

	if (!proyection || planner.career !== career) {
		return <StatusScreen />;
	}

	return (
		<ProyectionGraph
			courses={planner.courses}
			proyection={proyection}
			theme={planner.theme}
			onBack={() => navigate(`/${career}${minorQuery(minorId)}`)}
		/>
	);
}
