const REVOKE_DELAY_MS = 1_000;

const downloadTextFile = ({
	fileName,
	text,
	type,
}: {
	fileName: string;
	text: string;
	type: string;
}) => {
	const url = URL.createObjectURL(new Blob([text], { type }));
	const link = document.createElement("a");

	link.href = url;
	link.download = fileName;
	link.click();
	window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
};

export { downloadTextFile };
