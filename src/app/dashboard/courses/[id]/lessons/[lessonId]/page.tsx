import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Clock3 } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublishedCourse, getReadableLesson } from "@/services/course.service";
import { formatDuration } from "@/services/course.types";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const course = await getPublishedCourse(id);
  if (!course) notFound();
  // La consulta de contenido respeta RLS; un ID conocido no concede acceso.
  const lesson = await getReadableLesson(lessonId, course.id);
  if (!lesson) notFound();

  return (
    <main className="min-h-screen bg-[#0b1026] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href={`/dashboard/courses/${course.slug}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver al temario
        </Link>
        <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1d2854] to-[#27234d] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400">{course.title}</p>
          <p className="mt-4 text-sm text-slate-400">{lesson.course_modules.title}</p>
          <h1 className="mt-2 text-3xl font-bold">{lesson.title}</h1>
          {lesson.estimated_minutes != null && (
            <p className="mt-4 flex items-center gap-2 text-sm text-slate-400">
              <Clock3 className="h-4 w-4" />{formatDuration(lesson.estimated_minutes)}
            </p>
          )}
        </header>
        <article className="rounded-2xl border border-white/10 bg-[#141b35] p-6 sm:p-8">
          <div className="whitespace-pre-wrap break-words text-base leading-8 text-slate-200">
            {lesson.content || "Esta lección todavía no tiene contenido."}
          </div>
        </article>
        <p className="text-sm text-slate-500">El seguimiento de progreso y las evaluaciones se incorporarán en una etapa posterior.</p>
      </div>
    </main>
  );
}
