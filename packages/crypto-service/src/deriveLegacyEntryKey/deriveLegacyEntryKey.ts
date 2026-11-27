import { deriveMasterKeys } from "../deriveMasterKeys";

const deriveLegacyEntryKey = async ({
	password,
	salt,
}: {
	password: string;
	salt: string;
}) => {
	const { legacyKeyMaterial } = await deriveMasterKeys({ password, salt });

	return crypto.subtle.importKey(
		"raw",
		legacyKeyMaterial,
		{ name: "AES-GCM", length: 256 },
		false,
		["decrypt"],
	);
};

export { deriveLegacyEntryKey };
