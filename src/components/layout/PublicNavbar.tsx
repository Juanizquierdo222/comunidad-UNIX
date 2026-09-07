import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-surface-200 bg-white/80 backdrop-blur">
      <nav className="container-app flex h-16 items-center justify-between" aria-label="Principal">
        <Link href="/" className="flex items-center gap-2 font-semibold text-surface-900">
          <ShieldCheck className="h-6 w-6 text-brand-600" aria-hidden="true" />
          <span>Sistema de Registro</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              Iniciar sesión
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="primary" size="sm">
              Crear cuenta
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
