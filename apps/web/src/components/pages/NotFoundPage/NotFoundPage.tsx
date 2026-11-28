import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { StandalonePage } from "@/components/shared/StandalonePage";

const NotFoundPage: React.FC = () => {
	return (
		<StandalonePage title="Wrong combination.">
			<p className="text-lg leading-relaxed text-pretty text-muted-foreground">
				No page opens at this address. It may have moved, or it never
				existed.{" "}
				<Link
					to="/vault"
					className="group inline-flex items-center gap-1.5 font-medium whitespace-nowrap text-foreground underline decoration-foreground/30 underline-offset-[0.2em] transition-colors hover:decoration-foreground"
				>
					Back to your vault
					<ArrowRight className="size-4 transition-transform duration-300 ease-out-quint group-hover:translate-x-0.5" />
				</Link>
			</p>
		</StandalonePage>
	);
};

export { NotFoundPage };
