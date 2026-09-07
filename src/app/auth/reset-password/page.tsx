import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Restablecer contraseña",
  description: "Establece una nueva contraseña para tu cuenta.",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Establece una nueva contraseña" description="Elige una contraseña segura para tu cuenta.">
      <ResetPasswordForm />
    </AuthShell>
  );
}
