import nodemailer from "nodemailer";

import { getEnv, isProduction } from "../env";
import { verificationEmailHtml } from "./verificationEmailHtml";

const sendVerificationCode = async ({
	email,
	code,
	name,
}: {
	email: string;
	code: string;
	name?: string;
}) => {
	const env = getEnv();

	if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
		if (isProduction()) {
			throw new Error("SMTP is not configured");
		}

		console.info(`[dev] Verification code for ${email}: ${code}`);

		return;
	}

	const transporter = nodemailer.createTransport({
		host: env.SMTP_HOST,
		port: env.SMTP_PORT,
		secure: env.SMTP_SECURE,
		auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
	});
	const greeting = name ?? "there";

	await transporter.sendMail({
		from: `"SecureVault" <${env.SMTP_FROM ?? env.SMTP_USER}>`,
		to: email,
		subject: "Your verification code - SecureVault",
		html: verificationEmailHtml({ greeting, code }),
		text: `Hey ${greeting},\n\nYour SecureVault verification code is: ${code}\n\nIt expires in 15 minutes. Never share this code with anyone.\n\nIf you didn't request this code, ignore this email.`,
	});
};

export { sendVerificationCode };
