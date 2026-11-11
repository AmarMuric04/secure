import { useEffect, useRef } from "react";

const ACTIVITY_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"];

const useAutoLock = ({
	minutes,
	onLock,
}: {
	minutes: number;
	onLock: () => void;
}) => {
	const lockAtRef = useRef(0);

	useEffect(() => {
		const duration = minutes * 60_000;
		let timeoutId = window.setTimeout(onLock, duration);
		lockAtRef.current = Date.now() + duration;

		const handleActivity = () => {
			window.clearTimeout(timeoutId);
			timeoutId = window.setTimeout(onLock, duration);
			lockAtRef.current = Date.now() + duration;
		};

		for (const eventName of ACTIVITY_EVENTS) {
			window.addEventListener(eventName, handleActivity, {
				passive: true,
			});
		}

		return () => {
			window.clearTimeout(timeoutId);

			for (const eventName of ACTIVITY_EVENTS) {
				window.removeEventListener(eventName, handleActivity);
			}
		};
	}, [minutes]);

	return lockAtRef;
};

export { useAutoLock };
