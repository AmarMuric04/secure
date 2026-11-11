const MIN_MASTER_PASSWORD_LENGTH = 12;

const BROWSERS = [
	{ pattern: /Edg\//, name: "Edge" },
	{ pattern: /OPR\/|Opera/, name: "Opera" },
	{ pattern: /Firefox\//, name: "Firefox" },
	{ pattern: /Chrome\//, name: "Chrome" },
	{ pattern: /Safari\//, name: "Safari" },
];

const PLATFORMS = [
	{ pattern: /iPhone|iPad/, name: "iOS" },
	{ pattern: /Android/, name: "Android" },
	{ pattern: /Windows/, name: "Windows" },
	{ pattern: /Mac OS X|Macintosh/, name: "macOS" },
	{ pattern: /CrOS/, name: "ChromeOS" },
	{ pattern: /Linux/, name: "Linux" },
];

const readDeviceLabel = (userAgent: string | null) => {
	if (!userAgent) {
		return "Unknown device";
	}

	const browser = BROWSERS.find(({ pattern }) => pattern.test(userAgent));
	const platform = PLATFORMS.find(({ pattern }) => pattern.test(userAgent));

	if (!browser && !platform) {
		return "Unknown device";
	}

	return [browser?.name ?? "Browser", platform?.name]
		.filter(Boolean)
		.join(" on ");
};

const readMasterPasswordChangeError = ({
	currentPassword,
	nextPassword,
	confirmation,
}: {
	currentPassword: string;
	nextPassword: string;
	confirmation: string;
}) => {
	if (!currentPassword) {
		return "Enter your current master password";
	}

	if (nextPassword.length < MIN_MASTER_PASSWORD_LENGTH) {
		return `Use at least ${MIN_MASTER_PASSWORD_LENGTH} characters`;
	}

	if (nextPassword === currentPassword) {
		return "Choose a password different from the current one";
	}

	if (nextPassword !== confirmation) {
		return "New passwords do not match";
	}

	return null;
};

export {
	MIN_MASTER_PASSWORD_LENGTH,
	readDeviceLabel,
	readMasterPasswordChangeError,
};
