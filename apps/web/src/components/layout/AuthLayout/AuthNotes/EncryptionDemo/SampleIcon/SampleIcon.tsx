import type { SimpleIcon } from "simple-icons";

const DARK_BRAND_HEXES = ["181717", "000000"];

const SampleIcon: React.FC<{
	icon: SimpleIcon;
}> = ({ icon }) => {
	const fill = !DARK_BRAND_HEXES.includes(icon.hex)
		? `#${icon.hex}`
		: "currentColor";

	return (
		<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-foreground ring-1 ring-border ring-inset [&>svg]:size-5">
			<svg
				viewBox="0 0 24 24"
				role="img"
				aria-label={icon.title}
				fill={fill}
			>
				<path d={icon.path} />
			</svg>
		</span>
	);
};

export { SampleIcon };
