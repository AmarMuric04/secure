import devServer from "@hono/vite-dev-server";
import dns from "node:dns";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
	Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

	dns.setServers([...dns.getServers(), "1.1.1.1", "8.8.8.8"]);

	return {
		plugins: [
			tsconfigPaths(),
			tanstackRouter({
				autoCodeSplitting: true,
				target: "react",
			}),
			react(),
			tailwindcss(),
			devServer({
				entry: "../../packages/secure-api/src/index.ts",
				export: "app",
				exclude: [/^(?!\/api(\/|$)).*/],
				injectClientScript: false,
			}),
		],
		server: { port: 5_179, strictPort: true },
	};
});
