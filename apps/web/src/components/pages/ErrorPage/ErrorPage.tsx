import { Link, type ErrorComponentProps } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";

const ErrorPage: React.FC<ErrorComponentProps> = ({ error, reset }) => {
	const message = error instanceof Error ? error.message : null;

	return (
		<main className="flex min-h-svh items-center justify-center bg-background p-6">
			<div className="w-full max-w-md">
				<h1 className="text-2xl font-semibold tracking-tight">
					Something broke
				</h1>
				<div>
					<p className="mt-2 text-muted-foreground">
						This page stopped working. Your vault is untouched and
						still encrypted.
					</p>
					{message && (
						<pre className="mt-6 overflow-x-auto border-l-2 border-border py-1 pl-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-subtle">
							{message}
						</pre>
					)}
					<div className="mt-8 flex gap-2">
						<Button onClick={reset}>
							<RotateCcw />
							Try again
						</Button>
						<Button asChild variant="ghost">
							<Link to="/">Go home</Link>
						</Button>
					</div>
				</div>
			</div>
		</main>
	);
};

export { ErrorPage };
