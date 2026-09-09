"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCourseDb } from "@/services/course.service";

export type EnrollmentState = { error: string | null; success: boolean };
export const initialEnrollmentState: EnrollmentState = { error: null, success: false };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function enrollInCourse(
  _previous: EnrollmentState,
  formData: FormData
): Promise<EnrollmentState> {
  const courseId = formData.get("courseId");
  if (typeof courseId !== "string" || !uuidPattern.test(courseId)) {
    return { error: "El identificador del curso no es válido.", success: false };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Inicia sesión para inscribirte.", success: false };
  }

  const db = await getCourseDb();
  const { data: profile, error: profileError } = await db.from("profiles")
    .select("role, onboarding_completed").eq("id", user.id).single();
  if (profileError || !profile?.onboarding_completed ||
      !["alumno", "externo"].includes(profile.role as string)) {
    return { error: "Tu perfil no tiene permiso para inscribirse.", success: false };
  }

  const { data: course, error: courseError } = await db.from("courses")
    .select("id, slug, status").eq("id", courseId).eq("status", "published").maybeSingle();
  if (courseError || !course) {
    return { error: "El curso no está disponible para inscripción.", success: false };
  }

  // La clave primaria compuesta evita duplicados. Nunca se acepta un ID de
  // estudiante del formulario; PostgreSQL también lo impone en su trigger.
  const { error } = await db.from("course_enrollments").insert({
    course_id: course.id,
    student_id: user.id,
  });
  if (error && error.code !== "23505") {
    return { error: "No se pudo completar la inscripción. Intenta de nuevo.", success: false };
  }

  revalidatePath(`/dashboard/courses/${course.slug}`);
  revalidatePath("/dashboard/courses");
  return { error: null, success: true };
}
