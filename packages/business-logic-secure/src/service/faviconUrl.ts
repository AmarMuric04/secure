const DOMAIN_PATTERN = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

const toFaviconUrl = (domain: string) =>
	`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;

const readUrlDomain = (url: string) => {
	try {
		return new URL(url.includes("://") ? url : `https://${url}`).hostname;
	} catch {
		return null;
	}
};

const guessTitleDomains = (title: string) => {
	const cleaned = title.trim().toLowerCase();

	if (DOMAIN_PATTERN.test(cleaned)) {
		return [cleaned];
	}

	const words = cleaned
		.split(/\s+/)
		.map((word) => word.replace(/[^a-z0-9]/g, ""))
		.filter(Boolean);

	return [words.join(""), words[0]]
		.filter((word): word is string => !!word)
		.map((word) => `${word}.com`);
};

const toFaviconUrls = ({ url, title }: { url?: string; title: string }) => {
	const trimmedUrl = url?.trim();
	const domains = trimmedUrl
		? [readUrlDomain(trimmedUrl)]
		: guessTitleDomains(title);

	return domains
		.filter((domain): domain is string => !!domain)
		.filter((domain, index, all) => all.indexOf(domain) === index)
		.map(toFaviconUrl);
};

export { toFaviconUrls };
