import baseConfig from "eslint-config-base";
import globals from "globals";

export default [
	{ ignores: ["apps/**"] },

	...baseConfig,

	{
		languageOptions: {
			globals: { ...globals.node },
		},
	},
];
