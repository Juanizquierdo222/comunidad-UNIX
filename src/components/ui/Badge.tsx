import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  alumno: "Alumno",
  instructor: "Instructor",
  externo: "Externo",
  expositor: "Expositor",
  admin: "Administrador",
};

const ROLE_CLASSES: Record<string, string> = {
  alumno: "bg-brand-50 text-brand-700 ring-brand-600/20",
  instructor: "bg-violet-50 text-violet-700 ring-violet-600/20",
  externo: "bg-amber-50 text-amber-700 ring-amber-600/20",
  expositor: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  admin: "bg-surface-100 text-surface-700 ring-surface-500/20",
};

export function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        ROLE_CLASSES[role] ?? "bg-surface-100 text-surface-700 ring-surface-500/20"
      )}
    >
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}
