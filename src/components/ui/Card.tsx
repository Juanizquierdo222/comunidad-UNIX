import { cn } from "@/lib/utils";

export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("rounded-2xl border border-surface-200 bg-white shadow-sm", className)}>{children}</div>
);

export const CardHeader = ({ title, description }: { title: string; description?: string }) => (
  <div className="border-b border-surface-100 px-6 py-5">
    <h2 className="text-lg font-semibold text-surface-900">{title}</h2>
    {description && <p className="mt-1 text-sm text-surface-500">{description}</p>}
  </div>
);

export const CardBody = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("px-6 py-5", className)}>{children}</div>
);
