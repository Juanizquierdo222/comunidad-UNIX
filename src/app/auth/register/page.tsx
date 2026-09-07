import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegistrationForm } from "@/components/forms/RegistrationForm";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Regístrate como Alumno, Instructor, Externo o Expositor.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Crea tu cuenta"
      description="Selecciona tu tipo de registro y completa el formulario."
      wide
    >
      <RegistrationForm />
      <p className="mt-6 text-center text-sm text-surface-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/auth/login" className="font-medium text-brand-600 hover:text-brand-700">
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  );
}
