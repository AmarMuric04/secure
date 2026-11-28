import { Link, type ErrorComponentProps } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";

import { StandalonePage } from "@/components/shared/StandalonePage";
import { Button } from "@/components/ui";

const ErrorPage: React.FC<ErrorComponentProps> = ({ error, reset }) => {
	const message = error instanceof Error ? error.message : null;

	return (
		<StandalonePage title="Something broke.">
			<p className="text-lg leading-relaxed text-pretty text-muted-foreground">
				This page stopped working. Your vault is untouched and still
				encrypted.
			</p>

			{message && (
				<pre className="mt-6 overflow-x-auto border-l-2 border-border py-1 pl-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-subtle">
					{message}
				</pre>
			)}

			<div className="mt-8 flex items-center gap-5">
				<Button size="lg" onClick={reset}>
					<RotateCcw />
					Try again
				</Button>
				<Link
					to="/"
					className="text-sm text-muted-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
				>
					Go home
				</Link>
			</div>
		</StandalonePage>
	);
};

export { ErrorPage };
