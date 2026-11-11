import { EASE_OUT } from "@/lib/motion";

const SCRAMBLE_GLYPHS =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@#$%&*+=?";

const revealProps = ({ delay = 0 }: { delay?: number }) => ({
	initial: { opacity: 0, y: 12 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true, margin: "-80px" },
	transition: { duration: 0.5, ease: EASE_OUT, delay },
});

const pickGlyph = () =>
	SCRAMBLE_GLYPHS.charAt(Math.floor(Math.random() * SCRAMBLE_GLYPHS.length));

export { pickGlyph, revealProps };

export { EASE_OUT } from "@/lib/motion";
