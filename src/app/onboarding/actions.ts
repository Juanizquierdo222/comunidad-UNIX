"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toFriendlyErrorMessage } from "@/lib/errors";
import { createRoleProfile } from "@/services/registration.service";
import type { ActionState } from "@/lib/action-state";
import {
  alumnoRegistrationSchema,
  instructorRegistrationSchema,
  externoRegistrationSchema,
  expositorRegistrationSchema,
} from "@/validations/registration";
import { z } from "zod";

// Mismos campos de rol que el registro, sin email/password (la cuenta
// ya existe y el usuario ya inició sesión).
const onboardingSchema = z.discriminatedUnion("role", [
  alumnoRegistrationSchema.omit({ email: true, password: true }),
  instructorRegistrationSchema.omit({ email: true, password: true }),
  externoRegistrationSchema.omit({ email: true, password: true }),
  expositorRegistrationSchema.omit({ email: true, password: true }),
]);

export async function completeOnboardingAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const raw: Record<string, string> = {};
  formData.forEach((value, key) => {
    raw[key] = typeof value === "string" ? value : "";
  });

  const parsed = onboardingSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados en rojo.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  try {
  const { error: roleError } = await supabase.rpc("set_onboarding_role", {
    requested_role: parsed.data.role,
  });

  if (roleError) {
    throw roleError;
  }

  await createRoleProfile(supabase, user.id, parsed.data);
} catch (error) {
  return {
    status: "error",
    message: toFriendlyErrorMessage(error),
  };
}

redirect("/dashboard");
}
