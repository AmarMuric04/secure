import { useEffect, useRef } from "react";

import { createCipherField } from "./createCipherField";

const HeroField: React.FC<{
	phrase: string;
	anchorRef: React.RefObject<HTMLDivElement | null>;
}> = ({ phrase, anchorRef }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fieldRef = useRef<ReturnType<typeof createCipherField>>(null);

	useEffect(() => {
		const canvas = canvasRef.current;

		if (!canvas) {
			return;
		}

		const field = createCipherField(canvas);

		fieldRef.current = field;

		return () => {
			field?.destroy();
			fieldRef.current = null;
		};
	}, []);

	useEffect(() => {
		const field = fieldRef.current;
		const anchor = anchorRef.current;

		field?.setPhrase(phrase);

		if (!field || !anchor || !phrase) {
			return;
		}

		const bounds = anchor.getBoundingClientRect();

		field.reseal({
			clientX: bounds.left + bounds.width / 2,
			clientY: bounds.top + bounds.height / 2,
		});
	}, [phrase, anchorRef]);

	return (
		<canvas
			ref={canvasRef}
			aria-hidden="true"
			className="pointer-events-none absolute -top-16 left-1/2 -z-10 h-[calc(100%+4rem)] w-screen -translate-x-1/2 mask-[linear-gradient(to_bottom,black_55%,transparent)]"
		/>
	);
};

export { HeroField };
