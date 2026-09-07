import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { RegistrationInput } from "@/validations/registration";

// `Omit<T, K>` NO distribuye sobre uniones discriminadas (solo opera
// sobre `keyof T`, que para una unión es la intersección de claves).
// Se necesita una versión distributiva explícita para conservar cada
// variante del discriminated union tras quitar email/password.
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type RoleProfileInput = DistributiveOmit<RegistrationInput, "email" | "password">;

/**
 * Inserta la fila específica de rol (alumno/instructor/externo/expositor)
 * para el usuario ya autenticado. PostgreSQL marca `onboarding_completed`
 * mediante un trigger AFTER INSERT en la misma transacción, evitando estados
 * parciales si una de las operaciones falla.
 * Se apoya completamente en RLS: si `profile_id` no coincide con
 * `auth.uid()` o el rol no coincide con `profiles.role`, la base de
 * datos rechaza la inserción (ver 0002_rls_policies.sql).
 */
export async function createRoleProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  data: RoleProfileInput
) {
  switch (data.role) {
    case "alumno": {
      const { error } = await supabase.from("alumno_profiles").insert({
        profile_id: userId,
        control_number: data.control_number,
        institution_type: data.institution_type,
        institution_other_name: data.institution_type === "OTRA" ? data.institution_other_name ?? null : null,
      });
      if (error) throw error;
      break;
    }
    case "instructor": {
      const { error } = await supabase.from("instructor_profiles").insert({
        profile_id: userId,
        control_number: data.control_number || null,
        department: data.department,
        specialty: data.specialty,
        academic_degree: data.academic_degree,
        academic_degree_other: data.academic_degree === "OTRO" ? data.academic_degree_other ?? null : null,
      });
      if (error) throw error;
      break;
    }
    case "externo": {
      const { error } = await supabase.from("externo_profiles").insert({
        profile_id: userId,
        institution_type: data.institution_type,
        institution_other_name: data.institution_type === "OTRA" ? data.institution_other_name ?? null : null,
        organization: data.organization,
        public_code: "",
      });
      if (error) throw error;
      break;
    }
    case "expositor": {
      const { error } = await supabase.from("expositor_profiles").insert({
        profile_id: userId,
        bio: data.bio,
        institution_type: data.institution_type,
        institution_other_name: data.institution_type === "OTRA" ? data.institution_other_name ?? null : null,
        organization: data.organization || null,
        profile_link: data.profile_link || null,
        public_code: "",
      });
      if (error) throw error;
      break;
    }
  }

}
