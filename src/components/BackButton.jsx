export default function BackButton({ setShowGraph }) {
	return (
		<div>
			<button
				className="font-bold text-3xl px-1 cursor-pointer"
				onClick={() => setShowGraph(false)}
			>
				{"<"}
			</button>
		</div>
	);
}
