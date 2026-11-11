import { motion } from "motion/react";
import { useId } from "react";

import { cn } from "@/lib/utils";

import { CATEGORY_ICONS } from "../CategoryIcon";

const COLOR_OPTIONS = [
	{ name: "Gray", value: "#6b7280" },
	{ name: "Red", value: "#ef4444" },
	{ name: "Orange", value: "#f97316" },
	{ name: "Yellow", value: "#eab308" },
	{ name: "Green", value: "#22c55e" },
	{ name: "Teal", value: "#14b8a6" },
	{ name: "Blue", value: "#3b82f6" },
	{ name: "Indigo", value: "#6366f1" },
	{ name: "Purple", value: "#a855f7" },
	{ name: "Pink", value: "#ec4899" },
];
const SPRING = { type: "spring", stiffness: 500, damping: 36 } as const;

const CategoryFields: React.FC<{
	icon: string;
	color: string;
	onIconChange: (icon: string) => void;
	onColorChange: (color: string) => void;
}> = ({ icon, color, onIconChange, onColorChange }) => {
	const layoutScope = useId();

	return (
		<div className="space-y-4">
			<fieldset>
				<legend className="mb-2 text-xs font-medium text-muted-foreground">
					Icon
				</legend>
				<div className="grid grid-cols-8 gap-1">
					{Object.entries(CATEGORY_ICONS).map(([iconName, Icon]) => (
						<button
							key={iconName}
							type="button"
							aria-label={iconName}
							aria-pressed={icon === iconName}
							onClick={() => onIconChange(iconName)}
							className={cn(
								"relative grid aspect-square place-items-center rounded-lg transition-colors duration-150",
								icon === iconName
									? "text-foreground"
									: "text-subtle hover:bg-accent hover:text-foreground",
							)}
						>
							{icon === iconName && (
								<motion.span
									layoutId={`${layoutScope}-icon`}
									transition={SPRING}
									className="absolute inset-0 rounded-lg bg-card shadow-panel ring-1 ring-input"
								/>
							)}
							<Icon className="relative size-4" />
						</button>
					))}
				</div>
			</fieldset>

			<fieldset>
				<legend className="mb-2 text-xs font-medium text-muted-foreground">
					Color
				</legend>
				<div className="flex flex-wrap gap-1.5">
					{COLOR_OPTIONS.map((option) => (
						<button
							key={option.value}
							type="button"
							title={option.name}
							aria-label={option.name}
							aria-pressed={color === option.value}
							onClick={() => onColorChange(option.value)}
							className="relative grid size-7 place-items-center rounded-full"
						>
							{color === option.value && (
								<motion.span
									layoutId={`${layoutScope}-color`}
									transition={SPRING}
									className="absolute inset-0 rounded-full ring-2 ring-foreground/70"
								/>
							)}
							<span
								className="size-5 rounded-full transition-transform duration-200 ease-out-quint hover:scale-110"
								style={{ backgroundColor: option.value }}
							/>
						</button>
					))}
				</div>
			</fieldset>
		</div>
	);
};

export { CategoryFields };
