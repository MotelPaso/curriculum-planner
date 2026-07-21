import { FaMoon } from "react-icons/fa";
import { MdLightMode } from "react-icons/md";

export default function ThemeButton({ theme, setTheme }) {
	return (
		<button
			className="font-bold text-3xl pr-4 cursor-pointer"
			onClick={() => setTheme()}
		>
			{theme === "light" ? <FaMoon /> : <MdLightMode color="white" />}
		</button>
	);
}
