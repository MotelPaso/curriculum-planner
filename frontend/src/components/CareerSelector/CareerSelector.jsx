import { FaMoon } from "react-icons/fa";
import { MdLightMode } from "react-icons/md";
import { getCoursesBase, wakeBackend } from "../../services/API";
import ErrorMessage from "../ErrorMessage";
import ThemeButton from "../ThemeButton";
import CareerButton from "./CareerButton";
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
		setCareer(career);
		setCourses(courses.data);
		setShowGraph(true);
	};

	return (
		<div className="flex items-center justify-center w-full h-full">
			<div className="flex flex-col justify-evenly items-center rounded-2xl shadow-2xl w-112 h-80 bg-white border-(--color-border) border-4">
				<h1 className="text-4xl font-bold p-5">Elije tu carrera</h1>
				<div className="flex flex-row w-full justify-around px-2">
					<CareerButton
						career={"ICCI"}
						loading={loading}
						func={() => sendCourseData("ICCI")}
					/>
					<CareerButton
						career={"ICI"}
						loading={loading}
						func={() => sendCourseData("ICI")}
					/>
					<CareerButton
						career={"ITI"}
						loading={loading}
						func={() => sendCourseData("ITI")}
					/>
				</div>
				{error && <ErrorMessage error={error} />}
			</div>
			<div className="absolute top-3 right-0 text-4xl">
				<ThemeButton theme={theme} setTheme={setTheme} />
			</div>
			<div className="text-(--color-text) absolute bottom-2 opacity-75">
				<p>
					Hecho por <span className="font-bold ">Paulo Araya</span>
				</p>
			</div>
		</div>
	);
}
