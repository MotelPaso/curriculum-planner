import ErrorMessage from "../ErrorMessage";
import ThemeButton from "../ThemeButton";
import CareerButton from "./CareerButton";

export default function CareerSelector({
	onSelect,
	error,
	loading,
	theme,
	setTheme,
}) {
	return (
		<div className="flex items-center justify-center w-full h-full">
			<div className="flex flex-col justify-evenly items-center rounded-2xl shadow-2xl w-112 h-80 bg-white border-(--color-border) border-4">
				<h1 className="text-4xl font-bold p-5">Elije tu carrera</h1>
				<div className="flex flex-row w-full justify-around px-2">
					<CareerButton
						career={"ICCI"}
						loading={loading}
						func={onSelect}
					/>
					<CareerButton career={"ICI"} loading={loading} func={onSelect} />
					<CareerButton career={"ITI"} loading={loading} func={onSelect} />
				</div>
				{error && <ErrorMessage error={error} />}
			</div>
			<div className="absolute top-3 right-0 text-4xl">
				<ThemeButton theme={theme} setTheme={setTheme} />
			</div>
			<div className="text-(--color-text) absolute bottom-2 opacity-75">
				<p>
					Hecho por <span className="font-bold ">Paulo Araya</span>
				</p>
			</div>
		</div>
	);
}
