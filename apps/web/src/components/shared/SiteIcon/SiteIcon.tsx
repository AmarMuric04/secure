import { secure, toFaviconUrls } from "business-logic-secure";
import { useState } from "react";

import { cn } from "@/lib/utils";

const PLACEHOLDER_ICON_WIDTH = 16;

const SiteIcon: React.FC<{
	title: string;
	url?: string;
	imageClassName: string;
}> = ({ title, url, imageClassName }) => {
	const { data: user } = secure.auth.useSession();

	const [failedUrls, setFailedUrls] = useState<string[]>([]);
	const [loadedUrl, setLoadedUrl] = useState<string | null>(null);

	const candidates = user?.settings.showFavicons
		? toFaviconUrls({ url, title })
		: [];
	const currentUrl = candidates.find(
		(candidate) => !failedUrls.includes(candidate),
	);
	const isLoaded = !!currentUrl && loadedUrl === currentUrl;
	const letter = (title.trim().charAt(0) || "?").toUpperCase();

	const handleFailure = (failedUrl: string) => {
		setFailedUrls((current) => [...current, failedUrl]);
	};

	const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
		if (!currentUrl) {
			return;
		}

		if (event.currentTarget.naturalWidth <= PLACEHOLDER_ICON_WIDTH) {
			handleFailure(currentUrl);

			return;
		}

		setLoadedUrl(currentUrl);
	};

	return (
		<>
			{currentUrl && (
				<img
					key={currentUrl}
					src={currentUrl}
					alt=""
					referrerPolicy="no-referrer"
					className={cn(imageClassName, !isLoaded && "hidden")}
					onLoad={handleLoad}
					onError={() => handleFailure(currentUrl)}
				/>
			)}
			{!isLoaded && (
				<span
					key={letter}
					className="motion-safe:animate-[dial-dot-in_0.3s_var(--ease-pop)]"
				>
					{letter}
				</span>
			)}
		</>
	);
};

export { SiteIcon };
