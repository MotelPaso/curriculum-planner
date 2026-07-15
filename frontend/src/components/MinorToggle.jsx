import { useState } from "react";
import { HiChevronUp } from "react-icons/hi";
import { FaClipboardList } from "react-icons/fa";

export default function MinorToggle({ minors, selectedMinorId, onChange }) {
	const [enabled, setEnabled] = useState(false);

	const handleToggle = () => {
		const next = !enabled;
		setEnabled(next);
	};

	const handleSelect = (e) => {
		const id = Number(e.target.value);
		onChange(id);
	};

	return (
		<div className="flex flex-col rounded-lg bg-(--color-bg)">
			{enabled && (
				<div className="relative ">
					<select
						value={selectedMinorId ?? ""}
						onChange={handleSelect}
						className="w-full appearance-none rounded-md border border-transparent bg-(--color-bg) text-(--color-text) py-2 text-sm hover:border-blue-500 focus:outline-none hover:bg-(--hover-btn-bar) text-center"
					>
						{minors.length === 0 && (
							<option value="">Cargando minors...</option>
						)}
						<option key={0} value={0}>
							Sin Minor
						</option>
						{minors.map((m) => (
							<option key={m.id} value={m.id}>
								{m.name}
							</option>
						))}
					</select>
					<HiChevronUp
						size={16}
						className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-(--color-text)"
					/>
				</div>
			)}

			<button
				type="button"
				role="switch"
				aria-checked={enabled}
				onClick={handleToggle}
				className="flex items-center gap-2 p-2 cursor-pointer  disabled:cursor-not-allowed disabled:opacity-70 bg-(--color-btn-bar) hover:bg-(--hover-btn-bar) rounded-2xl"
			>
				<FaClipboardList />
				<span className="text-sm font-medium text-(--color-text) ">
					Elegir Minor
				</span>
			</button>
		</div>
	);
}
