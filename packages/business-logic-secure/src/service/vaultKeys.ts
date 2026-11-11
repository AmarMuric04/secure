import {
	createSalt,
	createVaultKey,
	deriveMasterKeys,
	rewrapVaultKey,
	sealLegacyVaultKey,
	unlockVaultKey,
} from "crypto-service";
import {
	changeMasterPassword,
	createVaultKeys,
	getVaultKeys,
	readErrorCause,
	upgradeVaultKey,
} from "secure-service";

const INCORRECT_PASSWORD_MESSAGE = "Incorrect master password";

const openWithMasterKeys = async (
	masterKeys: Awaited<ReturnType<typeof deriveMasterKeys>>,
) => {
	const { keyVersion, encryptedVaultKey } = await getVaultKeys();

	if (keyVersion === 2 && encryptedVaultKey) {
		return unlockVaultKey({
			wrappingKey: masterKeys.wrappingKey,
			encryptedVaultKey,
		}).catch(() => {
			throw new Error(INCORRECT_PASSWORD_MESSAGE);
		});
	}

	const sealed = await sealLegacyVaultKey({
		wrappingKey: masterKeys.wrappingKey,
		legacyKeyMaterial: masterKeys.legacyKeyMaterial,
	});

	await upgradeVaultKey({
		authHash: masterKeys.authHash,
		encryptedVaultKey: sealed.encryptedVaultKey,
	}).catch((error: unknown) => {
		throw readErrorCause(error)?.status === 401
			? new Error(INCORRECT_PASSWORD_MESSAGE)
			: error;
	});

	return sealed.vaultKey;
};

const readMasterSalt = async () => {
	const { salt } = await getVaultKeys();

	if (!salt) {
		throw new Error("Set a master password for your vault first");
	}

	return salt;
};

const openWithPassword = async (password: string) =>
	openWithMasterKeys(
		await deriveMasterKeys({ password, salt: await readMasterSalt() }),
	);

const deriveAuthHash = async (password: string) => {
	const { authHash } = await deriveMasterKeys({
		password,
		salt: await readMasterSalt(),
	});

	return authHash;
};

const createMasterPassword = async (password: string) => {
	const salt = createSalt();
	const { authHash, wrappingKey } = await deriveMasterKeys({
		password,
		salt,
	});
	const { vaultKey, encryptedVaultKey } = await createVaultKey(wrappingKey);

	await createVaultKeys({ salt, authHash, encryptedVaultKey });

	return vaultKey;
};

const replaceMasterPassword = async ({
	currentPassword,
	nextPassword,
}: {
	currentPassword: string;
	nextPassword: string;
}) => {
	const { salt, keyVersion, encryptedVaultKey } = await getVaultKeys();

	if (!salt) {
		throw new Error("Set a master password for your vault first");
	}

	if (keyVersion !== 2 || !encryptedVaultKey) {
		throw new Error(
			"Unlock your vault once before changing the master password",
		);
	}

	const nextSalt = createSalt();
	const [current, next] = await Promise.all([
		deriveMasterKeys({ password: currentPassword, salt }),
		deriveMasterKeys({ password: nextPassword, salt: nextSalt }),
	]);
	const rewrapped = await rewrapVaultKey({
		currentWrappingKey: current.wrappingKey,
		nextWrappingKey: next.wrappingKey,
		encryptedVaultKey,
	}).catch(() => {
		throw new Error(INCORRECT_PASSWORD_MESSAGE);
	});
	const { revokedSessions } = await changeMasterPassword({
		currentAuthHash: current.authHash,
		salt: nextSalt,
		authHash: next.authHash,
		encryptedVaultKey: rewrapped.encryptedVaultKey,
	}).catch((error: unknown) => {
		throw readErrorCause(error)?.status === 401
			? new Error(INCORRECT_PASSWORD_MESSAGE)
			: error;
	});

	return { vaultKey: rewrapped.vaultKey, revokedSessions };
};

export {
	createMasterPassword,
	deriveAuthHash,
	openWithMasterKeys,
	openWithPassword,
	replaceMasterPassword,
};
