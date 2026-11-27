import { EASE_OUT } from "@/lib/motion";

const revealProps = ({ delay = 0 }: { delay?: number }) => ({
	initial: { opacity: 0, y: 10 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true, margin: "-60px" },
	transition: { duration: 0.6, ease: EASE_OUT, delay },
});

export { revealProps };
