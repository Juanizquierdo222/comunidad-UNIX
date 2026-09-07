import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AlumnoProfileRow,
  Database,
  ExpositorProfileRow,
  ExternoProfileRow,
  InstructorProfileRow,
  ProfileRow,
} from "@/types/database";

export type FullProfile = {
  profile: ProfileRow;
  details: AlumnoProfileRow | InstructorProfileRow | ExternoProfileRow | ExpositorProfileRow | null;
};

/**
 * Obtiene el perfil del usuario autenticado junto con sus datos
 * específicos de rol. Toda la lectura pasa por RLS (el cliente
 * `supabase` recibido debe ser el server client con sesión del usuario).
 */
export async function getFullProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<FullProfile | null> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError || !profile) return null;

  let details: FullProfile["details"] = null;

  switch (profile.role) {
    case "alumno": {
      const { data } = await supabase.from("alumno_profiles").select("*").eq("profile_id", userId).maybeSingle();
      details = data;
      break;
    }
    case "instructor": {
      const { data } = await supabase
        .from("instructor_profiles")
        .select("*")
        .eq("profile_id", userId)
        .maybeSingle();
      details = data;
      break;
    }
    case "externo": {
      const { data } = await supabase.from("externo_profiles").select("*").eq("profile_id", userId).maybeSingle();
      details = data;
      break;
    }
    case "expositor": {
      const { data } = await supabase
        .from("expositor_profiles")
        .select("*")
        .eq("profile_id", userId)
        .maybeSingle();
      details = data;
      break;
    }
    default:
      details = null;
  }

  return { profile, details };
}
