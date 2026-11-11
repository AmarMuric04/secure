import {
	PanelLeftClose,
	PanelLeftOpen,
	PanelRightClose,
	PanelRightOpen,
} from "lucide-react";
import { useDefaultLayout, usePanelRef } from "react-resizable-panels";
import { useEffect, useState } from "react";

import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui";

import { PanelToggleButton } from "./PanelToggleButton";

const LIST_PANEL_ID = "list";
const DETAIL_PANEL_ID = "detail";

const VaultSplitView: React.FC<{
	selectedId: string | null;
	renderList: (headerActions: React.ReactNode) => React.ReactNode;
	detail: React.ReactNode;
}> = ({ selectedId, renderList, detail }) => {
	const listRef = usePanelRef();
	const detailRef = usePanelRef();
	const { defaultLayout, onLayoutChanged } = useDefaultLayout({
		id: "secure-vault-split",
		panelIds: [LIST_PANEL_ID, DETAIL_PANEL_ID],
	});

	const [isListCollapsed, setIsListCollapsed] = useState(false);
	const [isDetailCollapsed, setIsDetailCollapsed] = useState(false);

	useEffect(() => {
		if (selectedId && detailRef.current?.isCollapsed()) {
			detailRef.current.expand();
		}
	}, [selectedId]);

	const handleListResize = () => {
		setIsListCollapsed(!!listRef.current?.isCollapsed());
	};

	const handleDetailResize = () => {
		setIsDetailCollapsed(!!detailRef.current?.isCollapsed());
	};

	const listHeaderActions = isDetailCollapsed ? (
		<PanelToggleButton
			label="Show details"
			icon={<PanelRightOpen />}
			onClick={() => detailRef.current?.expand()}
		/>
	) : (
		<PanelToggleButton
			label="Hide list"
			icon={<PanelLeftClose />}
			onClick={() => listRef.current?.collapse()}
		/>
	);

	return (
		<ResizablePanelGroup
			defaultLayout={defaultLayout}
			onLayoutChanged={onLayoutChanged}
			className="min-h-0 flex-1 [&>[data-panel]]:transition-[flex-grow] [&>[data-panel]]:duration-300 [&>[data-panel]]:ease-out-quint has-data-[separator=active]:[&>[data-panel]]:transition-none"
		>
			<ResizablePanel
				id={LIST_PANEL_ID}
				panelRef={listRef}
				defaultSize="34%"
				minSize="260px"
				collapsible
				onResize={handleListResize}
				className="flex h-full min-h-0 flex-col overflow-hidden"
			>
				{renderList(listHeaderActions)}
			</ResizablePanel>

			<ResizableHandle />

			<ResizablePanel
				id={DETAIL_PANEL_ID}
				panelRef={detailRef}
				minSize="360px"
				collapsible
				onResize={handleDetailResize}
				className="flex h-full min-h-0 flex-col overflow-hidden"
			>
				<div className="flex h-12 shrink-0 items-center justify-between px-3">
					<span>
						{isListCollapsed && (
							<PanelToggleButton
								label="Show list"
								icon={<PanelLeftOpen />}
								onClick={() => listRef.current?.expand()}
							/>
						)}
					</span>
					<PanelToggleButton
						label="Hide details"
						icon={<PanelRightClose />}
						onClick={() => detailRef.current?.collapse()}
					/>
				</div>
				<div className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
					{detail}
				</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
};

export { VaultSplitView };
