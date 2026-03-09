import { ICCI, ICI } from "../data/courses";

export default function CareerSelector({ setCareer, setShowGraph }) {
	const buttonToggle = (career) => {
		setCareer(career);
		setShowGraph(true);
	};

	return (
		<div className="flex items-center justify-center w-full h-full">
			<div className="flex flex-col border shadow-2xl">
				<h1 className="text-3xl font-bold p-5">Elije tu carrera</h1>
				<div className="flex flex-row border justify-around">
					<button
						className="cursor-pointer w-full border p-4 text-2xl"
						onClick={() => buttonToggle(ICCI)}
					>
						ICCI
					</button>
					<button
						className="w-full border p-4 text-2xl"
						onClick={() => buttonToggle(ICI)}
					>
						ICI
					</button>
				</div>
			</div>
		</div>
	);
}
