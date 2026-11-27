import type { decryptVault } from "business-logic-secure";

import { SiteIcon } from "@/components/shared/SiteIcon";
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
	return (
		<span
			className={cn(
				"grid shrink-0 place-items-center overflow-hidden bg-muted font-semibold text-muted-foreground ring-1 ring-border ring-inset",
				SIZES[size].box,
				className,
			)}
		>
			<SiteIcon
				key={entry.id}
				title={entry.title}
				url={entry.url}
				imageClassName={SIZES[size].image}
			/>
		</span>
	);
};

export { VaultEntryAvatar };
