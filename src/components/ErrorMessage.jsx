export default function ErrorMessage({ error }) {
	return (
		<div className="flex flex-row justify-center items-center bg-red-200 border-2 border-red-300 text-(--color-text-error) rounded-3xl mx-6">
			<p className="font-medium text-center px-3 py-2">{error}</p>
		</div>
	);
}
