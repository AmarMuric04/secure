const toFaviconUrl = (domain: string) =>
	`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;

const readUrlDomain = (url: string) => {
	try {
		return new URL(url.includes("://") ? url : `https://${url}`).hostname;
	} catch {
		return null;
	}
};

const toFaviconUrls = (url: string | undefined) => {
	const trimmedUrl = url?.trim();
	const domain = trimmedUrl ? readUrlDomain(trimmedUrl) : null;

	return domain ? [toFaviconUrl(domain)] : [];
};

export { toFaviconUrls };
