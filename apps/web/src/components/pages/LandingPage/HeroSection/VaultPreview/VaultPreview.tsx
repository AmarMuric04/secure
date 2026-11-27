import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
	{ label: "All items", count: "5", isActive: true },
	{ label: "Favorites", count: "2", isActive: false },
	{ label: "Needs attention", count: "1", isActive: false },
	{ label: "Analytics", count: "", isActive: false },
	{ label: "Trash", count: "", isActive: false },
];
const SAMPLE_ENTRIES = [
	{ title: "GitHub", detail: "octo-dev", strength: 4 },
	{ title: "Figma", detail: "studio@example.com", strength: 3 },
	{
		title: "Northbank",
		detail: "j.doe",
		strength: 1,
		flag: "Weak and reused",
	},
	{ title: "Home router", detail: "admin", strength: 3 },
	{ title: "Netflix", detail: "family@example.com", strength: 2 },
];
const STRENGTH_LEVELS = [0, 1, 2, 3, 4];

const toStrengthColor = (strength: number) => {
	if (strength <= 1) {
		return "bg-destructive";
	}

	if (strength === 2) {
		return "bg-warning";
	}

	return "bg-muted-foreground";
};

const StrengthBars: React.FC<{ strength: number }> = ({ strength }) => {
	return (
		<span className="flex gap-[3px]" aria-hidden="true">
			{STRENGTH_LEVELS.map((level) => (
				<span
					key={level}
					className={cn(
						"h-1 w-4 rounded-full",
						level <= strength
							? toStrengthColor(strength)
							: "bg-input",
					)}
				/>
			))}
		</span>
	);
};

const VaultPreview: React.FC = () => {
	return (
		<figure>
			<figcaption className="sr-only">
				A sample vault: five saved logins, one flagged as weak and
				reused.
			</figcaption>

			<div
				aria-hidden="true"
				className="grid overflow-hidden rounded-xl bg-card text-left ring-1 ring-border md:grid-cols-[13rem_minmax(0,1fr)]"
			>
				<div className="hidden border-r border-border p-4 md:block">
					<p className="px-2 pt-1 pb-4 text-[13px] font-semibold tracking-tight">
						Sealed
					</p>
					<ul className="space-y-0.5">
						{NAV_ITEMS.map((item) => (
							<li
								key={item.label}
								className={cn(
									"flex items-center justify-between rounded-md px-2 py-1.5 text-[13px]",
									item.isActive
										? "bg-accent text-foreground"
										: "text-muted-foreground",
								)}
							>
								{item.label}
								<span className="text-xs text-subtle tabular-nums">
									{item.count}
								</span>
							</li>
						))}
					</ul>
				</div>

				<div className="min-w-0">
					<div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3.5 sm:px-6">
						<p className="text-sm font-semibold tracking-tight">
							All items
						</p>
						<span className="flex h-8 w-40 items-center gap-2 rounded-md px-2.5 text-[13px] text-subtle ring-1 ring-input ring-inset sm:w-56">
							<Search className="size-3.5" />
							Search
						</span>
					</div>

					<ul>
						{SAMPLE_ENTRIES.map((entry) => (
							<li
								key={entry.title}
								className="flex items-center gap-3.5 border-b border-border px-4 py-3 last:border-b-0 sm:px-6"
							>
								<span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-muted text-[13px] font-semibold text-muted-foreground ring-1 ring-border ring-inset">
									{entry.title.charAt(0)}
								</span>

								<span className="min-w-0 flex-1">
									<span className="block truncate text-sm font-medium">
										{entry.title}
									</span>
									<span className="block truncate text-[13px] text-subtle">
										{entry.detail}
									</span>
								</span>

								{entry.flag && (
									<span className="hidden rounded-full bg-warning-soft px-2 py-0.5 text-xs text-warning sm:inline">
										{entry.flag}
									</span>
								)}

								<StrengthBars strength={entry.strength} />
							</li>
						))}
					</ul>
				</div>
			</div>
		</figure>
	);
};

export { VaultPreview };
