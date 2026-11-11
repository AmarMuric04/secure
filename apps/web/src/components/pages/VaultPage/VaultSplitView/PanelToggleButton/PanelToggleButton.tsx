import {
	Button,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui";

const PanelToggleButton: React.FC<{
	label: string;
	icon: React.ReactNode;
	onClick: () => void;
}> = ({ label, icon, onClick }) => {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label={label}
					className="rounded-lg text-subtle hover:text-foreground"
					onClick={onClick}
				>
					{icon}
				</Button>
			</TooltipTrigger>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
};

export { PanelToggleButton };
