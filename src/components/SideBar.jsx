export default function SideBar({ colorMode, setColorMode }) {
	let style = { background: "#FFFFFF", borderColor: "#111111" };
	if (colorMode == "Simple") {
		style = { borderColor: "#94a3b8", background: "#ffffff" };
	}
	if (colorMode == "Dificultad") {
		style = { background: "#FFFFFF", borderColor: "#111111" };
	}

	return (
		<div className="flex flex-col border" style={style}>
			<p className="font-bold text-center">Colores:</p>
			<div className="flex flex-col items-start w-full">
				<button
					className="p-1 w-full"
					onClick={() => setColorMode("Dificultad")}
				>
					Dificultad
				</button>
				<button className="p-1 w-full" onClick={() => setColorMode("Simple")}>
					Simple
				</button>
			</div>
		</div>
	);
}
