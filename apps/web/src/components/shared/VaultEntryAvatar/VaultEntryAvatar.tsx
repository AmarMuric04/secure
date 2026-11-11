import { type decryptVault, secure, toFaviconUrl } from "business-logic-secure";
import { useState } from "react";

import { cn } from "@/lib/utils";

const SIZES = {
	md: { box: "size-9 rounded-[11px] text-sm", image: "size-5" },
	lg: { box: "size-15 rounded-[17px] text-[22px]", image: "size-8" },
};

const VaultEntryAvatar: React.FC<{
	entry: Awaited<ReturnType<typeof decryptVault>>["passwords"][number];
	size?: keyof typeof SIZES;
	className?: string;
}> = ({ entry, size = "md", className }) => {
	const { data: user } = secure.auth.useSession();

	const [hasFaviconFailed, setHasFaviconFailed] = useState(false);

	const faviconUrl = user?.settings.showFavicons
		? toFaviconUrl(entry.url)
		: null;
	const letter = (entry.title.charAt(0) || "?").toUpperCase();

	return (
		<span
			className={cn(
				"grid shrink-0 place-items-center overflow-hidden bg-muted font-semibold text-muted-foreground ring-1 ring-border ring-inset",
				SIZES[size].box,
				className,
			)}
		>
			{faviconUrl && !hasFaviconFailed ? (
				<img
					src={faviconUrl}
					alt=""
					referrerPolicy="no-referrer"
					className={SIZES[size].image}
					onError={() => setHasFaviconFailed(true)}
				/>
			) : (
				letter
			)}
		</span>
	);
};

export { VaultEntryAvatar };
