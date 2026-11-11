import { secure } from "business-logic-secure";

import { useToast } from "@/components/ui";

const useCopySecret = () => {
	const { data: user } = secure.auth.useSession();
	const { addToast } = useToast();

	const clearAfterSeconds = user?.settings.clearClipboardSeconds ?? 30;

	return async ({ value, label }: { value: string; label: string }) => {
		try {
			await navigator.clipboard.writeText(value);
		} catch {
			addToast({
				type: "error",
				title: "Copy failed",
				message: "Your browser blocked clipboard access",
			});

			return false;
		}

		addToast({
			type: "success",
			title: "Copied",
			message: `${label} copied. The clipboard clears in ${clearAfterSeconds}s.`,
		});

		window.setTimeout(() => {
			void navigator.clipboard
				.readText()
				.then((current) =>
					current === value
						? navigator.clipboard.writeText("")
						: undefined,
				)
				.catch(() => navigator.clipboard.writeText(""));
		}, clearAfterSeconds * 1_000);

		return true;
	};
};

export { useCopySecret };
