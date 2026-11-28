import type { decryptVault } from "business-logic-secure";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

import { RecoverEntriesModal } from "./RecoverEntriesModal";

const UndecryptableNotice: React.FC<{
	entries: Awaited<ReturnType<typeof decryptVault>>["undecryptable"];
}> = ({ entries }) => {
	const [isRecoverOpen, setIsRecoverOpen] = useState(false);

	const count = entries.length;

	return (
		<>
			<div className="mx-2 mb-2 flex items-start gap-3 rounded-xl bg-warning-soft p-3 text-warning">
				<AlertTriangle className="mt-0.5 size-4 shrink-0" />
				<div className="min-w-0 flex-1 space-y-0.5 text-[13px]">
					<p className="font-medium">
						{count === 1
							? "1 entry could not be decrypted"
							: `${count} entries could not be decrypted`}
					</p>
					<p className="opacity-85">
						They were encrypted with a different key, so they are
						hidden. They have not been deleted.
					</p>
					<button
						type="button"
						onClick={() => setIsRecoverOpen(true)}
						className="mt-1.5 font-medium underline decoration-current/40 underline-offset-2 transition-colors hover:decoration-current"
					>
						Try to recover them
					</button>
				</div>
			</div>

			<RecoverEntriesModal
				isOpen={isRecoverOpen}
				entries={entries}
				onClose={() => setIsRecoverOpen(false)}
			/>
		</>
	);
};

export { UndecryptableNotice };
