import { PageHeader } from "@/components/shared/PageHeader";
import { VaultSearchInput } from "@/components/shared/VaultSearchInput";

const CategoriesHeader: React.FC<{
	summary: { categoryCount: number; filedCount: number } | null;
	searchQuery: string;
	onSearchChange: (query: string) => void;
}> = ({ summary, searchQuery, onSearchChange }) => {
	const description = summary
		? `${summary.categoryCount} ${summary.categoryCount === 1 ? "category" : "categories"} · ${summary.filedCount} password${summary.filedCount === 1 ? "" : "s"} filed`
		: "Group your logins so they are easy to find";

	return (
		<PageHeader
			title="Categories"
			description={description}
			actions={
				<VaultSearchInput
					value={searchQuery}
					placeholder="Search categories"
					onChange={onSearchChange}
					className="w-56"
				/>
			}
		/>
	);
};

export { CategoriesHeader };
