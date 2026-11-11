import pluginRouter from "@tanstack/eslint-plugin-router";
import pluginReactRefresh from "eslint-plugin-react-refresh";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import nima from "eslint-plugin-nima";

export default defineConfig([
	...pluginRouter.configs["flat/recommended"],

	{
		plugins: { "react-refresh": pluginReactRefresh },
		rules: {
			"react-refresh/only-export-components": [
				"error",
				{ allowConstantExport: true },
			],
		},
	},

	{
		...pluginReactHooks.configs["recommended-latest"],
		rules: {
			...pluginReactHooks.configs["recommended-latest"].rules,
			"react-hooks/exhaustive-deps": "off",
		},
	},

	{
		...nima.configs["flat/recommended"],
		rules: {
			...nima.configs["flat/recommended"].rules,
			"nima/restrict-console-methods": "off",
		},
	},

	{
		...pluginReact.configs.flat.recommended,
		rules: {
			...pluginReact.configs.flat.recommended.rules,
			"react/react-in-jsx-scope": "off",
			"react/prop-types": "off",
		},
	},

	{
		settings: {
			react: {
				version: "detect",
			},
		},
	},
]);
