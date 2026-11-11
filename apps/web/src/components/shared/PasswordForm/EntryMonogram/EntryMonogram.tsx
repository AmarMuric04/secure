import { secure, toFaviconUrl } from "business-logic-secure";
import { useState } from "react";

import { cn } from "@/lib/utils";

const SIZES = {
	md: { box: "size-10 rounded-xl text-[15px]", image: "size-5" },
	lg: { box: "size-14 rounded-2xl text-[22px]", image: "size-7" },
};

const EntryMonogram: React.FC<{
	title: string;
	url: string;
	size?: keyof typeof SIZES;
}> = ({ title, url, size = "md" }) => {
	const { data: user } = secure.auth.useSession();

	const faviconUrl = user?.settings.showFavicons
		? toFaviconUrl(url.trim() || undefined)
		: null;
	const [failedUrl, setFailedUrl] = useState<string | null>(null);

	const letter = (title.trim().charAt(0) || "?").toUpperCase();
	const isFaviconVisible = !!faviconUrl && failedUrl !== faviconUrl;

	return (
		<span
			className={cn(
				"grid shrink-0 place-items-center overflow-hidden bg-muted font-semibold text-muted-foreground ring-1 ring-border ring-inset",
				SIZES[size].box,
			)}
		>
			{isFaviconVisible ? (
				<img
					key={faviconUrl}
					src={faviconUrl}
					alt=""
					referrerPolicy="no-referrer"
					className={SIZES[size].image}
					onError={() => setFailedUrl(faviconUrl)}
				/>
			) : (
				<span
					key={letter}
					className="motion-safe:animate-[dial-dot-in_0.3s_var(--ease-pop)]"
				>
					{letter}
				</span>
			)}
		</span>
	);
};

export { EntryMonogram };
