import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages serves 404.html for unknown paths, so shipping a copy of the
// built index there lets deep links (e.g. /curriculum-planner/ICCI/proyeccion)
// boot the SPA instead of hitting a bare 404 page.
function spaFallback() {
	return {
		name: "spa-fallback-404",
		apply: "build",
		closeBundle() {
			const dist = resolve("dist");
			copyFileSync(resolve(dist, "index.html"), resolve(dist, "404.html"));
		},
	};
}

// https://vite.dev/config/
export default defineConfig({
	server: true,
	base: "/curriculum-planner/",
	plugins: [react(), tailwindcss(), spaFallback()],
});
