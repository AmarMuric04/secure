import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { VaultSearchInput } from "@/components/shared/VaultSearchInput";
import { Button } from "@/components/ui";

const CategoriesHeader: React.FC<{
	summary: { categoryCount: number; filedCount: number } | null;
	searchQuery: string;
	onSearchChange: (query: string) => void;
	onCreate: () => void;
}> = ({ summary, searchQuery, onSearchChange, onCreate }) => {
	const description = summary
		? `${summary.filedCount} password${summary.filedCount === 1 ? "" : "s"} filed in ${summary.categoryCount} ${summary.categoryCount === 1 ? "category" : "categories"}`
		: "Group your logins so they are easy to find";

	return (
		<PageHeader
			title="Categories"
			description={description}
			actions={
				<>
					<VaultSearchInput
						value={searchQuery}
						placeholder="Search categories"
						onChange={onSearchChange}
						className="w-56"
					/>
					<Button onClick={onCreate}>
						<Plus />
						New category
					</Button>
				</>
			}
		/>
	);
};

export { CategoriesHeader };
