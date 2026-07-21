import { useReactFlow } from "@xyflow/react";
import { VscEdit } from "react-icons/vsc";
import {
	FiSend,
	FiRotateCcw,
	FiMaximize,
	FiServer,
	FiLoader,
} from "react-icons/fi";
import MinorToggle from "./MinorToggle";

export default function BotBar({
	theme,
	career,
	setEditMode,
	editMode,
	resetLayout,
	setProgress,
	sendProgress,
	loadingProyection,
	minors,
	selectedMinorId,
	onChange,
}) {
	const flow = useReactFlow();

	const resetAll = () => {
		resetLayout();
		setTimeout(() => flow.fitView({ minZoom: 0.5, duration: 300 }), 0);
	};

	return (
		<div className="flex flex-col justify-start gap-1 text-2xl text-(--color-text) bg-(--color-bg) rounded-2xl p-2 w-48">
			{editMode && (
				<>
					<MinorToggle
						minors={minors}
						selectedMinorId={selectedMinorId}
						onChange={onChange}
					/>
					<button
						className="flex items-center gap-2 p-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 bg-(--color-btn-bar) hover:bg-(--hover-btn-bar) rounded-2xl"
						onClick={() => sendProgress()}
						disabled={loadingProyection}
						title="Enviar Progreso"
					>
						{!loadingProyection && (
							<>
								<FiSend color={theme} />
								<span className="text-sm font-medium">Ver Proyección</span>
							</>
						)}
						{loadingProyection && (
							<>
								<FiLoader color={theme} className="animate-spin" />
								<span className="text-sm font-medium">Procesando...</span>
							</>
						)}
					</button>
					<button
						className="flex items-center  gap-2 p-2 cursor-pointer bg-(--color-btn-bar) hover:bg-(--hover-btn-bar) rounded-2xl"
						onClick={() => setProgress((prev) => ({}))}
						title="Reiniciar Progreso"
					>
						<FiRotateCcw color={theme} />
						<span className="text-sm font-medium">Reiniciar Progreso</span>
					</button>
				</>
			)}
			<button
				className="flex items-center gap-2 p-2 cursor-pointer bg-(--color-btn-bar) hover:bg-(--hover-btn-bar) rounded-2xl"
				onClick={() => setEditMode(!editMode)}
				title="Alternar modo edición"
			>
				{editMode ? <FiServer color={theme} /> : <VscEdit color={theme} />}
				<span className="text-sm font-medium">
					{editMode ? "Ver Malla" : "Editar Progreso"}
				</span>
			</button>
			<button
				className="flex items-center gap-2 p-2 cursor-pointer bg-(--color-btn-bar) hover:bg-(--hover-btn-bar) rounded-2xl"
				onClick={() => resetAll()}
				title="Centrar vista"
			>
				<FiMaximize color={theme} />
				<span className="text-sm font-medium">Centrar Vista</span>
			</button>
		</div>
	);
}
