import { siGithub } from "simple-icons";

import { SampleIcon } from "./SampleIcon";

const SAMPLE = {
	site: "GitHub",
	username: "octo-dev",
	secret: "correct-horse-battery",
	ciphertext:
		"TkY9K6y3aDhR9MQIpPgjBL2K1T8/eFYsK9/KzcQYYTxuf7nq4IDq2ig4ygii07AB9A==",
};

const EncryptionDemo: React.FC = () => {
	return (
		<figure className="w-full">
			<figcaption className="flex items-center gap-3">
				<SampleIcon icon={siGithub} />
				<span className="min-w-0 flex-1">
					<span className="block text-sm font-medium">
						{SAMPLE.site}
					</span>
					<span className="block truncate text-[13px] text-subtle">
						{SAMPLE.username}
					</span>
				</span>
			</figcaption>

			<dl className="mt-5 grid gap-4">
				<div>
					<dt className="text-xs text-subtle">
						What you see in this browser
					</dt>
					<dd className="mt-1.5 font-mono text-[15px]">
						{SAMPLE.secret}
					</dd>
				</div>
				<div>
					<dt className="text-xs text-subtle">
						What our server stores, sealed with AES-256-GCM
					</dt>
					<dd className="mt-1.5 font-mono text-[13px] leading-6 break-all text-muted-foreground">
						{SAMPLE.ciphertext}
					</dd>
				</div>
			</dl>
		</figure>
	);
};

export { EncryptionDemo };
