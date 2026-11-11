import { randomIndex } from "../randomIndex";
import { EFF_LARGE_WORDLIST } from "./effLargeWordlist";

const generatePassphrase = ({
	wordCount,
	separator,
	capitalize,
	includeNumber,
}: {
	wordCount: number;
	separator: string;
	capitalize: boolean;
	includeNumber: boolean;
}) => {
	const words = Array.from({ length: wordCount }, () => {
		const word =
			EFF_LARGE_WORDLIST[randomIndex(EFF_LARGE_WORDLIST.length)] ?? "";

		return capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word;
	});

	return includeNumber
		? [...words, String(randomIndex(100))].join(separator)
		: words.join(separator);
};

export { generatePassphrase };
