import { useState } from "react";
import { RiArrowLeftSLine } from "react-icons/ri";
import { FaMoon, FaArrowLeft } from "react-icons/fa";
import { MdLightMode } from "react-icons/md";
export default function TopBar({ setShowGraph, theme, setTheme, setEditMode }) {
	const [showMessage, setShowMessage] = useState(true);

	return (
		<div className="w-screen flex flex-row items-center justify-between ">
			<button
				className="font-bold text-3xl pl-4 cursor-pointer flex"
				onClick={() => {
					setEditMode(false);
					setShowGraph(false);
				}}
			>
				<FaArrowLeft color={theme == "light" ? "black" : "white"} />
			</button>

			<button
				className="font-bold text-3xl pr-4 cursor-pointer"
				onClick={() => setTheme()}
			>
				{theme == "light" ? <FaMoon /> : <MdLightMode color="white" />}
			</button>
		</div>
	);
}
