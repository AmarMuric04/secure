import type { Types } from "mongoose";

const toPublicUser = (user: {
	_id: Types.ObjectId;
	email: string;
	emailVerified?: boolean | null;
	name?: string | null;
	avatarUrl?: string | null;
	authProvider?: string | null;
	mfaEnabled?: boolean | null;
	settings?: Record<string, unknown> | null;
	createdAt: Date;
}) => ({
	id: user._id.toString(),
	email: user.email,
	emailVerified: Boolean(user.emailVerified),
	name: user.name ?? null,
	avatarUrl: user.avatarUrl ?? null,
	authProvider: user.authProvider === "google" ? "google" : "credentials",
	mfaEnabled: Boolean(user.mfaEnabled),
	settings: user.settings ?? {},
	createdAt: user.createdAt.toISOString(),
});

const toPasswordEntry = (entry: {
	_id: Types.ObjectId;
	encryptedData: string;
	iv: string;
	categoryId?: string | null;
	tags?: string[] | null;
	favorite?: boolean | null;
	passwordStrength?: number | null;
	isCompromised?: boolean | null;
	isReused?: boolean | null;
	createdAt: Date;
	updatedAt: Date;
	lastUsedAt?: Date | null;
	passwordChangedAt?: Date | null;
	deletedAt?: Date | null;
}) => ({
	id: entry._id.toString(),
	encryptedData: entry.encryptedData,
	iv: entry.iv,
	categoryId: entry.categoryId ?? null,
	tags: entry.tags ?? [],
	favorite: Boolean(entry.favorite),
	passwordStrength: entry.passwordStrength ?? 0,
	isCompromised: Boolean(entry.isCompromised),
	isReused: Boolean(entry.isReused),
	createdAt: entry.createdAt.toISOString(),
	updatedAt: entry.updatedAt.toISOString(),
	lastUsedAt: entry.lastUsedAt?.toISOString() ?? null,
	passwordChangedAt: entry.passwordChangedAt?.toISOString() ?? null,
	deletedAt: entry.deletedAt?.toISOString() ?? null,
});

const toCategory = (category: {
	_id: Types.ObjectId;
	name: string;
	icon?: string | null;
	color?: string | null;
	order?: number | null;
	isDefault?: boolean | null;
	isLocked?: boolean | null;
	createdAt: Date;
	updatedAt: Date;
}) => ({
	id: category._id.toString(),
	name: category.name,
	icon: category.icon ?? "📁",
	color: category.color ?? "#6B7280",
	order: category.order ?? 0,
	isDefault: Boolean(category.isDefault),
	isLocked: Boolean(category.isLocked),
	createdAt: category.createdAt.toISOString(),
	updatedAt: category.updatedAt.toISOString(),
});

const toAuthSession = ({
	session,
	currentSessionId,
}: {
	session: {
		_id: Types.ObjectId;
		userAgent?: string | null;
		ipAddress?: string | null;
		createdAt: Date;
		lastActiveAt: Date;
	};
	currentSessionId: string;
}) => ({
	id: session._id.toString(),
	userAgent: session.userAgent ?? null,
	ipAddress: session.ipAddress ?? null,
	createdAt: session.createdAt.toISOString(),
	lastActiveAt: session.lastActiveAt.toISOString(),
	isCurrent: session._id.toString() === currentSessionId,
});

export { toAuthSession, toCategory, toPasswordEntry, toPublicUser };
