export default function CareerButton({ career, loading, func }) {
	const colors = {
		ICCI: "bg-blue-200 hover:outline-2 hover:outline-blue-300 hover:shadow-md hover:scale-[101%]",
		ICI: "bg-orange-200 hover:outline-2 hover:outline-orange-300 hover:shadow-md hover:scale-[101%]",
		ITI: "bg-green-200 hover:outline-2 hover:outline-green-300 hover:shadow-md hover:scale-[101%]",
	};

	return (
		<button
			className={`flex justify-center items-center cursor-pointer w-[30%] p-4 text-2xl rounded-2xl   ${colors[career]} ${loading == career ? "outline-2" : ""}`}
			onClick={() => func(career)}
			disabled={loading !== null}
		>
			{loading === career ? "Cargando..." : career}
		</button>
	);
}
