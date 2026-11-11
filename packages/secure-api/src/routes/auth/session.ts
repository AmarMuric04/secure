import { AuthSessionModel, UserModel } from "../../db";
import { recordAudit } from "../../http/audit";
import { apiError, notFound } from "../../http/errors";
import { factory } from "../../http/factory";
import { objectIdSchema } from "../../http/schemas";
import { toAuthSession, toPublicUser } from "../../http/serializers";
import { endSession, requireSession } from "../../http/session";

const sessionRoutes = factory
	.createApp()
	.get("/session", requireSession, async (context) => {
		const user = await UserModel.findById(context.var.auth.userId).lean();

		if (!user) {
			throw notFound("User not found");
		}

		return context.json({ user: toPublicUser(user) });
	})
	.post("/logout", requireSession, async (context) => {
		await endSession(context);
		await recordAudit({
			context,
			userId: context.var.auth.userId,
			action: "logout",
			resourceType: "session",
		});

		return context.body(null, 204);
	})
	.get("/sessions", requireSession, async (context) => {
		const { userId, sessionId } = context.var.auth;
		const now = new Date();
		const sessions = await AuthSessionModel.find({
			userId,
			expiresAt: { $gt: now },
			absoluteExpiresAt: { $gt: now },
		})
			.select("userAgent ipAddress createdAt lastActiveAt")
			.sort({ lastActiveAt: -1 })
			.lean();

		return context.json({
			sessions: sessions.map((session) =>
				toAuthSession({ session, currentSessionId: sessionId }),
			),
		});
	})
	.delete("/sessions/:id", requireSession, async (context) => {
		const { userId, sessionId } = context.var.auth;
		const parsedId = objectIdSchema.safeParse(context.req.param("id"));

		if (!parsedId.success) {
			throw notFound("Session not found");
		}

		if (parsedId.data === sessionId) {
			throw apiError({
				status: 400,
				code: "CURRENT_SESSION",
				message: "Use sign out to end this session",
			});
		}

		const { deletedCount } = await AuthSessionModel.deleteOne({
			_id: parsedId.data,
			userId,
		});

		if (deletedCount === 0) {
			throw notFound("Session not found");
		}

		await recordAudit({
			context,
			userId,
			action: "session_revoked",
			resourceType: "session",
			resourceId: parsedId.data,
		});

		return context.body(null, 204);
	})
	.delete("/sessions", requireSession, async (context) => {
		const { userId, sessionId } = context.var.auth;
		const { deletedCount } = await AuthSessionModel.deleteMany({
			userId,
			_id: { $ne: sessionId },
		});

		await recordAudit({
			context,
			userId,
			action: "session_revoked",
			resourceType: "session",
			metadata: { revokedSessions: deletedCount },
		});

		return context.json({ revokedSessions: deletedCount });
	});

export { sessionRoutes };
