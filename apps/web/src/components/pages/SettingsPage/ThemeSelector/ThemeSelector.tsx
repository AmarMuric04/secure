import { secure } from "business-logic-secure";
import { motion } from "motion/react";
import { useTheme } from "next-themes";

import { useToast } from "@/components/ui";
import { cn } from "@/lib/utils";

import { ThemePreview } from "./ThemePreview";

const THEMES = [
	{ value: "light", label: "Light" },
	{ value: "dark", label: "Dark" },
	{ value: "system", label: "System" },
] as const;

const ThemeSelector: React.FC = () => {
	const { theme, setTheme } = useTheme();
	const updateProfile = secure.user.useUpdateProfile();
	const { addToast } = useToast();

	const handleThemeSelect = (value: (typeof THEMES)[number]["value"]) => {
		setTheme(value);
		updateProfile.mutate(
			{ settings: { theme: value } },
			{
				onError: (error) =>
					addToast({
						type: "error",
						title: "Theme not saved",
						message: error.message,
					}),
			},
		);
	};

	return (
		<section>
			<h2 className="text-[15px] font-semibold tracking-tight text-foreground">
				Appearance
			</h2>
			<p className="mt-0.5 text-sm text-muted-foreground">
				Pick a theme, or follow your system
			</p>

			<div
				role="radiogroup"
				aria-label="Theme"
				className="mt-4 grid grid-cols-3 gap-3 sm:gap-4"
			>
				{THEMES.map(({ value, label }) => {
					const isSelected = theme === value;

					return (
						<button
							key={value}
							type="button"
							role="radio"
							aria-checked={isSelected}
							onClick={() => handleThemeSelect(value)}
							className="group flex flex-col gap-2.5 rounded-xl text-left outline-none"
						>
							<span className="relative block aspect-[4/3] w-full">
								{isSelected && (
									<motion.span
										layoutId="theme-selection-ring"
										transition={{
											type: "spring",
											stiffness: 500,
											damping: 38,
										}}
										className="absolute -inset-1 rounded-[14px] ring-2 ring-primary"
									/>
								)}
								<span className="absolute inset-0 overflow-hidden rounded-[10px] ring-1 ring-border transition-transform duration-300 ease-out-quint group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5 motion-reduce:transition-none">
									<ThemePreview theme={value} />
								</span>
							</span>
							<span
								className={cn(
									"px-0.5 text-sm transition-colors",
									isSelected
										? "font-medium text-foreground"
										: "text-muted-foreground group-hover:text-foreground",
								)}
							>
								{label}
							</span>
						</button>
					);
				})}
			</div>
		</section>
	);
};

export { ThemeSelector };
