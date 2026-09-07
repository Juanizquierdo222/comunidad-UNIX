import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function AuthShell({
  title,
  description,
  children,
  wide,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-50">
      <div className="container-app flex flex-1 flex-col items-center justify-center py-10">
        <Link href="/" className="mb-8 flex items-center gap-2 font-semibold text-surface-900">
          <ShieldCheck className="h-6 w-6 text-brand-600" aria-hidden="true" />
          <span>Sistema de Registro</span>
        </Link>

        <div className={`w-full ${wide ? "max-w-2xl" : "max-w-md"}`}>
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-surface-900">{title}</h1>
              <p className="mt-1 text-sm text-surface-500">{description}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
