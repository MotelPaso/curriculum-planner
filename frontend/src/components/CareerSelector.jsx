import { FaMoon } from "react-icons/fa";
import { MdLightMode } from "react-icons/md";
import { getCoursesBase, wakeBackend } from "../services/API";
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
		const courses = await getCoursesBase(career);
		setLoading(null);
		if (courses.error) {
			setError(courses.error);
			return;
		}
		wakeBackend();
		setError("");
		setCareer(career);
		setCourses(courses.data);
		setShowGraph(true);
	};

	return (
		<div className="flex items-center justify-center w-full h-full">
			<div
				className="flex flex-col justify-evenly items-center rounded-2xl shadow-2xl w-112 h-80 bg-white"
				style={{ borderColor: "var(--color-border)", borderWidth: "4px" }}
			>
				<h1 className="text-4xl font-bold p-5">Elije tu carrera</h1>
				<div className="flex flex-row w-full justify-around px-2">
					<button
						className="flex justify-center items-center cursor-pointer w-[30%] p-4 text-2xl rounded-2xl bg-blue-100 "
						onClick={() => sendCourseData("ICCI")}
						disabled={loading !== null}
					>
						{loading === "ICCI" ? "Cargando..." : "ICCI"}
					</button>
					<button
						className="flex justify-center items-center cursor-pointer w-[30%] p-4 text-2xl rounded-2xl bg-orange-200 text-center"
						onClick={() => sendCourseData("ICI")}
						disabled={loading !== null}
					>
						{loading === "ICI" ? "Cargando..." : "ICI"}
					</button>
					<button
						className="flex justify-center items-center cursor-pointer w-[30%] p-4 text-2xl rounded-2xl bg-green-100 text-center"
						onClick={() => sendCourseData("ITI")}
						disabled={loading !== null}
					>
						{loading === "ITI" ? "Cargando..." : "ITI"}
					</button>
				</div>
				{error && <ErrorMessage error={error} />}
			</div>
			<div className="absolute top-0 right-0 flex flex-col justify-evenly">
				<button className="p-4 text-3xl " onClick={() => setTheme()}>
					{theme == "light" ? <FaMoon /> : <MdLightMode color="white" />}
				</button>
			</div>
		</div>
	);
}
