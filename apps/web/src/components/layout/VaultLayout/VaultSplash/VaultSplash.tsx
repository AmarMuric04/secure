import { VaultMark } from "@/components/shared/VaultMark";

const VaultSplash: React.FC<{ message: string }> = ({ message }) => {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="flex animate-in flex-col items-center gap-4 duration-500 fade-in">
				<VaultMark size="lg" className="animate-pulse" />
				<p className="text-sm text-muted-foreground">{message}</p>
			</div>
		</div>
	);
};

export { VaultSplash };
