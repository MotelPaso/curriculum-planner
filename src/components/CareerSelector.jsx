import { ICCI, ICI } from "../data/courses";
import { useState } from "react";
import { FaMoon } from "react-icons/fa";
import { MdLightMode } from "react-icons/md";
export default function CareerSelector({
	setCareer,
	setShowGraph,
	setTheme,
	theme,
}) {
	const buttonToggle = (career) => {
		setCareer(career);
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
						onClick={() => buttonToggle(ICCI)}
					>
						ICCI
					</button>
					<button
						className="cursor-pointer w-[40%] p-4 text-2xl rounded-2xl bg-orange-200 "
						onClick={() => buttonToggle(ICI)}
					>
						ICI
					</button>
				</div>
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
