import { FaArrowLeft } from "react-icons/fa";
import ThemeButton from "./ThemeButton";
export default function TopBar({ setShowGraph, theme, setTheme, setEditMode }) {
	return (
		<div className="w-screen flex flex-row items-center justify-between ">
			<button
				className="font-bold text-3xl pl-4 cursor-pointer flex"
				onClick={() => {
					setEditMode(false);
					setShowGraph(false);
				}}
			>
				<FaArrowLeft color={theme === "light" ? "black" : "white"} />
			</button>

			<ThemeButton theme={theme} setTheme={setTheme} />
		</div>
	);
}
