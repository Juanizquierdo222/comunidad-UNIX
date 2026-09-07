import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  description: "Solicita un enlace para restablecer tu contraseña.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="¿Olvidaste tu contraseña?" description="Te enviaremos un enlace para restablecerla.">
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm text-surface-500">
        <Link href="/auth/login" className="font-medium text-brand-600 hover:text-brand-700">
          Volver a iniciar sesión
        </Link>
      </p>
    </AuthShell>
  );
}
