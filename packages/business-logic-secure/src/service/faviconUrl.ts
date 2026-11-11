const toFaviconUrl = (url: string | undefined) => {
	if (!url) {
		return null;
	}

	try {
		const { hostname } = new URL(
			url.includes("://") ? url : `https://${url}`,
		);

		return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;
	} catch {
		return null;
	}
};

export { toFaviconUrl };
