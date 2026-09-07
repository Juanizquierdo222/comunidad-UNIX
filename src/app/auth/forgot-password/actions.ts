"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { forgotPasswordSchema } from "@/validations/auth";
import type { ActionState } from "@/lib/action-state";

export async function forgotPasswordAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Ingresa un correo válido.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Por seguridad (evitar enumeración de usuarios) siempre respondemos
  // con el mismo mensaje de éxito, exista o no la cuenta.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/auth/reset-password`,
  });

  return {
    status: "success",
    message: "Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.",
  };
}
