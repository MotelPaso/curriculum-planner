import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
/* TODO:
 *   Enhance the UX of seeing a prerequisite
 *   Add a button to hold the course
 *   Add more animations
 *   Add more coloring options and a nicer toggle for the coloring
 *   Actually make the planning thing with it.
 */
