import {
	Briefcase,
	Building2,
	CreditCard,
	FolderOpen,
	Gamepad2,
	Globe,
	GraduationCap,
	Heart,
	Key,
	Lock,
	Mail,
	Plane,
	ShoppingBag,
	Smartphone,
	Wallet,
	type LucideIcon,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
	"folder": FolderOpen,
	"credit-card": CreditCard,
	"globe": Globe,
	"smartphone": Smartphone,
	"mail": Mail,
	"lock": Lock,
	"wallet": Wallet,
	"key": Key,
	"building": Building2,
	"gamepad": Gamepad2,
	"shopping": ShoppingBag,
	"plane": Plane,
	"heart": Heart,
	"education": GraduationCap,
	"work": Briefcase,
};

export { CATEGORY_ICONS };
