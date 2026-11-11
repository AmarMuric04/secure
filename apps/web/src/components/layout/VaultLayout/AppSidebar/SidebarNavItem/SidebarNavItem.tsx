import { motion } from "motion/react";

import { AnimatedCount } from "@/components/shared/AnimatedCount";
import {
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SidebarNavItem: React.FC<{
	label: string;
	isActive: boolean;
	count?: number;
	isWarning?: boolean;
	children: React.ReactNode;
}> = ({ label, isActive, count, isWarning = false, children }) => {
	return (
		<SidebarMenuItem>
			{isActive && (
				<motion.span
					layoutId="sidebar-active-item"
					transition={{ duration: 0.3, ease: EASE_OUT }}
					className="absolute inset-0 rounded-lg bg-sidebar-accent group-data-[collapsible=icon]:size-8"
				/>
			)}
			<SidebarMenuButton
				asChild
				isActive={isActive}
				tooltip={label}
				className="relative h-9 rounded-lg px-2.5 text-muted-foreground transition-[background-color,color,width,height,padding] duration-200 hover:bg-sidebar-accent/60 hover:text-foreground data-[active=true]:bg-transparent data-[active=true]:font-medium data-[active=true]:text-foreground"
			>
				{children}
			</SidebarMenuButton>
			{count !== undefined && (
				<SidebarMenuBadge
					className={cn(
						"top-2 font-normal",
						isWarning && count > 0 ? "text-warning" : "text-subtle",
					)}
				>
					<AnimatedCount value={count} />
				</SidebarMenuBadge>
			)}
		</SidebarMenuItem>
	);
};

export { SidebarNavItem };
