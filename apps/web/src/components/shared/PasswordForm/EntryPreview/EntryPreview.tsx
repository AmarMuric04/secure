import {
	calculatePasswordStrength,
	secure,
	toWebsiteLink,
	type toPasswordFormValues,
} from "business-logic-secure";
import { Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { VaultStrengthBars } from "@/components/shared/VaultStrengthBars";
import { EASE_OUT } from "@/lib/motion";

import { EntryMonogram } from "../EntryMonogram";

const MAX_MASK_DOTS = 14;
const EntryPreview: React.FC<{
	values: ReturnType<typeof toPasswordFormValues>;
}> = ({ values }) => {
	const { data: vault } = secure.vault.useVault({ includeDeleted: false });

	const category = vault?.categories.find(
		(candidate) => candidate.id === values.categoryId,
	);
	const website = toWebsiteLink(values.url.trim() || undefined);
	const strength = calculatePasswordStrength(values.password);
	const maskLength = Math.min(values.password.length, MAX_MASK_DOTS);

	return (
		<div>
			<p className="mb-2 pl-1 text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">
				Preview
			</p>
			<div className="rounded-2xl bg-card p-4 shadow-panel ring-1 ring-border">
				<div className="flex items-center gap-3">
					<EntryMonogram title={values.title} url={values.url} />
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium">
							{values.title.trim() || "Untitled login"}
						</p>
						<p className="truncate text-[13px] text-subtle">
							{values.username.trim() ||
								website?.hostname ||
								"No username"}
						</p>
					</div>
					<AnimatePresence>
						{values.favorite && (
							<motion.span
								initial={{ scale: 0, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0, opacity: 0 }}
								transition={{
									type: "spring",
									stiffness: 500,
									damping: 22,
								}}
							>
								<Star className="size-4 fill-current" />
							</motion.span>
						)}
					</AnimatePresence>
				</div>

				<div className="mt-4 flex h-9 items-center justify-between gap-3 rounded-lg bg-muted px-3">
					<span className="flex items-center gap-1">
						{Array.from({ length: maskLength }, (_, index) => (
							<motion.i
								key={index}
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ duration: 0.2, ease: EASE_OUT }}
								className="size-1.5 rounded-full bg-foreground"
							/>
						))}
						{maskLength === 0 && (
							<span className="text-[13px] text-subtle">
								No password yet
							</span>
						)}
					</span>
					{values.password && (
						<VaultStrengthBars
							strength={strength.score}
							isStacked
						/>
					)}
				</div>

				{(category || values.tags.length > 0 || website) && (
					<div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
						{category && (
							<span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-muted px-2.5 text-muted-foreground ring-1 ring-border">
								<span
									className="size-1.5 rounded-full"
									style={{ backgroundColor: category.color }}
								/>
								{category.name}
							</span>
						)}
						{values.tags.map((tag) => (
							<span
								key={tag}
								className="inline-flex h-6 items-center rounded-full bg-accent px-2.5 text-muted-foreground"
							>
								{tag}
							</span>
						))}
						{website && (
							<span className="ml-auto truncate text-subtle">
								{website.hostname}
							</span>
						)}
					</div>
				)}
			</div>
			<p className="mt-3 pl-1 text-xs text-subtle">
				Encrypted on this device before it is saved.
			</p>
		</div>
	);
};

export { EntryPreview };
