import { motion } from "motion/react";

import { cn } from "@/lib/utils";

import { EASE_OUT } from "../../landingMotion";

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

const ExcerptRow: React.FC<{
	title: string;
	username: string;
	host: string;
	strength: number;
	flag?: string;
	note?: string;
	index: number;
}> = ({ title, username, host, strength, flag, note, index }) => {
	return (
		<motion.li
			initial={{ opacity: 0, y: 8 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-60px" }}
			transition={{ duration: 0.5, ease: EASE_OUT, delay: index * 0.06 }}
			className="grid items-center gap-x-10 gap-y-2 border-b border-border py-4 lg:grid-cols-[minmax(0,1fr)_16rem]"
		>
			<div className="flex items-center gap-3.5">
				<span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-muted text-sm font-semibold text-muted-foreground ring-1 ring-border ring-inset">
					{title.charAt(0)}
				</span>

				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium">{title}</p>
					<p className="truncate text-[13px] text-subtle">
						{username} · {host}
					</p>
				</div>

				{flag && (
					<span className="hidden text-xs text-warning sm:inline">
						{flag}
					</span>
				)}

				<span className="flex gap-[3px]" aria-hidden="true">
					{STRENGTH_LEVELS.map((level) => (
						<span
							key={level}
							className={cn(
								"h-3 w-1 rounded-full",
								level <= strength
									? toStrengthColor(strength)
									: "bg-accent",
							)}
						/>
					))}
				</span>
			</div>

			{note && (
				<div className="relative pl-12.5 text-[13px] text-pretty text-muted-foreground lg:pl-12">
					<motion.span
						initial={{ scaleX: 0 }}
						whileInView={{ scaleX: 1 }}
						viewport={{ once: true, margin: "-60px" }}
						transition={{
							duration: 0.6,
							ease: EASE_OUT,
							delay: 0.2 + index * 0.06,
						}}
						className="absolute top-2.5 left-0 hidden h-px w-8 origin-left bg-primary lg:block"
					/>
					{note}
				</div>
			)}
		</motion.li>
	);
};

export { ExcerptRow };
