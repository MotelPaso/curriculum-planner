import { ICCI, ICI } from "../data/courses";

export default function CareerSelector({ setCareer, setShowGraph }) {
	const buttonToggle = (career) => {
		setCareer(career);
		setShowGraph(true);
	};

	return (
		<div className="flex items-center justify-center w-full h-full">
			<div className="flex flex-col justify-evenly items-center border-4 rounded-2xl shadow-2xl w-100 h-80">
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
		</div>
	);
}
