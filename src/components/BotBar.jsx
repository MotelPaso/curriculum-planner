import { useReactFlow } from "@xyflow/react";
import { VscEdit, VscEditSparkle } from "react-icons/vsc";
import { GrPlan } from "react-icons/gr";
import { TbFocusCentered } from "react-icons/tb";
import { RiResetLeftLine } from "react-icons/ri";
import { FiSend, FiRotateCcw, FiMaximize, FiServer } from "react-icons/fi";

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
	const iconColor = theme == "light" ? "black" : "white";

	const resetAll = () => {
		resetLayout();
		setTimeout(() => flow.fitView({ duration: 300 }), 0);
	};

	return (
		<div className="flex flex-col justify-start gap-1 text-2xl text-(--color-text) bg-(--color-bg) rounded-2xl p-2">
			{editMode && (
				<>
					<button
						className="flex items-center gap-2 p-2 cursor-pointer"
						onClick={() => sendProgress()}
						title="Enviar Progreso"
					>
						<FiSend color={iconColor} />
						<span className="text-sm font-medium">Ver Proyeccion</span>
					</button>
					<button
						className="flex items-center gap-2 p-2 cursor-pointer"
						onClick={() => setProgress((prev) => "")}
						title="Reiniciar Progreso"
					>
						<FiRotateCcw color={iconColor} />
						<span className="text-sm font-medium">Reiniciar</span>
					</button>
				</>
			)}
			<button
				className="flex items-center gap-2 p-2 cursor-pointer"
				onClick={() => setEditMode(!editMode)}
				title="Alternar modo edición"
			>
				{editMode ? (
					<FiServer color={iconColor} />
				) : (
					<VscEdit color={iconColor} />
				)}
				<span className="text-sm font-medium">
					{editMode ? "Ver Malla" : "Editar"}
				</span>
			</button>
			<button
				className="flex items-center gap-2 p-2 cursor-pointer"
				onClick={() => resetAll()}
				title="Centrar vista"
			>
				<FiMaximize color={iconColor} />
				<span className="text-sm font-medium">Centrar</span>
			</button>
		</div>
	);
}
