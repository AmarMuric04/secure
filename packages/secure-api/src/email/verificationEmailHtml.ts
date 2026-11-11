const escapeHtml = (value: string) =>
	value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");

const verificationEmailHtml = ({
	greeting,
	code,
}: {
	greeting: string;
	code: string;
}) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Verify your email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
<tr>
<td style="padding: 48px 20px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 400px; margin: 0 auto;">
<tr>
<td style="text-align: center; padding-bottom: 40px;">
<span style="font-size: 20px; font-weight: 600; color: #ffffff; letter-spacing: -0.5px;">SecureVault</span>
</td>
</tr>
<tr>
<td style="text-align: center;">
<p style="margin: 0 0 24px 0; font-size: 15px; color: #a1a1aa; line-height: 1.6;">Hey ${escapeHtml(greeting)}, here's your verification code:</p>
<div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px 16px; margin-bottom: 24px;">
<span style="font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'SF Mono', Monaco, 'Courier New', monospace;">${code}</span>
</div>
<p style="margin: 0 0 32px 0; font-size: 13px; color: #71717a;">Expires in 15 minutes</p>
<div style="height: 1px; background-color: #27272a; margin: 0 0 24px 0;"></div>
<p style="margin: 0; font-size: 12px; color: #52525b; line-height: 1.6;">If you didn't request this code, ignore this email.</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;

export { verificationEmailHtml };
