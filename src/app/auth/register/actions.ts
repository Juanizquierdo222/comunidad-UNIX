"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { registrationSchema } from "@/validations/registration";
import { toFriendlyErrorMessage } from "@/lib/errors";
import { createRoleProfile } from "@/services/registration.service";
import type { ActionState } from "@/lib/action-state";

function readForm(formData: FormData) {
  const raw: Record<string, string> = {};
  formData.forEach((value, key) => {
    raw[key] = typeof value === "string" ? value : "";
  });
  return raw;
}

export async function registerAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const raw = readForm(formData);
  const parsed = registrationSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados en rojo.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { role: data.role, full_name: data.full_name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/onboarding`,
    },
  });

  if (signUpError) {
    return { status: "error", message: toFriendlyErrorMessage(signUpError) };
  }

  if (!signUpData.user) {
    return { status: "error", message: "No fue posible crear la cuenta. Intenta nuevamente." };
  }

  // Si Supabase Auth exige confirmación de correo, no hay sesión activa
  // todavía: no podemos insertar en las tablas protegidas por RLS
  // (requieren auth.uid()). El usuario completará su perfil de rol en
  // /onboarding la primera vez que inicie sesión.
  if (!signUpData.session) {
    redirect("/auth/check-email");
  }

  try {
    await createRoleProfile(supabase, signUpData.user.id, data);
  } catch (error) {
    return { status: "error", message: toFriendlyErrorMessage(error) };
  }

  redirect("/dashboard");
}
