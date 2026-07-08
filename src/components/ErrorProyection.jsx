import { useEffect } from "react";

export default function ErrorProyection({ message, onClose }) {
	useEffect(() => {
		if (!message) return;
		const timer = setTimeout(onClose, 4000);
		return () => clearTimeout(timer);
	}, [message, onClose]);

	if (!message) return null;

	return (
		<div
			className="error fixed bottom-8 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3"
			style={{ background: "var(--color-danger, #dc2626)", color: "#fff" }}
			role="alert"
		>
			<span className="text-md font-medium">{message}</span>
			<button onClick={onClose} className="text-white/80 hover:text-white">
				✕
			</button>
		</div>
	);
}
