import { motion } from "motion/react";

import { Chapter } from "../Chapter";
import { revealProps } from "../landingMotion";
import { ExcerptRow } from "./ExcerptRow";
import { LockCountdown } from "./LockCountdown";

const EXCERPT_ENTRIES = [
	{
		title: "GitHub",
		username: "octo-dev",
		host: "github.com",
		strength: 4,
		note: "Generated in the form: random characters or a passphrase from the EFF word list.",
	},
	{
		title: "Figma",
		username: "studio",
		host: "figma.com",
		strength: 3,
	},
	{
		title: "Northbank",
		username: "j.doe",
		host: "northbank.example",
		strength: 1,
		flag: "Weak · reused",
		note: "Weak and reused passwords are flagged, so you know what to change first.",
	},
	{
		title: "Home router",
		username: "admin",
		host: "192.168.0.1",
		strength: 3,
		note: "Title, username, URL, notes and custom fields are encrypted too, not only the password.",
	},
	{
		title: "Netflix",
		username: "family",
		host: "netflix.com",
		strength: 2,
	},
];

const VaultChapter: React.FC = () => {
	return (
		<Chapter
			id="vault"
			number="02"
			label="Inside the vault"
			title="A plain list of your logins, with the busywork handled."
		>
			<ul className="border-t border-border">
				{EXCERPT_ENTRIES.map((entry, index) => (
					<ExcerptRow key={entry.title} index={index} {...entry} />
				))}
			</ul>

			<motion.div
				{...revealProps({ delay: 0.2 })}
				className="grid gap-x-10 gap-y-2 pt-6 lg:grid-cols-[minmax(0,1fr)_16rem]"
			>
				<LockCountdown />
				<p className="text-[13px] text-muted-foreground">
					Locks itself after 15 idle minutes and forgets the decrypted
					data. Pick your own timer in Settings.
				</p>
			</motion.div>
		</Chapter>
	);
};

export { VaultChapter };
