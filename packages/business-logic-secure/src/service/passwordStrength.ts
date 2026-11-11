const GUESSES_PER_SECOND = 10_000_000_000;
const CRACK_TIME_THRESHOLDS = [
	{ seconds: 1, label: "instantly" },
	{ seconds: 60, label: "seconds" },
	{ seconds: 3_600, label: "minutes" },
	{ seconds: 86_400, label: "hours" },
	{ seconds: 2_592_000, label: "days" },
	{ seconds: 31_536_000, label: "months" },
	{ seconds: 3_153_600_000, label: "years" },
	{ seconds: 3_153_600_000_000, label: "centuries" },
] as const;
const COMMON_PATTERNS = [
	/^123/,
	/321$/,
	/abc/i,
	/qwerty/i,
	/password/i,
	/(.)\1{2,}/,
	/^[a-z]+$/i,
	/^\d+$/,
];
const STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];

const scoreLength = (length: number) => {
	if (length < 8) {
		return 0;
	}

	if (length < 12) {
		return 1;
	}

	return length < 16 ? 2 : 3;
};

const estimateCrackTime = (entropy: number) => {
	const seconds = 2 ** entropy / GUESSES_PER_SECOND / 2;

	return (
		CRACK_TIME_THRESHOLDS.find((threshold) => seconds < threshold.seconds)
			?.label ?? "millennia+"
	);
};

const calculatePasswordStrength = (password: string) => {
	const classes = {
		lowercase: /[a-z]/.test(password),
		uppercase: /[A-Z]/.test(password),
		numbers: /\d/.test(password),
		symbols: /[^\dA-Za-z]/.test(password),
	};
	const varietyCount = Object.values(classes).filter(Boolean).length;
	const hasCommonPattern = COMMON_PATTERNS.some((pattern) =>
		pattern.test(password),
	);
	const rawScore = Math.max(
		0,
		scoreLength(password.length) +
			varietyCount -
			(hasCommonPattern ? 1 : 0),
	);
	const score = Math.min(4, Math.floor(rawScore / 2));
	const charsetSize =
		(classes.lowercase ? 26 : 0) +
		(classes.uppercase ? 26 : 0) +
		(classes.numbers ? 10 : 0) +
		(classes.symbols ? 32 : 0);
	const entropy = password.length * Math.log2(charsetSize || 1);
	const feedback = [
		password.length < 8 ? "Use at least 8 characters" : null,
		password.length >= 8 && password.length < 12
			? "Consider using 12+ characters for better security"
			: null,
		classes.lowercase ? null : "Add lowercase letters",
		classes.uppercase ? null : "Add uppercase letters",
		classes.numbers ? null : "Add numbers",
		classes.symbols ? null : "Add special characters",
		hasCommonPattern ? "Avoid common patterns" : null,
	].filter((message) => message !== null);

	return {
		score,
		label: STRENGTH_LABELS[score] ?? "Very weak",
		entropy: Math.round(entropy),
		crackTime: estimateCrackTime(entropy),
		feedback: feedback.slice(0, 3),
		isWeak: score <= 1,
	};
};

export { calculatePasswordStrength, STRENGTH_LABELS };
