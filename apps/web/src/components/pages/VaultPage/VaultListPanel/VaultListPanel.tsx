import { Link, useNavigate } from "@tanstack/react-router";
import {
	filterVaultEntries,
	secure,
	sortVaultEntries,
	toDefaultVaultSort,
	toggleVaultSort,
	type VAULT_SORT_FIELDS,
} from "business-logic-secure";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AnimatedCount } from "@/components/shared/AnimatedCount";
import { VaultSearchInput } from "@/components/shared/VaultSearchInput";
import { Button } from "@/components/ui";

import { UndecryptableNotice } from "../UndecryptableNotice";
import { SortMenu } from "./SortMenu";
import { VaultListBody } from "./VaultListBody";

const TYPING_SELECTOR = "input, textarea, select, [contenteditable='true']";
const ARROW_STEPS: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 };

const VaultListPanel: React.FC<{
	vault: ReturnType<typeof secure.vault.useVault>;
	categoryId: string | null;
	isFavoritesOnly: boolean;
	selectedId: string | null;
	headerActions: React.ReactNode;
}> = ({ vault, categoryId, isFavoritesOnly, selectedId, headerActions }) => {
	const navigate = useNavigate();
	const { data: user } = secure.auth.useSession();

	const [query, setQuery] = useState("");
	const [sort, setSort] = useState(() =>
		toDefaultVaultSort(user?.settings.defaultSort ?? "name"),
	);
	const searchRef = useRef<HTMLInputElement>(null);

	const entries = sortVaultEntries({
		entries: filterVaultEntries({
			entries: vault.data?.passwords ?? [],
			query,
			categoryId,
			isWeakOnly: false,
			isFavoritesOnly,
		}),
		field: sort.field,
		order: sort.order,
	});
	const categoryName = vault.data?.categories.find(
		(category) => category.id === categoryId,
	)?.name;
	const title = isFavoritesOnly ? "Favorites" : (categoryName ?? "All items");
	const undecryptableCount = vault.data?.undecryptableCount ?? 0;
	const listKey = [categoryId, isFavoritesOnly, sort.field, sort.order].join(
		"|",
	);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const isTyping =
				event.target instanceof Element &&
				event.target.matches(TYPING_SELECTOR);

			if (event.key === "/" && !isTyping) {
				event.preventDefault();
				searchRef.current?.focus();

				return;
			}

			const step = ARROW_STEPS[event.key];

			if (!step || (isTyping && event.target !== searchRef.current)) {
				return;
			}

			const currentIndex = entries.findIndex(
				(entry) => entry.id === selectedId,
			);
			const nextEntry =
				entries[
					Math.min(
						entries.length - 1,
						Math.max(0, currentIndex + step),
					)
				];

			if (!nextEntry) {
				return;
			}

			event.preventDefault();
			void navigate({
				to: "/vault",
				search: (previous) => ({ ...previous, entry: nextEntry.id }),
			});
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [entries, selectedId]);

	const handleSortChange = (field: (typeof VAULT_SORT_FIELDS)[number]) => {
		setSort(toggleVaultSort({ current: sort, field }));
	};

	return (
		<>
			<div className="px-4 pt-4 pb-3 sm:px-4.5 sm:pt-4.5">
				<div className="mb-3.5 flex items-center gap-2.5">
					<h1 className="truncate text-xl font-semibold tracking-tight">
						{title}
					</h1>
					{!vault.isPending && (
						<AnimatedCount
							value={entries.length}
							className="text-subtle"
						/>
					)}
					<span className="ml-auto flex items-center gap-1">
						{headerActions}
					</span>
					<Button asChild size="sm" className="rounded-lg">
						<Link to="/vault/new">
							<Plus />
							New
						</Link>
					</Button>
				</div>
				<div className="flex items-center gap-1.5">
					<VaultSearchInput
						ref={searchRef}
						value={query}
						placeholder="Search vault"
						onChange={setQuery}
					/>
					<SortMenu sort={sort} onChange={handleSortChange} />
				</div>
			</div>

			{undecryptableCount > 0 && (
				<UndecryptableNotice count={undecryptableCount} />
			)}

			<VaultListBody
				vault={vault}
				listKey={listKey}
				entries={entries}
				isGrouped={sort.field === "title" && !query}
				selectedId={selectedId}
				hasQuery={!!query}
				onClearSearch={() => setQuery("")}
			/>
		</>
	);
};

export { VaultListPanel };
