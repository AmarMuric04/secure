import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

const PageHeader: React.FC<{
	title: string;
	description?: string;
	back?: { to: string; label: string };
	actions?: React.ReactNode;
}> = ({ title, description, back, actions }) => {
	return (
		<header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
			<div className="min-w-0">
				{back && (
					<Link
						to={back.to}
						className="mb-3 inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						<ArrowLeft className="size-3.5" />
						{back.label}
					</Link>
				)}
				<h1 className="text-2xl font-semibold tracking-tight">
					{title}
				</h1>
				{description && (
					<p className="mt-1 text-muted-foreground">{description}</p>
				)}
			</div>
			{actions && (
				<div className="flex shrink-0 items-center gap-2">
					{actions}
				</div>
			)}
		</header>
	);
};

export { PageHeader };
