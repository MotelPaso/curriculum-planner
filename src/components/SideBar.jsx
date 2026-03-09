export default function SideBar({ colorMode, setColorMode }) {
	let style;
	if (colorMode == "Simple") {
		style = { border: "#94a3b8", bg: "#ffffff" };
	}
	if (colorMode == "Dificultad") {
		style = { background: "#FFFFFF", borderColor: "#111111" };
	}

	return (
		<div className="flex flex-col border" style={style}>
			<p className="font-bold text-center">Colores:</p>
			<div className="flex flex-col items-start w-full">
				<button
					className="p-1 border-y w-full"
					onClick={() => setColorMode("Estado")}
				>
					Estado
				</button>
				<button
					className="p-1 border-y w-full"
					onClick={() => setColorMode("Dificultad")}
				>
					Dificultad
				</button>
				<button
					className="p-1 border-y w-full"
					onClick={() => setColorMode("Simple")}
				>
					Simple
				</button>
			</div>
		</div>
	);
}
