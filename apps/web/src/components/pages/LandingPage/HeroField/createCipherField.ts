const CELL = 26;
const FONT_SIZE = 12;
const POINTER_RADIUS = 140;
const REVEAL_RISE = 0.22;
const REVEAL_FALL = 0.035;
const MUTATION_RATE = 0.004;
const WAVE_SPEED = 0.85;
const WAVE_BAND = 36;
const WAVE_LIFETIME_MS = 1_400;
const RESEAL_BAND = 12;
const RESEAL_LIFETIME_MS = 700;
const RESEAL_GAP_MS = 380;
const FALLBACK_PHRASE = "SecureVault";
const GLYPHS =
	"ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789+/=#$%&*";
const FALLBACK_COLORS = { dim: "#9a978e", accent: "#1f5c4f" };

const pickGlyph = () =>
	GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));

const readColors = () => {
	const styles = getComputedStyle(document.documentElement);

	return {
		dim: styles.getPropertyValue("--subtle").trim() || FALLBACK_COLORS.dim,
		accent:
			styles.getPropertyValue("--primary").trim() ||
			FALLBACK_COLORS.accent,
	};
};

const createGlyphAtlas = ({ ratio }: { ratio: number }) => {
	let colors = readColors();
	let cache: Record<string, HTMLCanvasElement> = {};

	const render = ({ glyph, color }: { glyph: string; color: string }) => {
		const tile = document.createElement("canvas");
		const context = tile.getContext("2d");

		tile.width = CELL * ratio;
		tile.height = CELL * ratio;

		if (context) {
			context.scale(ratio, ratio);
			context.font = `500 ${FONT_SIZE}px "Geist Mono Variable", ui-monospace, monospace`;
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillStyle = color;
			context.fillText(glyph, CELL / 2, CELL / 2 + 0.5);
		}

		return tile;
	};

	return {
		read: ({ glyph, isAccent }: { glyph: string; isAccent: boolean }) => {
			const key = `${isAccent ? "a" : "d"}${glyph}`;

			cache[key] ??= render({
				glyph,
				color: isAccent ? colors.accent : colors.dim,
			});

			return cache[key];
		},
		refresh: () => {
			colors = readColors();
			cache = {};
		},
	};
};

const createCipherField = (canvas: HTMLCanvasElement) => {
	const context = canvas.getContext("2d");

	if (!context) {
		return null;
	}

	const isReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;
	const ratio = Math.min(window.devicePixelRatio, 2);
	const atlas = createGlyphAtlas({ ratio });
	const pointer = { x: -9_999, y: -9_999 };
	let phrase = FALLBACK_PHRASE;
	let width = 0;
	let height = 0;
	let columns = 0;
	let cells: { glyph: string; reveal: number; flash: number }[] = [];
	let waves: {
		x: number;
		y: number;
		startedAt: number;
		kind: "reveal" | "reseal";
	}[] = [];
	let lastResealAt = 0;
	let animationFrameId = 0;
	let isVisible = true;

	const resize = () => {
		width = canvas.clientWidth;
		height = canvas.clientHeight;
		canvas.width = width * ratio;
		canvas.height = height * ratio;
		context.setTransform(ratio, 0, 0, ratio, 0, 0);
		columns = Math.ceil(width / CELL);

		const rows = Math.ceil(height / CELL);

		cells = Array.from({ length: columns * rows }, () => ({
			glyph: pickGlyph(),
			reveal: 0,
			flash: 0,
		}));
	};

	const readPlainGlyph = (index: number) => {
		const text = `${phrase} · `;
		const row = Math.floor(index / columns);
		const position = (index + row * 7) % text.length;

		return text.charAt(position);
	};

	const draw = (time: number) => {
		context.clearRect(0, 0, width, height);
		waves = waves.filter(
			(wave) =>
				time - wave.startedAt <
				(wave.kind === "reveal"
					? WAVE_LIFETIME_MS
					: RESEAL_LIFETIME_MS),
		);

		cells.forEach((cell, index) => {
			const x = (index % columns) * CELL;
			const y = Math.floor(index / columns) * CELL;
			const centerX = x + CELL / 2;
			const centerY = y + CELL / 2;
			const proximity = Math.max(
				0,
				1 -
					Math.hypot(centerX - pointer.x, centerY - pointer.y) /
						POINTER_RADIUS,
			);
			let target = proximity > 0.25 ? 1 : 0;

			waves.forEach((wave) => {
				const elapsed = time - wave.startedAt;
				const distance = Math.hypot(centerX - wave.x, centerY - wave.y);
				const isInBand =
					Math.abs(distance - elapsed * WAVE_SPEED) <
					(wave.kind === "reveal" ? WAVE_BAND : RESEAL_BAND);

				if (!isInBand) {
					return;
				}

				if (wave.kind === "reveal") {
					target = 1;

					return;
				}

				cell.glyph = pickGlyph();
				cell.flash = 1;
			});

			cell.reveal +=
				(target - cell.reveal) *
				(target > cell.reveal ? REVEAL_RISE : REVEAL_FALL);
			cell.flash *= 0.86;

			if (Math.random() < MUTATION_RATE) {
				cell.glyph = pickGlyph();
			}

			const isRevealed = cell.reveal > 0.5;
			const plainGlyph = readPlainGlyph(index);

			if (isRevealed && plainGlyph === " ") {
				return;
			}

			const wave =
				(Math.sin(time * 0.000_9 - x * 0.009 + y * 0.005) + 1) / 2;

			context.globalAlpha = Math.min(
				1,
				0.06 +
					wave * wave * 0.14 +
					cell.reveal * 0.75 +
					cell.flash * 0.3,
			);
			context.drawImage(
				atlas.read({
					glyph: isRevealed ? plainGlyph : cell.glyph,
					isAccent: isRevealed || cell.flash > 0.5,
				}),
				x,
				y,
				CELL,
				CELL,
			);
		});

		context.globalAlpha = 1;
	};

	const loop = (time: number) => {
		draw(time);
		animationFrameId = isVisible ? requestAnimationFrame(loop) : 0;
	};

	const start = () => {
		if (isReducedMotion) {
			draw(0);

			return;
		}

		if (!animationFrameId) {
			animationFrameId = requestAnimationFrame(loop);
		}
	};

	const toLocalPoint = ({
		clientX,
		clientY,
	}: {
		clientX: number;
		clientY: number;
	}) => {
		const bounds = canvas.getBoundingClientRect();

		return { x: clientX - bounds.left, y: clientY - bounds.top };
	};

	const handlePointerMove = (event: PointerEvent) => {
		const point = toLocalPoint(event);

		pointer.x = point.x;
		pointer.y = point.y;
	};

	const handlePointerLeave = () => {
		pointer.x = -9_999;
		pointer.y = -9_999;
	};

	const handlePointerDown = (event: PointerEvent) => {
		const point = toLocalPoint(event);

		if (point.y < 0 || point.y > height) {
			return;
		}

		waves.push({ ...point, startedAt: performance.now(), kind: "reveal" });
	};

	const resizeObserver = new ResizeObserver(() => {
		resize();
		start();
	});
	const visibilityObserver = new IntersectionObserver(([entry]) => {
		isVisible = !!entry?.isIntersecting;

		if (isVisible) {
			start();
		}
	});
	const themeObserver = new MutationObserver(() => {
		atlas.refresh();
		start();
	});

	void document.fonts.ready.then(() => atlas.refresh());

	resizeObserver.observe(canvas);
	visibilityObserver.observe(canvas);
	themeObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
	});
	window.addEventListener("pointermove", handlePointerMove);
	document.documentElement.addEventListener(
		"pointerleave",
		handlePointerLeave,
	);
	window.addEventListener("pointerdown", handlePointerDown);

	return {
		setPhrase: (text: string) => {
			phrase = text.trim() || FALLBACK_PHRASE;
		},
		reseal: ({
			clientX,
			clientY,
		}: {
			clientX: number;
			clientY: number;
		}) => {
			const now = performance.now();

			if (now - lastResealAt < RESEAL_GAP_MS) {
				return;
			}

			lastResealAt = now;
			waves.push({
				...toLocalPoint({ clientX, clientY }),
				startedAt: now,
				kind: "reseal",
			});
		},
		destroy: () => {
			cancelAnimationFrame(animationFrameId);
			resizeObserver.disconnect();
			visibilityObserver.disconnect();
			themeObserver.disconnect();
			window.removeEventListener("pointermove", handlePointerMove);
			document.documentElement.removeEventListener(
				"pointerleave",
				handlePointerLeave,
			);
			window.removeEventListener("pointerdown", handlePointerDown);
		},
	};
};

export { createCipherField };
