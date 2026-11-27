import { SiteIcon } from "@/components/shared/SiteIcon";
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
	return (
		<span
			className={cn(
				"grid shrink-0 place-items-center overflow-hidden bg-muted font-semibold text-muted-foreground ring-1 ring-border ring-inset",
				SIZES[size].box,
			)}
		>
			<SiteIcon title={title} url={url} imageClassName={SIZES[size].image} />
		</span>
	);
};

export { EntryMonogram };
