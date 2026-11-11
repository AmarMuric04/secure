import reactConfig from "eslint-config-react";
import baseConfig from "eslint-config-base";
import { defineConfig } from "eslint/config";
import globals from "globals";

const SERVICE_IMPORT_MESSAGE =
	"Apps never call services directly. Use business-logic-secure.";

export default defineConfig([
	{ ignores: ["api/_lib/server.js"] },

	...baseConfig,

	...reactConfig,

	{
		languageOptions: {
			globals: { ...globals.browser, React: "readonly", JSX: "readonly" },
			parserOptions: {
				project: "tsconfig.json",
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			"no-restricted-imports": [
				"error",
				{
					paths: [
						{ name: "secure-service", message: SERVICE_IMPORT_MESSAGE },
						{ name: "crypto-service", message: SERVICE_IMPORT_MESSAGE },
						{ name: "secure-api", message: SERVICE_IMPORT_MESSAGE },
					],
					patterns: [
						{
							group: [
								"secure-service/*",
								"crypto-service/*",
								"secure-api/*",
							],
							message: SERVICE_IMPORT_MESSAGE,
						},
					],
				},
			],
			"nima/restrict-imports": [
				"error",
				[
					{
						allowImports: ["Route"],
						from: ["**/routes/**"],
						folders: ["**/pages/**"],
					},
				],
			],
			"nima/restrict-function-usage": [
				"error",
				[
					{
						allowFunctions: ["useSearch", "useParams"],
						folders: ["**/pages/**"],
					},
				],
			],
		},
	},

	{
		files: ["*.config.*", "api/**"],
		languageOptions: {
			globals: globals.node,
		},
	},

	{
		files: ["api/**"],
		rules: { "no-restricted-imports": "off" },
	},
]);
