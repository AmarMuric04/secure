import type { sealEntry } from "./vaultEntries";

const PASSWORD_HISTORY_LIMIT = 10;

const pushPasswordHistory = ({
	history,
	password,
	now,
}: {
	history: { password: string; changedAt: string }[];
	password: string;
	now: number;
}) =>
	[
		{ password, changedAt: new Date(now).toISOString() },
		...history.filter((item) => item.password !== password),
	].slice(0, PASSWORD_HISTORY_LIMIT);

const toRestoredEntry = <
	Entry extends Parameters<typeof sealEntry>[0] & { id: string },
>({
	entry,
	historyIndex,
	now,
}: {
	entry: Entry;
	historyIndex: number;
	now: number;
}) => {
	const history = entry.passwordHistory ?? [];
	const restored = history[historyIndex];

	if (!restored) {
		return entry;
	}

	return {
		...entry,
		password: restored.password,
		isCompromised: false,
		passwordHistory: pushPasswordHistory({
			history: history.filter((_, index) => index !== historyIndex),
			password: entry.password,
			now,
		}),
	};
};

export { PASSWORD_HISTORY_LIMIT, pushPasswordHistory, toRestoredEntry };
