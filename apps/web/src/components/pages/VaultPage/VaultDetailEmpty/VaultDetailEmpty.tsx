import { Lock } from "lucide-react";

import { Spinner } from "@/components/ui";

const VaultDetailEmpty: React.FC<{ isPending: boolean }> = ({ isPending }) => {
	if (isPending) {
		return (
			<div className="grid flex-1 place-items-center">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="grid flex-1 place-items-center p-6 text-center text-subtle">
			<div>
				<Lock className="mx-auto mb-3 size-5" />
				Select an item to see its details
			</div>
		</div>
	);
};

export { VaultDetailEmpty };
