import { secure } from "business-logic-secure";
import { MotionConfig } from "motion/react";

import { FeatureList } from "./FeatureList";
import { GeneratorPanel } from "./GeneratorPanel";
import { HeroSection } from "./HeroSection";
import { HowItWorks } from "./HowItWorks";
import { LandingClosing } from "./LandingClosing";
import { LandingHeader } from "./LandingHeader";
import { LimitsSection } from "./LimitsSection";

const LandingPage: React.FC = () => {
	const { data: user, isPending } = secure.auth.useSession();

	const isAuthenticated = !!user;

	return (
		<MotionConfig reducedMotion="user">
			<div className="min-h-screen overflow-x-clip bg-background">
				<LandingHeader
					isLoading={isPending}
					isAuthenticated={isAuthenticated}
				/>

				<main>
					<HeroSection isAuthenticated={isAuthenticated} />

					<HowItWorks />

					<FeatureList />

					<GeneratorPanel />

					<LimitsSection />
				</main>

				<LandingClosing isAuthenticated={isAuthenticated} />
			</div>
		</MotionConfig>
	);
};

export { LandingPage };
