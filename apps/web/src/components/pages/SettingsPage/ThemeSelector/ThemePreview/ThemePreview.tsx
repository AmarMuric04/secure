const PALETTES = {
	light: {
		background: "#f3f2ee",
		card: "#ffffff",
		line: "#e3e1da",
		strong: "#c9c6bd",
		primary: "#1f5c4f",
	},
	dark: {
		background: "#0f100f",
		card: "#181917",
		line: "#2a2b28",
		strong: "#4a4945",
		primary: "#76c2ac",
	},
};

const MiniApp: React.FC<{ palette: (typeof PALETTES)["light"] }> = ({
	palette,
}) => {
	return (
		<div
			className="flex size-full gap-1.5 p-1.5"
			style={{ backgroundColor: palette.background }}
		>
			<div className="flex w-[26%] flex-col gap-1 pt-1">
				<span
					className="size-2.5 rounded-[3px]"
					style={{ backgroundColor: palette.primary }}
				/>
				<span
					className="mt-1 h-1 w-4/5 rounded-full"
					style={{ backgroundColor: palette.strong }}
				/>
				<span
					className="h-1 w-3/5 rounded-full"
					style={{ backgroundColor: palette.line }}
				/>
				<span
					className="h-1 w-2/3 rounded-full"
					style={{ backgroundColor: palette.line }}
				/>
			</div>
			<div
				className="flex flex-1 flex-col gap-1.5 rounded-md p-2"
				style={{ backgroundColor: palette.card }}
			>
				<span
					className="h-1.5 w-1/2 rounded-full"
					style={{ backgroundColor: palette.strong }}
				/>
				<span
					className="h-1 w-4/5 rounded-full"
					style={{ backgroundColor: palette.line }}
				/>
				<span
					className="h-1 w-3/5 rounded-full"
					style={{ backgroundColor: palette.line }}
				/>
				<span
					className="mt-auto h-2.5 w-8 self-end rounded-[3px]"
					style={{ backgroundColor: palette.primary }}
				/>
			</div>
		</div>
	);
};

const ThemePreview: React.FC<{ theme: "light" | "dark" | "system" }> = ({
	theme,
}) => {
	if (theme !== "system") {
		return <MiniApp palette={PALETTES[theme]} />;
	}

	return (
		<div className="relative size-full">
			<MiniApp palette={PALETTES.light} />
			<div className="absolute inset-0 [clip-path:polygon(62%_0,100%_0,100%_100%,38%_100%)]">
				<MiniApp palette={PALETTES.dark} />
			</div>
		</div>
	);
};

export { ThemePreview };
