import prettierConfig from "eslint-config-prettier/flat";
import unicornPlugin from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import nima from "eslint-plugin-nima";
import eslint from "@eslint/js";

import { unicorn } from "./unicorn.js";

export default defineConfig([
	{
		ignores: ["**/dist/**", "**/ui/**/*", "**/*.gen.ts"],
	},

	eslint.configs.recommended,

	tseslint.configs.recommended.map((config) => ({
		...config,
		files: ["**/*.{ts,mts,cts,tsx}"],
	})),

	{
		rules: {
			...unicorn.rules,
			"no-unused-vars": "off",
			"nima/prefer-arrow-functions": "error",
			"nima/no-handler-suffix": "error",
			"nima/no-optional-call-expression": "warn",
			"nima/params-naming-convention": [
				"error",
				{
					ignore: [
						"_",
						"ref",
						"data",
						"props",
						"state",
						"event",
						"index",
						"options",
					],
					ignorePrefixes: ["$", "_"],
					ignoreFunctions: ["map", "reduce"],
				},
			],
		},
		plugins: {
			nima,
			unicorn: unicornPlugin,
		},
	},

	{
		...prettierConfig,
		rules: {
			...prettierConfig.rules,
			curly: "error",
		},
	},
]);
