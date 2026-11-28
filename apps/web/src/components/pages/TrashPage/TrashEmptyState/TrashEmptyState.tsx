import { Link } from "@tanstack/react-router";

import { Button, EmptyState } from "@/components/ui";

const TrashEmptyState: React.FC = () => {
	return (
		<EmptyState
			title="Nothing in the trash"
			description="When you delete a password it waits here first, so you can bring it back if you change your mind."
			action={
				<Button asChild variant="outline" size="sm">
					<Link to="/vault">Back to vault</Link>
				</Button>
			}
		/>
	);
};

export { TrashEmptyState };
