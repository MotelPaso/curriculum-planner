import ErrorMessage from "./ErrorMessage";

export default function StatusScreen({ error, onBack, backLabel = "Volver" }) {
	return (
		<div className="flex flex-col items-center justify-center gap-4 w-full max-w-md px-6">
			{error ? (
				<ErrorMessage error={error} />
			) : (
				<p className="text-xl text-(--color-text) opacity-80">Cargando malla...</p>
			)}
			{onBack && (
				<button
					onClick={onBack}
					className="px-4 py-2 rounded-2xl text-sm font-medium text-(--color-text) bg-(--color-btn-bar) hover:bg-(--hover-btn-bar) cursor-pointer"
				>
					{backLabel}
				</button>
			)}
		</div>
	);
}
