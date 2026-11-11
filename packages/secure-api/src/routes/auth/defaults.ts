const DEFAULT_CATEGORIES = [
	{ name: "Finance", icon: "💳", color: "#10B981", order: 0 },
	{ name: "Email", icon: "📧", color: "#3B82F6", order: 1 },
	{ name: "Work", icon: "💼", color: "#8B5CF6", order: 2 },
	{ name: "Entertainment", icon: "🎮", color: "#EC4899", order: 3 },
	{ name: "Shopping", icon: "🛒", color: "#F59E0B", order: 4 },
	{ name: "Social", icon: "🌐", color: "#06B6D4", order: 5 },
];

const DEFAULT_SETTINGS = {
	theme: "system",
	language: "en",
	timezone: "UTC",
	autoLockMinutes: 15,
	clearClipboardSeconds: 30,
	showPasswordStrength: true,
	emailOnNewLogin: true,
	emailOnPasswordChange: true,
	emailSecurityAlerts: true,
	defaultView: "grid",
	defaultSort: "name",
	showFavicons: false,
	passwordMaxAgeDays: 90,
} as const;

export { DEFAULT_CATEGORIES, DEFAULT_SETTINGS };
