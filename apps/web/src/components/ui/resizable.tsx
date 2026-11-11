import * as React from "react";
import { Group, Panel, Separator } from "react-resizable-panels";

import { cn } from "@/lib/utils";

function ResizablePanelGroup({
	className,
	...props
}: React.ComponentProps<typeof Group>) {
	return (
		<Group
			data-slot="resizable-panel-group"
			className={cn("flex h-full w-full", className)}
			{...props}
		/>
	);
}

function ResizablePanel(props: React.ComponentProps<typeof Panel>) {
	return <Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
	className,
	...props
}: React.ComponentProps<typeof Separator>) {
	return (
		<Separator
			data-slot="resizable-handle"
			className={cn(
				"group/handle relative flex w-px shrink-0 items-center justify-center bg-border outline-none",
				"after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:bg-transparent after:transition-colors after:duration-200",
				"data-[separator=active]:after:bg-primary/60 data-[separator=focus]:after:bg-primary/60 data-[separator=hover]:after:bg-input",
				className,
			)}
			{...props}
		/>
	);
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
