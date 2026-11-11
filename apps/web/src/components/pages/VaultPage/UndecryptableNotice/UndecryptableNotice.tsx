import { AlertTriangle } from "lucide-react";

const UndecryptableNotice: React.FC<{ count: number }> = ({ count }) => {
	return (
		<div className="mx-2 mb-2 flex items-start gap-3 rounded-xl bg-warning-soft p-3 text-warning">
			<AlertTriangle className="mt-0.5 size-4 shrink-0" />
			<div className="space-y-0.5 text-[13px]">
				<p className="font-semibold">
					{count === 1
						? "1 entry could not be decrypted"
						: `${count} entries could not be decrypted`}
				</p>
				<p className="opacity-85">
					They were encrypted with a different key than your current
					master password, so they are hidden. They have not been
					deleted.
				</p>
			</div>
		</div>
	);
};

export { UndecryptableNotice };
