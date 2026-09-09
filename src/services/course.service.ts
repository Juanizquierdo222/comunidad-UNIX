import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CatalogCourse, CourseLevel } from "./course.types";

// Adaptador temporal hasta regenerar src/types/database.ts con el esquema nuevo.
// No usa service_role ni evita RLS: conserva la sesión del usuario del servidor.
export async function getCourseDb() {
  return (await createSupabaseServerClient()) as unknown as SupabaseClient;
}

type CourseRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  level: CourseLevel;
  estimated_minutes: number | null;
  course_modules: Array<{ id: string; course_lessons: Array<{ id: string }> }>;
};

export async function getPublishedCourses(): Promise<CatalogCourse[]> {
  const supabase = await getCourseDb();
  const { data, error } = await supabase
    .from("courses")
    .select("id, slug, title, description, category, level, estimated_minutes, course_modules(id, course_lessons(id))")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw new Error(`No se pudo cargar el catálogo: ${error.message}`);
  return ((data ?? []) as CourseRow[]).map(({ course_modules, ...course }) => ({
    ...course,
    lessons: course_modules.reduce((sum, m) => sum + m.course_lessons.length, 0),
  }));
}

export async function getPublishedCourse(slug: string) {
  const supabase = await getCourseDb();
  const { data, error } = await supabase
    .from("courses")
    .select("id, slug, title, description, category, level, estimated_minutes")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(`No se pudo cargar el curso: ${error.message}`);
  return data as Omit<CatalogCourse, "lessons"> | null;
}

export async function getCourseOutline(courseId: string) {
  const supabase = await getCourseDb();
  const { data, error } = await supabase
    .from("course_modules")
    .select("id, title, description, position, course_lessons(id, title, position, estimated_minutes, is_preview)")
    .eq("course_id", courseId)
    .order("position", { ascending: true });
  if (error) throw new Error(`No se pudo cargar el temario: ${error.message}`);
  return (data ?? []) as Array<{
    id: string;
    title: string;
    description: string | null;
    position: number;
    course_lessons: Array<{
      id: string; title: string; position: number;
      estimated_minutes: number | null; is_preview: boolean;
    }>;
  }>;
}

export type CourseAccess = {
  canEnroll: boolean;
  isEnrolled: boolean;
  canManage: boolean;
};

export async function getCourseAccess(courseId: string, userId: string, creatorId: string): Promise<CourseAccess> {
  const supabase = await getCourseDb();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", userId)
    .single();
  if (profileError) throw new Error("No se pudo comprobar el perfil.");
  const { data: enrollment, error: enrollmentError } = await supabase
    .from("course_enrollments")
    .select("course_id")
    .eq("course_id", courseId)
    .eq("student_id", userId)
    .maybeSingle();
  if (enrollmentError) throw new Error("No se pudo comprobar la inscripción.");

  const role = profile.role as string;
  let canManage = role === "admin";
  if (!canManage && creatorId === userId && (role === "instructor" || role === "expositor")) {
    const { data: approval, error } = await supabase
      .from("creator_approvals")
      .select("approved")
      .eq("profile_id", userId)
      .maybeSingle();
    if (error) throw new Error("No se pudo comprobar la autorización.");
    canManage = approval?.approved === true && profile.onboarding_completed === true;
  }
  return {
    canEnroll: profile.onboarding_completed === true && (role === "alumno" || role === "externo"),
    isEnrolled: enrollment !== null,
    canManage,
  };
}

export type CourseLesson = {
  id: string;
  title: string;
  content: string;
  estimated_minutes: number | null;
  is_preview: boolean;
  course_modules: {
    id: string;
    title: string;
    course_id: string;
    courses: { id: string; slug: string; title: string };
  };
};

// Selecciona el contenido únicamente bajo la sesión y las políticas RLS.
// No se consulta contenido por separado con service_role ni se guarda en caché pública.
export async function getReadableLesson(lessonId: string, courseId: string) {
  const supabase = await getCourseDb();
  const { data, error } = await supabase
    .from("course_lessons")
    .select("id, title, content, estimated_minutes, is_preview, course_modules!inner(id, title, course_id, courses!inner(id, slug, title))")
    .eq("id", lessonId)
    .eq("course_modules.course_id", courseId)
    .eq("course_modules.courses.status", "published")
    .maybeSingle();
  if (error) throw new Error(`No se pudo cargar la lección: ${error.message}`);
  return data as CourseLesson | null;
}
