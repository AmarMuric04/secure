import { type auditVault, isSuggestion } from "./securityAudit";
import type { decryptVault } from "./vaultEntries";

const buildSecurityReport = ({
	passwords,
	audit,
}: {
	passwords: Awaited<ReturnType<typeof decryptVault>>["passwords"];
	audit: ReturnType<typeof auditVault>;
}) => {
	const readIssues = (id: string) => audit.issuesById[id] ?? [];
	const issues = passwords.filter((entry) =>
		readIssues(entry.id).some((issue) => !isSuggestion(issue)),
	);
	const suggestions = passwords.filter((entry) =>
		readIssues(entry.id).some((issue) => isSuggestion(issue)),
	);

	return { issues, suggestions, issueCount: issues.length };
};

const readEntryHostname = (url: string | undefined) => {
	if (!url) {
		return null;
	}

	try {
		return new URL(url).hostname;
	} catch {
		return null;
	}
};

export { buildSecurityReport, readEntryHostname };
