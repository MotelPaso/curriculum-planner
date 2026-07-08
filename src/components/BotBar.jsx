import { useReactFlow } from "@xyflow/react";
import { VscEdit, VscEditSparkle } from "react-icons/vsc";
import { GrPlan } from "react-icons/gr";
import { TbFocusCentered } from "react-icons/tb";
import { RiResetLeftLine } from "react-icons/ri";
import {
	FiSend,
	FiRotateCcw,
	FiMaximize,
	FiServer,
	FiLoader,
} from "react-icons/fi";

export default function BotBar({
	theme,
	career,
	setEditMode,
	editMode,
	resetLayout,
	setProgress,
	sendProgress,
	loadingProyection,
}) {
	const flow = useReactFlow();
	const iconColor = theme == "light" ? "black" : "white";

	const resetAll = () => {
		resetLayout();
		setTimeout(() => flow.fitView({ minZoom: 0.5, duration: 300 }), 0);
	};

	return (
		<div className="flex flex-col justify-start gap-1 text-2xl text-(--color-text) bg-(--color-bg) rounded-2xl p-2 w-48">
			{editMode && (
				<>
					<button
						className="flex items-center gap-2 p-2 cursor-pointer  disabled:cursor-not-allowed disabled:opacity-70 bg-(--color-btn-bar) hover:bg-(--hover-btn-bar) rounded-2xl"
						onClick={() => sendProgress()}
						disabled={loadingProyection}
						title="Enviar Progreso"
					>
						{!loadingProyection && (
							<>
								<FiSend color={iconColor} />
								<span className="text-sm font-medium">Ver Proyección</span>
							</>
						)}
						{loadingProyection && (
							<>
								<FiLoader color={iconColor} className="animate-spin" />
								<span className="text-sm font-medium">Procesando...</span>
							</>
						)}
					</button>
					<button
						className="flex items-center  gap-2 p-2 cursor-pointer bg-(--color-btn-bar) hover:bg-(--hover-btn-bar) rounded-2xl"
						onClick={() => setProgress((prev) => "")}
						title="Reiniciar Progreso"
					>
						<FiRotateCcw color={iconColor} />
						<span className="text-sm font-medium">Reiniciar Progreso</span>
					</button>
				</>
			)}
			<button
				className="flex items-center justify- gap-2 p-2 cursor-pointer bg-(--color-btn-bar) hover:bg-(--hover-btn-bar) rounded-2xl"
				onClick={() => setEditMode(!editMode)}
				title="Alternar modo edición"
			>
				{editMode ? (
					<FiServer color={iconColor} />
				) : (
					<VscEdit color={iconColor} />
				)}
				<span className="text-sm font-medium">
					{editMode ? "Ver Malla" : "Editar Progreso"}
				</span>
			</button>
			<button
				className="flex items-center gap-2 p-2 cursor-pointer bg-(--color-btn-bar) hover:bg-(--hover-btn-bar) rounded-2xl"
				onClick={() => resetAll()}
				title="Centrar vista"
			>
				<FiMaximize color={iconColor} />
				<span className="text-sm font-medium">Centrar Vista</span>
			</button>
		</div>
	);
}
