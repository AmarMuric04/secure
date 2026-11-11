import { useEffect, useRef } from "react";

const CELL_SIZE = 22;
const POINTER_RADIUS = 140;
const GLYPHS =
	"ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789#$%&*+=?@";
const FALLBACK_PALETTE = { dim: [154, 151, 142], accent: [31, 92, 79] };

const readHexColor = (value: string) => {
	const hex = value.trim();

	if (!/^#[0-9a-f]{6}$/i.test(hex)) {
		return null;
	}

	return [1, 3, 5].map((start) =>
		Number.parseInt(hex.slice(start, start + 2), 16),
	);
};

const randomGlyph = () =>
	GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));

const createAmbientCipher = (canvas: HTMLCanvasElement) => {
	const context = canvas.getContext("2d");
	const surface = canvas.parentElement;

	if (!context || !surface) {
		return null;
	}

	const isReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;
	const pointer = { x: 0, y: 0, isActive: false };
	let palette = FALLBACK_PALETTE;
	let width = 0;
	let height = 0;
	let columns = 0;
	let frame = 0;
	let animationFrameId = 0;
	let cells: { energy: number; glyph: string }[] = [];

	const readPalette = () => {
		const styles = getComputedStyle(document.documentElement);

		palette = {
			dim:
				readHexColor(styles.getPropertyValue("--subtle")) ??
				FALLBACK_PALETTE.dim,
			accent:
				readHexColor(styles.getPropertyValue("--primary")) ??
				FALLBACK_PALETTE.accent,
		};
	};

	const resize = () => {
		const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
		const bounds = surface.getBoundingClientRect();

		width = bounds.width;
		height = bounds.height;
		canvas.width = width * pixelRatio;
		canvas.height = height * pixelRatio;
		context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
		columns = Math.ceil(width / CELL_SIZE) + 1;

		const rows = Math.ceil(height / CELL_SIZE) + 1;

		cells = Array.from({ length: columns * rows }, () => ({
			energy: 0,
			glyph: randomGlyph(),
		}));
	};

	const measureEnergy = ({ x, y }: { x: number; y: number }) => {
		const phase = (x * 0.011 + y * 0.007 - frame * 0.018) % (Math.PI * 2);
		const wave = Math.max(0, Math.sin(phase)) ** 14 * 0.75;

		if (!pointer.isActive) {
			return wave;
		}

		const distance = Math.hypot(x - pointer.x, y - pointer.y);
		const glow =
			distance < POINTER_RADIUS
				? (1 - distance / POINTER_RADIUS) ** 1.4
				: 0;

		return Math.max(wave, glow);
	};

	const draw = () => {
		frame += 1;

		if (frame % 30 === 1) {
			readPalette();
		}

		context.clearRect(0, 0, width, height);
		context.font =
			'500 13px "Geist Mono Variable", ui-monospace, monospace';
		context.textAlign = "center";
		context.textBaseline = "middle";

		const dimColor = `rgb(${palette.dim.join(" ")} / 0.28)`;

		cells.forEach((cell, index) => {
			const x = (index % columns) * CELL_SIZE + CELL_SIZE / 2;
			const y = Math.floor(index / columns) * CELL_SIZE + CELL_SIZE / 2;

			cell.energy = Math.max(measureEnergy({ x, y }), cell.energy * 0.9);

			if (cell.energy < 0.06) {
				context.fillStyle = dimColor;
				context.fillRect(x - 1, y - 1, 2, 2);

				return;
			}

			if (Math.random() < cell.energy * 0.25) {
				cell.glyph = randomGlyph();
			}

			const color = palette.dim.map((channel, channelIndex) =>
				Math.round(
					channel +
						((palette.accent[channelIndex] ?? channel) - channel) *
							Math.min(1, cell.energy * 1.4),
				),
			);

			context.fillStyle = `rgb(${color.join(" ")} / ${(0.25 + 0.75 * cell.energy).toFixed(3)})`;
			context.fillText(cell.glyph, x, y);
		});

		if (!isReducedMotion) {
			animationFrameId = window.requestAnimationFrame(draw);
		}
	};

	const handlePointerMove = (event: PointerEvent) => {
		const bounds = surface.getBoundingClientRect();

		pointer.x = event.clientX - bounds.left;
		pointer.y = event.clientY - bounds.top;
		pointer.isActive = event.pointerType === "mouse";
	};

	const handlePointerLeave = () => {
		pointer.isActive = false;
	};

	const resizeObserver = new ResizeObserver(() => {
		resize();

		if (isReducedMotion) {
			draw();
		}
	});

	readPalette();
	resize();
	draw();
	resizeObserver.observe(surface);
	surface.addEventListener("pointermove", handlePointerMove);
	surface.addEventListener("pointerleave", handlePointerLeave);

	return () => {
		window.cancelAnimationFrame(animationFrameId);
		resizeObserver.disconnect();
		surface.removeEventListener("pointermove", handlePointerMove);
		surface.removeEventListener("pointerleave", handlePointerLeave);
	};
};

const CipherCanvas: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!canvasRef.current) {
			return;
		}

		const destroy = createAmbientCipher(canvasRef.current);

		if (!destroy) {
			return;
		}

		return destroy;
	}, []);

	return (
		<canvas
			ref={canvasRef}
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 size-full"
		/>
	);
};

export { CipherCanvas };
