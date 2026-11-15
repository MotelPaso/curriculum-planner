import { FaArrowLeft } from "react-icons/fa";
import ThemeButton from "./ThemeButton";

export default function TopBar({ onBack, theme, setTheme, setEditMode }) {
	return (
		<div className="w-screen flex flex-row items-center justify-between ">
			<button
				className="font-bold text-3xl pl-4 cursor-pointer flex"
				title="Volver al inicio"
				onClick={() => {
					setEditMode(false);
					onBack();
				}}
			>
				<FaArrowLeft color={theme === "light" ? "black" : "white"} />
			</button>

			<ThemeButton theme={theme} setTheme={setTheme} />
		</div>
	);
}
