export default function TopBar({ setShowGraph }) {
	return (
		<div className="w-screen flex flex-row items-center">
			<div className="w-[10%]  flex justify-center">
				<button
					className="font-bold text-3xl px-1 cursor-pointer"
					onClick={() => setShowGraph(false)}
				>
					{"<"}
				</button>
			</div>
			<div className="flex flex-row w-[80%] justify-center ">
				<h1 className="text-3xl ">apreta un ramo para ver sus requisitos</h1>
			</div>
		</div>
	);
}
