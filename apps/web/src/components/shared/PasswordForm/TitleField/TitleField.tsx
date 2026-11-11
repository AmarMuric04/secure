import { EntryMonogram } from "../EntryMonogram";
import { FavoriteStar } from "../FavoriteStar";

const TitleField: React.FC<{
	title: string;
	url: string;
	favorite: boolean;
	autoFocus: boolean;
	onTitleChange: (title: string) => void;
	onFavoriteChange: (favorite: boolean) => void;
}> = ({ title, url, favorite, autoFocus, onTitleChange, onFavoriteChange }) => {
	return (
		<div className="flex items-center gap-4">
			<EntryMonogram title={title} url={url} size="lg" />
			<input
				aria-label="Title"
				placeholder="Untitled login"
				required
				autoFocus={autoFocus}
				autoComplete="off"
				value={title}
				onChange={(event) => onTitleChange(event.target.value)}
				className="h-14 min-w-0 flex-1 bg-transparent text-[28px] font-semibold tracking-tight outline-none placeholder:text-input sm:text-[32px]"
			/>
			<FavoriteStar favorite={favorite} onChange={onFavoriteChange} />
		</div>
	);
};

export { TitleField };
