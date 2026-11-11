import { useEffect, useImperativeHandle, useRef } from "react";

const CELL_SIZE = 22;
const POINTER_RADIUS = 150;
const CHARGE_FRAMES = 90;
const GLYPHS =
	"ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789#$%&*+=?@";
const IGNORE_SELECTOR = "[data-cipher-ignore]";
const FALLBACK_PALETTE = {
	dim: [154, 151, 142],
	accent: [31, 92, 79],
	success: [46, 125, 91],
};

const readHexColor = (value: string) => {
	const hex = value.trim();

	if (!/^#[0-9a-f]{6}$/i.test(hex)) {
		return null;
	}

	return [1, 3, 5].map((start) =>
		Number.parseInt(hex.slice(start, start + 2), 16),
	);
};

const mixColor = ({
	from,
	to,
	amount,
}: {
	from: number[];
	to: number[];
	amount: number;
}) =>
	from.map((channel, index) =>
		Math.round(channel + ((to[index] ?? channel) - channel) * amount),
	);

const createCipherEngine = (canvas: HTMLCanvasElement) => {
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
	let rows = 0;
	let frame = 0;
	let animationFrameId = 0;
	let cells: { energy: number; glow: number; glyph: string }[] = [];
	let ripples: {
		x: number;
		y: number;
		time: number;
		speed: number;
		thickness: number;
		reach: number;
		isSuccess: boolean;
	}[] = [];
	let hold: { x: number; y: number; startFrame: number } | null = null;

	const randomGlyph = () =>
		GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));

	const readPalette = () => {
		const styles = getComputedStyle(document.documentElement);

		palette = {
			dim:
				readHexColor(styles.getPropertyValue("--subtle")) ??
				FALLBACK_PALETTE.dim,
			accent:
				readHexColor(styles.getPropertyValue("--primary")) ??
				FALLBACK_PALETTE.accent,
			success:
				readHexColor(styles.getPropertyValue("--success")) ??
				FALLBACK_PALETTE.success,
		};
	};

	const resize = () => {
		const pixelRatio = Math.min(2, window.devicePixelRatio || 1);

		width = window.innerWidth;
		height = window.innerHeight;
		canvas.width = width * pixelRatio;
		canvas.height = height * pixelRatio;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
		columns = Math.ceil(width / CELL_SIZE) + 1;
		rows = Math.ceil(height / CELL_SIZE) + 1;
		cells = Array.from({ length: columns * rows }, () => ({
			energy: 0,
			glow: 0,
			glyph: randomGlyph(),
		}));
	};

	const readHoldCharge = () =>
		hold ? Math.min(1, (frame - hold.startFrame) / CHARGE_FRAMES) : 0;

	const measureCell = ({ x, y }: { x: number; y: number }) => {
		let energy = 0;
		let glow = 0;
		let jitter = 0;

		if (pointer.isActive) {
			const distance = Math.hypot(x - pointer.x, y - pointer.y);

			if (distance < POINTER_RADIUS) {
				energy = (1 - distance / POINTER_RADIUS) ** 1.4;
			}
		}

		if (hold) {
			const charge = readHoldCharge();
			const radius = 28 + 132 * charge;
			const distance = Math.hypot(x - hold.x, y - hold.y);
			const ring =
				Math.max(0, 1 - Math.abs(distance - radius) / 18) *
				(0.65 + 0.35 * Math.sin(frame * 0.35));
			const core =
				distance < radius
					? (1 - distance / radius) ** 1.1 * (0.55 + 0.45 * charge)
					: 0;
			const holdEnergy = Math.max(ring, core);

			energy = Math.max(energy, holdEnergy);
			jitter = distance < radius ? charge * 2.2 : 0;
			glow = charge >= 1 ? holdEnergy : 0;
		}

		for (const ripple of ripples) {
			const radius = ripple.time * ripple.speed;

			if (radius < 0) {
				continue;
			}

			const offset = Math.abs(
				Math.hypot(x - ripple.x, y - ripple.y) - radius,
			);

			if (offset < ripple.thickness) {
				const value =
					(1 - offset / ripple.thickness) *
					(1 - Math.min(1, radius / ripple.reach) * 0.75);

				energy = Math.max(energy, value);
				glow = ripple.isSuccess ? Math.max(glow, value) : glow;
			}
		}

		return { energy, glow, jitter };
	};

	const draw = () => {
		animationFrameId = 0;
		frame += 1;

		if (frame % 30 === 1) {
			readPalette();
		}

		ripples = ripples
			.map((ripple) => ({ ...ripple, time: ripple.time + 1 }))
			.filter((ripple) => ripple.time * ripple.speed < ripple.reach + 80);

		context.clearRect(0, 0, width, height);
		context.font =
			'500 13px "Geist Mono Variable", ui-monospace, monospace';
		context.textAlign = "center";
		context.textBaseline = "middle";

		const dimColor = `rgb(${palette.dim.join(" ")} / 0.3)`;
		let peak = 0;

		cells.forEach((cell, index) => {
			const x = (index % columns) * CELL_SIZE + CELL_SIZE / 2;
			const y = Math.floor(index / columns) * CELL_SIZE + CELL_SIZE / 2;
			const target = measureCell({ x, y });

			cell.energy = Math.max(target.energy, cell.energy * 0.9);
			cell.glow = Math.max(target.glow, cell.glow * 0.93);
			peak = Math.max(peak, cell.energy);

			if (cell.energy < 0.06) {
				context.fillStyle = dimColor;
				context.fillRect(x - 1, y - 1, 2, 2);

				return;
			}

			if (Math.random() < (target.jitter ? 0.7 : cell.energy * 0.3)) {
				cell.glyph = randomGlyph();
			}

			const color = mixColor({
				from: palette.dim,
				to: cell.glow > 0.05 ? palette.success : palette.accent,
				amount: Math.min(1, cell.energy * 1.4),
			});
			const shake = () => (Math.random() - 0.5) * target.jitter * 2;

			context.fillStyle = `rgb(${color.join(" ")} / ${(0.3 + 0.7 * cell.energy).toFixed(3)})`;
			context.fillText(cell.glyph, x + shake(), y + shake());
		});

		const isActive =
			pointer.isActive || hold || ripples.length > 0 || peak > 0.01;

		if (isActive && !isReducedMotion) {
			animationFrameId = window.requestAnimationFrame(draw);
		}
	};

	const wake = () => {
		if (!animationFrameId && !isReducedMotion) {
			animationFrameId = window.requestAnimationFrame(draw);
		}
	};

	const addRipple = ({
		x,
		y,
		speed,
		thickness,
		reach = Math.hypot(width, height),
		delay = 0,
		isSuccess = false,
	}: {
		x: number;
		y: number;
		speed: number;
		thickness: number;
		reach?: number;
		delay?: number;
		isSuccess?: boolean;
	}) => {
		ripples.push({
			x,
			y,
			time: -delay,
			speed,
			thickness,
			reach,
			isSuccess,
		});
		wake();
	};

	const releaseHold = () => {
		if (!hold) {
			return;
		}

		const charge = readHoldCharge();
		const isFull = charge >= 1;
		const reach = 260 + Math.hypot(width, height) * charge;
		const { x, y } = hold;

		hold = null;
		surface.style.cursor = "";
		addRipple({
			x,
			y,
			speed: 6 + 7 * charge,
			thickness: 36 + 70 * charge,
			reach,
			isSuccess: isFull,
		});

		if (charge > 0.4) {
			addRipple({
				x,
				y,
				speed: 5 + 6 * charge,
				thickness: 24 + 36 * charge,
				reach,
				delay: 9,
				isSuccess: isFull,
			});
		}

		if (charge > 0.8) {
			addRipple({
				x,
				y,
				speed: 4 + 5 * charge,
				thickness: 18 + 24 * charge,
				reach,
				delay: 18,
				isSuccess: isFull,
			});
		}
	};

	const isOverInterface = (target: EventTarget | null) =>
		target instanceof Element && !!target.closest(IGNORE_SELECTOR);

	const handlePointerMove = (event: PointerEvent) => {
		pointer.x = event.clientX;
		pointer.y = event.clientY;
		pointer.isActive =
			event.pointerType === "mouse" && !isOverInterface(event.target);

		if (hold) {
			hold.x = event.clientX;
			hold.y = event.clientY;
		}

		if (pointer.isActive || hold) {
			wake();
		}
	};

	const handlePointerLeave = () => {
		pointer.isActive = false;
		releaseHold();
	};

	const handlePointerDown = (event: PointerEvent) => {
		if (event.button !== 0 || isOverInterface(event.target)) {
			return;
		}

		event.preventDefault();
		hold = { x: event.clientX, y: event.clientY, startFrame: frame };
		surface.style.cursor = "grabbing";
		wake();
	};

	const handleResize = () => {
		resize();

		if (!animationFrameId) {
			draw();
		}
	};

	readPalette();
	resize();
	draw();

	surface.addEventListener("pointermove", handlePointerMove);
	surface.addEventListener("pointerleave", handlePointerLeave);
	surface.addEventListener("pointerdown", handlePointerDown);
	window.addEventListener("pointerup", releaseHold);
	window.addEventListener("pointercancel", releaseHold);
	window.addEventListener("blur", releaseHold);
	window.addEventListener("resize", handleResize);

	return {
		burst: (point: { x: number; y: number }) =>
			addRipple({ ...point, speed: 11, thickness: 80, isSuccess: true }),
		destroy: () => {
			window.cancelAnimationFrame(animationFrameId);
			surface.removeEventListener("pointermove", handlePointerMove);
			surface.removeEventListener("pointerleave", handlePointerLeave);
			surface.removeEventListener("pointerdown", handlePointerDown);
			window.removeEventListener("pointerup", releaseHold);
			window.removeEventListener("pointercancel", releaseHold);
			window.removeEventListener("blur", releaseHold);
			window.removeEventListener("resize", handleResize);
		},
	};
};

const CipherField: React.FC<{
	ref: React.Ref<{ burst: (point: { x: number; y: number }) => void }>;
}> = ({ ref }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const engineRef = useRef<ReturnType<typeof createCipherEngine>>(null);

	useImperativeHandle(ref, () => ({
		burst: (point) => engineRef.current?.burst(point),
	}));

	useEffect(() => {
		if (!canvasRef.current) {
			return;
		}

		const engine = createCipherEngine(canvasRef.current);
		engineRef.current = engine;

		if (!engine) {
			return;
		}

		return () => {
			engine.destroy();
			engineRef.current = null;
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			aria-hidden="true"
			className="pointer-events-none fixed inset-0"
		/>
	);
};

export { CipherField };
