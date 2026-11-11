import { Link } from "@tanstack/react-router";
import {
	countPasswordsByCategory,
	type decryptVault,
} from "business-logic-secure";
import { Settings2 } from "lucide-react";

import {
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
} from "@/components/ui";

import { SidebarNavItem } from "../SidebarNavItem";

const CategoryNavGroup: React.FC<{
	vault: Awaited<ReturnType<typeof decryptVault>>;
	activeCategoryId: string | null;
}> = ({ vault, activeCategoryId }) => {
	const counts = countPasswordsByCategory(vault.passwords);

	return (
		<SidebarGroup>
			<SidebarGroupLabel className="text-subtle">
				Categories
			</SidebarGroupLabel>
			<SidebarGroupAction asChild title="Manage categories">
				<Link to="/vault/categories" aria-label="Manage categories">
					<Settings2 />
				</Link>
			</SidebarGroupAction>
			<SidebarGroupContent>
				<SidebarMenu>
					{vault.categories.map((category) => (
						<SidebarNavItem
							key={category.id}
							label={category.name}
							isActive={activeCategoryId === category.id}
							count={counts[category.id] ?? 0}
						>
							<Link
								to="/vault"
								search={{ category: category.id }}
							>
								<span className="mx-[3px] size-2 shrink-0 rounded-full ring-[1.5px] ring-subtle ring-inset" />
								<span>{category.name}</span>
							</Link>
						</SidebarNavItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
};

export { CategoryNavGroup };
