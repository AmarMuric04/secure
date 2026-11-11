import { type decryptVault, secure } from "business-logic-secure";
import { ScanSearch } from "lucide-react";

import { Button, useToast } from "@/components/ui";

const BreachCheckButton: React.FC<{
	passwords: Awaited<ReturnType<typeof decryptVault>>["passwords"];
}> = ({ passwords }) => {
	const checkBreaches = secure.vault.useCheckBreaches();
	const { addToast } = useToast();

	const handleCheck = () => {
		checkBreaches.mutate(passwords, {
			onSuccess: ({ checkedCount, breachedCount, siteBreachedCount }) =>
				addToast({
					type:
						breachedCount + siteBreachedCount > 0
							? "warning"
							: "success",
					title:
						breachedCount > 0
							? `${breachedCount} of ${checkedCount} passwords found in breaches`
							: `None of your ${checkedCount} passwords were found in breaches`,
					message:
						siteBreachedCount > 0
							? `${siteBreachedCount} ${siteBreachedCount === 1 ? "site was" : "sites were"} breached after you last changed the password.`
							: "No saved site has had a breach since your last change.",
				}),
			onError: (error) =>
				addToast({
					type: "error",
					title: "Breach check failed",
					message: error.message,
				}),
		});
	};

	return (
		<Button
			variant="outline"
			size="sm"
			isLoading={checkBreaches.isPending}
			onClick={handleCheck}
		>
			{!checkBreaches.isPending && <ScanSearch />}
			Check for breaches
		</Button>
	);
};

export { BreachCheckButton };
