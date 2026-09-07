import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Confirma tu correo",
  robots: { index: false, follow: false },
};

export default function CheckEmailPage() {
  return (
    <AuthShell title="Revisa tu correo" description="Te enviamos un enlace de confirmación.">
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <MailCheck className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="text-sm text-surface-600">
          Haz clic en el enlace que enviamos a tu correo electrónico para activar tu cuenta. Después podrás
          iniciar sesión y completar tu perfil.
        </p>
        <Link href="/auth/login" className="w-full">
          <Button variant="outline" className="w-full">
            Ir a iniciar sesión
          </Button>
        </Link>
      </div>
    </AuthShell>
  );
}
