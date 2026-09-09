import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublishedCourses } from "@/services/course.service";
import CoursesCatalog from "@/components/courses/CoursesCatalog";

export default async function CoursesPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const courses = await getPublishedCourses();

  return <CoursesCatalog courses={courses} />;
}