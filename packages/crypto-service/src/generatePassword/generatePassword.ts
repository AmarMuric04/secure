import { randomIndex } from "../randomIndex";

const CHARACTER_SETS = {
	uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	lowercase: "abcdefghijklmnopqrstuvwxyz",
	numbers: "0123456789",
	symbols: "!@#$%^&*()_+-=[]{}|;:'\",.<>?/",
};
const AMBIGUOUS_CHARACTERS = "O0Il1";

const pickCharacter = (pool: string) => pool[randomIndex(pool.length)] ?? "";

const shuffle = (characters: string[]) => {
	const shuffled = [...characters];

	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const swapIndex = randomIndex(index + 1);
		[shuffled[index], shuffled[swapIndex]] = [
			shuffled[swapIndex] ?? "",
			shuffled[index] ?? "",
		];
	}

	return shuffled;
};

const generatePassword = ({
	length,
	uppercase,
	lowercase,
	numbers,
	symbols,
	excludeAmbiguous,
	excludeCharacters,
}: {
	length: number;
	uppercase: boolean;
	lowercase: boolean;
	numbers: boolean;
	symbols: boolean;
	excludeAmbiguous: boolean;
	excludeCharacters: string;
}) => {
	const excluded = new Set(
		excludeAmbiguous
			? [...excludeCharacters, ...AMBIGUOUS_CHARACTERS]
			: [...excludeCharacters],
	);
	const pools = Object.entries({ uppercase, lowercase, numbers, symbols })
		.filter(([, isEnabled]) => isEnabled)
		.map(([setName]) =>
			[...CHARACTER_SETS[setName as keyof typeof CHARACTER_SETS]]
				.filter((character) => !excluded.has(character))
				.join(""),
		)
		.filter((pool) => pool.length > 0);

	if (pools.length === 0 || length < 1) {
		throw new Error("No characters available for password generation");
	}

	const combinedPool = pools.join("");
	const requiredCharacters = pools.slice(0, length).map(pickCharacter);
	const remainingCharacters = Array.from(
		{ length: length - requiredCharacters.length },
		() => pickCharacter(combinedPool),
	);

	return shuffle([...requiredCharacters, ...remainingCharacters]).join("");
};

export { generatePassword };
