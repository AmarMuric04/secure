import { useEffect, useRef } from "react";

import { Button } from "@/components/ui";

const SHORTCUT_LABEL = navigator.userAgent.includes("Mac") ? "⌘S" : "Ctrl S";

const ComposerToolbar: React.FC<{
	leading: React.ReactNode;
	submitLabel: string;
	isSaving: boolean;
	onCancel: () => void;
}> = ({ leading, submitLabel, isSaving, onCancel }) => {
	const submitRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!(event.metaKey || event.ctrlKey) || event.key !== "s") {
				return;
			}

			event.preventDefault();
			submitRef.current?.form?.requestSubmit();
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<div className="mb-8 flex min-h-9 items-center justify-between gap-3">
			<div className="min-w-0">{leading}</div>
			<div className="flex shrink-0 items-center gap-1.5">
				<Button type="button" variant="ghost" onClick={onCancel}>
					Cancel
				</Button>
				<Button
					ref={submitRef}
					type="submit"
					isLoading={isSaving}
					className="pr-2.5"
				>
					{submitLabel}
					<kbd className="hidden h-5 items-center rounded bg-primary-foreground/15 px-1.5 font-sans text-[11px] font-medium sm:inline-flex">
						{SHORTCUT_LABEL}
					</kbd>
				</Button>
			</div>
		</div>
	);
};

export { ComposerToolbar };
