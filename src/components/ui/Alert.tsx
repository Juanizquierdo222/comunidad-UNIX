import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "success" | "error" | "info";

const config: Record<AlertVariant, { icon: typeof Info; classes: string }> = {
  success: { icon: CheckCircle2, classes: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  error: { icon: AlertTriangle, classes: "bg-red-50 text-red-800 border-red-200" },
  info: { icon: Info, classes: "bg-brand-50 text-brand-800 border-brand-200" },
};

export function Alert({ variant = "info", children }: { variant?: AlertVariant; children: React.ReactNode }) {
  const { icon: Icon, classes } = config[variant];
  return (
    <div role="alert" className={cn("flex items-start gap-3 rounded-lg border px-4 py-3 text-sm animate-slide-down", classes)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
