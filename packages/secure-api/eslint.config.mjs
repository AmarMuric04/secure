import baseConfig from "eslint-config-base";
import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig([
	...baseConfig,

	{
		languageOptions: {
			globals: { ...globals.node },
		},
	},
]);
