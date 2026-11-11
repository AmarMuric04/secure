import { cn } from "@/lib/utils";

const FieldRow: React.FC<{
	label: string;
	htmlFor?: string;
	isTop?: boolean;
	children: React.ReactNode;
}> = ({ label, htmlFor, isTop = false, children }) => {
	return (
		<div className="group/field relative grid border-b border-border py-1.5 before:absolute before:top-3 before:bottom-3 before:-left-4 before:w-0.5 before:origin-center before:scale-y-0 before:rounded-full before:bg-primary before:transition-transform before:duration-300 before:ease-out-quint before:content-[''] focus-within:before:scale-y-100 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-4">
			<label
				htmlFor={htmlFor}
				className={cn(
					"pt-2 text-[13px] text-subtle transition-colors duration-200 group-focus-within/field:text-foreground sm:pt-0",
					isTop ? "sm:pt-2.5" : "sm:self-center",
				)}
			>
				{label}
			</label>
			<div className="min-w-0">{children}</div>
		</div>
	);
};

export { FieldRow };
