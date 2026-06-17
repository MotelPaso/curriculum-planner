import { VscEdit, VscEditSparkle } from "react-icons/vsc";
import { TbFocusCentered } from "react-icons/tb";
import { RiResetLeftLine } from "react-icons/ri";
import { useReactFlow } from "@xyflow/react";

export default function BotBar({
	theme,
	career,
	setEditMode,
	editMode,
	resetLayout,
	setProgress,
	sendProgress,
}) {
	const flow = useReactFlow();
	const resetAll = () => {
		resetLayout();
		setTimeout(() => flow.fitView({ duration: 300 }), 0);
	};

	return (
		<div className="flex flex-col justify-start text-3xl">
			{editMode && (
				<>
					<button
						className="pl-0 p-2 cursor-pointer"
						onClick={() => sendProgress()}
						title="Enviar Progreso"
					>
						enviar
					</button>
					<button
						className="pl-0 p-2 cursor-pointer"
						onClick={() => setProgress((prev) => "")}
						title="Reiniciar Progreso"
					>
						<RiResetLeftLine color={theme == "light" ? "black" : "white"} />
					</button>
				</>
			)}
			<button
				className="pl-0 p-2 cursor-pointer"
				onClick={() => setEditMode(!editMode)}
				title="Alternar modo edicion"
			>
				{editMode ? (
					<VscEditSparkle color={theme == "light" ? "black" : "white"} />
				) : (
					<VscEdit color={theme == "light" ? "black" : "white"} />
				)}
			</button>
			<button
				className="pl-0 p-2 cursor-pointer"
				onClick={() => resetAll()}
				title="Centrar vista"
			>
				<TbFocusCentered color={theme == "light" ? "black" : "white"} />
			</button>
		</div>
	);
}
