const UINT32_RANGE = 0x1_00_00_00_00;

const randomIndex = (exclusiveMax: number) => {
	const limit = UINT32_RANGE - (UINT32_RANGE % exclusiveMax);
	const buffer = new Uint32Array(1);
	let value = limit;

	while (value >= limit) {
		crypto.getRandomValues(buffer);
		value = buffer[0] ?? limit;
	}

	return value % exclusiveMax;
};

export { randomIndex };
