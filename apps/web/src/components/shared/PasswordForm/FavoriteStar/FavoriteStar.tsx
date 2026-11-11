import { Star } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

const FavoriteStar: React.FC<{
	favorite: boolean;
	onChange: (favorite: boolean) => void;
}> = ({ favorite, onChange }) => {
	return (
		<button
			type="button"
			aria-pressed={favorite}
			aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
			title={favorite ? "Favorite" : "Add to favorites"}
			onClick={() => onChange(!favorite)}
			className={cn(
				"grid size-9 shrink-0 place-items-center rounded-lg transition-colors hover:bg-accent",
				favorite ? "text-foreground" : "text-subtle",
			)}
		>
			<motion.span
				key={String(favorite)}
				initial={favorite ? { scale: 0.4, rotate: -40 } : false}
				animate={{ scale: 1, rotate: 0 }}
				transition={{ type: "spring", stiffness: 520, damping: 18 }}
			>
				<Star className={cn("size-4.5", favorite && "fill-current")} />
			</motion.span>
		</button>
	);
};

export { FavoriteStar };
