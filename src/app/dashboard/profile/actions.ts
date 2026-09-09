"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/action-state";
import {
  profileUpdateSchema,
  alumnoDetailsUpdateSchema,
  instructorDetailsUpdateSchema,
  externoDetailsUpdateSchema,
  expositorDetailsUpdateSchema,
} from "@/validations/profile";

type EditableRole = "alumno" | "instructor" | "externo" | "expositor";

const tables = {
  alumno: "alumno_profiles",
  instructor: "instructor_profiles",
  externo: "externo_profiles",
  expositor: "expositor_profiles",
} as const;

function errorState(message: string, fieldErrors?: Record<string, string[]>): ActionState {
  return { status: "error", message, fieldErrors };
}

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optional(value: string): string | null {
  return value === "" ? null : value;
}

function rolePayload(role: EditableRole, formData: FormData) {
  const institution = readText(formData, "institution_type");
  const institutionOther = institution === "OTRA"
    ? readText(formData, "institution_other_name") : "";
  const commonInstitution = {
    institution_type: institution,
    institution_other_name: institutionOther,
  };

  switch (role) {
    case "alumno":
      return alumnoDetailsUpdateSchema.safeParse({
        control_number: readText(formData, "control_number"),
        ...commonInstitution,
      });
    case "instructor":
      return instructorDetailsUpdateSchema.safeParse({
        control_number: readText(formData, "control_number"),
        department: readText(formData, "department"),
        specialty: readText(formData, "specialty"),
        academic_degree: readText(formData, "academic_degree"),
        academic_degree_other: readText(formData, "academic_degree") === "OTRO"
          ? readText(formData, "academic_degree_other") : "",
      });
    case "externo":
      return externoDetailsUpdateSchema.safeParse({
        ...commonInstitution,
        organization: readText(formData, "organization"),
      });
    case "expositor":
      return expositorDetailsUpdateSchema.safeParse({
        bio: readText(formData, "bio"),
        ...commonInstitution,
        organization: readText(formData, "organization"),
        profile_link: readText(formData, "profile_link"),
      });
  }
}

function normalizedDetails(role: EditableRole, data: Record<string, unknown>) {
  const payload = { ...data };
  if (role !== "instructor") {
    payload.institution_other_name = optional(String(payload.institution_other_name ?? ""));
  }
  if (role === "instructor") {
    payload.control_number = optional(String(payload.control_number ?? ""));
    payload.academic_degree_other = optional(String(payload.academic_degree_other ?? ""));
  }
  if (role === "expositor") {
    payload.organization = optional(String(payload.organization ?? ""));
    payload.profile_link = optional(String(payload.profile_link ?? ""));
  }
  return payload;
}

export async function updateProfileAction(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return errorState("Tu sesión ha terminado. Inicia sesión nuevamente.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return errorState("No se pudo consultar tu perfil.");
  }

  // El rol se obtiene exclusivamente de la base de datos.
  // Nunca se utiliza el campo oculto role para decidir qué tabla actualizar.
  const role = profile.role;
  if (role === "admin" || !profile.onboarding_completed || !["alumno", "instructor", "externo", "expositor"].includes(role)) {
    return errorState("Este perfil no está disponible para edición.");
  }
  const editableRole = role as EditableRole;

  const base = profileUpdateSchema.safeParse({
    full_name: readText(formData, "full_name"),
    phone: readText(formData, "phone"),
  });
  const details = rolePayload(editableRole, formData);

  if (!base.success || !details.success) {
    const fieldErrors = {
      ...(!base.success ? base.error.flatten().fieldErrors : {}),
      ...(!details.success ? details.error.flatten().fieldErrors : {}),
    } as Record<string, string[]>;
    return errorState("Revisa los campos marcados en rojo.", fieldErrors);
  }

  const table = tables[editableRole];

  // Comprobamos que exista la fila específica antes de guardar.
  const { data: existing, error: existingError } = await supabase
    .from(table)
    .select("profile_id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existingError || !existing) {
    return errorState("No se encontró el registro de tu perfil. No se guardaron cambios.");
  }

  const payload = normalizedDetails(
    editableRole,
    details.data as Record<string, unknown>
  );

  // Solo se envían campos validados y permitidos. No se envían role,
  // profile_id, public_code, onboarding_completed ni campos de auditoría.
  const detailDb = supabase as unknown as SupabaseClient;
  const { error: detailError } = await detailDb
    .from(table)
    .update(payload)
    .eq("profile_id", user.id);

  if (detailError) {
    if (detailError.code === "23505") {
      return errorState("El número de control ya está registrado.");
    }
    return errorState("No se pudieron guardar los datos específicos. Verifica los campos e intenta nuevamente.");
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      full_name: base.data.full_name,
      phone: optional(base.data.phone ?? ""),
    })
    .eq("id", user.id);

  if (updateError) {
    return errorState(
      "Los datos específicos se guardaron, pero no se pudo actualizar el nombre o teléfono. Intenta guardar nuevamente."
    );
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");

  return { status: "success", message: "Perfil actualizado correctamente." };
}
