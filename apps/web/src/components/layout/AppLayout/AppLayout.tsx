import { Outlet } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";

import { ToastProvider } from "@/components/ui";

const AppLayout: React.FC = () => {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			storageKey="secure-theme"
			disableTransitionOnChange
		>
			<MotionConfig reducedMotion="user">
				<ToastProvider>
					<Outlet />
				</ToastProvider>
			</MotionConfig>
		</ThemeProvider>
	);
};

export { AppLayout };
