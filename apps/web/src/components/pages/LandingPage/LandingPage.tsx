import { secure } from "business-logic-secure";
import { useState } from "react";

import { GeneratorBand } from "./GeneratorBand";
import { HeroSection } from "./HeroSection";
import { KeyBand } from "./KeyBand";
import { LandingClosing } from "./LandingClosing";
import { LandingHeader } from "./LandingHeader";
import { LimitsChapter } from "./LimitsChapter";
import { SealedChapter } from "./SealedChapter";
import { VaultChapter } from "./VaultChapter";

const LandingPage: React.FC = () => {
	const { data: user, isPending } = secure.auth.useSession();

	const [phrase, setPhrase] = useState("");
	const [isPhraseEdited, setIsPhraseEdited] = useState(false);

	const isAuthenticated = !!user;

	const handlePhraseEdit = (value: string) => {
		setIsPhraseEdited(true);
		setPhrase(value);
	};

	const handleSeal = () => {
		document
			.getElementById("sealed")
			?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	return (
		<div className="min-h-screen overflow-x-clip bg-background">
			<LandingHeader
				isLoading={isPending}
				isAuthenticated={isAuthenticated}
			/>

			<main>
				<HeroSection
					phrase={phrase}
					isAuthenticated={isAuthenticated}
					isPhraseEdited={isPhraseEdited}
					onAutoType={setPhrase}
					onPhraseEdit={handlePhraseEdit}
					onSeal={handleSeal}
				/>

				<SealedChapter
					phrase={phrase}
					isEdited={isPhraseEdited}
					onEdit={handlePhraseEdit}
				/>

				<KeyBand />

				<VaultChapter />

				<GeneratorBand />

				<LimitsChapter />
			</main>

			<LandingClosing isAuthenticated={isAuthenticated} />
		</div>
	);
};

export { LandingPage };
