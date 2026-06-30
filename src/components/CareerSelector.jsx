import { FaMoon } from "react-icons/fa";
import { MdLightMode } from "react-icons/md";
import { getCourseData } from "../services/API";
import ErrorMessage from "./ErrorMessage";
export default function CareerSelector({
	setCourses,
	setCareer,
	setShowGraph,
	setTheme,
	error,
	setError,
	loading,
	setLoading,
	theme,
}) {
	const sendCourseData = async (career) => {
		setLoading(career);
		const courses = await getCourseData(career);
		setLoading(null);
		if (!courses.state) {
			setError(courses.error);
			return;
		}
		setCareer(career);
		setCourses(courses.data);
		setShowGraph(true);
	};

	return (
		<div className="flex items-center justify-center w-full h-full">
			<div
				className="flex flex-col justify-evenly items-center rounded-2xl shadow-2xl w-100 h-80 bg-white"
				style={{ borderColor: "var(--color-border)", borderWidth: "4px" }}
			>
				<h1 className="text-4xl font-bold p-5">Elije tu carrera</h1>
				<div className="flex flex-row w-full justify-around">
					<button
						className="cursor-pointer w-[40%] p-4 text-2xl rounded-2xl bg-blue-100"
						onClick={() => sendCourseData("ICCI")}
						disabled={loading !== null}
					>
						{loading === "ICCI" ? "Cargando..." : "ICCI"}
					</button>
					<button
						className="cursor-pointer w-[40%] p-4 text-2xl rounded-2xl bg-orange-200 "
						onClick={() => sendCourseData("ICI")}
						disabled={loading !== null}
					>
						{loading === "ICI" ? "Cargando..." : "ICI"}
					</button>
				</div>
				{error && <ErrorMessage error={error} />}
			</div>
			{/* Theme selector */}
			<div className="absolute top-0 right-0 flex flex-col justify-evenly">
				<button className="p-4 text-3xl " onClick={() => setTheme()}>
					{theme == "light" ? <FaMoon /> : <MdLightMode color="white" />}
				</button>
			</div>
		</div>
	);
}
