import { useSyncExternalStore } from "react";

let vaultKey: CryptoKey | null = null;
let generation = 0;
let pendingUnlock: (() => Promise<CryptoKey>) | null = null;

const listeners = new Set<() => void>();

const notify = () => {
	for (const listener of listeners) {
		listener();
	}
};

const subscribe = (listener: () => void) => {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
};

const getVaultKey = () => {
	if (!vaultKey) {
		throw new Error("The vault is locked");
	}

	return vaultKey;
};

const getVaultGeneration = () => generation;

const openVault = (key: CryptoKey) => {
	vaultKey = key;
	pendingUnlock = null;
	generation += 1;
	notify();
};

const closeVault = () => {
	vaultKey = null;
	pendingUnlock = null;
	generation += 1;
	notify();
};

const deferUnlock = (unlock: () => Promise<CryptoKey>) => {
	pendingUnlock = unlock;
};

const runDeferredUnlock = async () => {
	const unlock = pendingUnlock;

	pendingUnlock = null;

	if (unlock) {
		openVault(await unlock());
	}
};

const useIsVaultUnlocked = () =>
	useSyncExternalStore(
		subscribe,
		() => vaultKey !== null,
		() => false,
	);

const useVaultGeneration = () =>
	useSyncExternalStore(subscribe, getVaultGeneration, getVaultGeneration);

export {
	closeVault,
	deferUnlock,
	getVaultKey,
	openVault,
	runDeferredUnlock,
	useIsVaultUnlocked,
	useVaultGeneration,
};
