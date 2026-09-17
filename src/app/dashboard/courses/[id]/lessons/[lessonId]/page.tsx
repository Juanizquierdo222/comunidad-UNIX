import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock3,
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getCourseOutline,
  getPublishedCourse,
  getReadableLesson,
} from "@/services/course.service";
import { formatDuration } from "@/services/course.types";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const course = await getPublishedCourse(id);

  if (!course) {
    notFound();
  }

  // RLS sigue siendo la autoridad que determina si el usuario
  // puede leer el contenido de esta lección.
  const lesson = await getReadableLesson(lessonId, course.id);

  if (!lesson) {
    notFound();
  }

  const outline = await getCourseOutline(course.id);

  // Construimos una lista lineal respetando:
  // 1. posición del módulo
  // 2. posición de la lección dentro del módulo
  const lessons = outline.flatMap((module) =>
    module.course_lessons.map((item) => ({
      id: item.id,
      title: item.title,
      moduleTitle: module.title,
    }))
  );

  const currentIndex = lessons.findIndex(
    (item) => item.id === lesson.id
  );

  const previousLesson =
    currentIndex > 0 ? lessons[currentIndex - 1] : null;

  const nextLesson =
    currentIndex >= 0 && currentIndex < lessons.length - 1
      ? lessons[currentIndex + 1]
      : null;

  return (
    <main className="min-h-screen bg-[#0b1026] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href={`/dashboard/courses/${course.slug}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al temario
        </Link>

        <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1d2854] to-[#27234d] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400">
            {course.title}
          </p>

          <p className="mt-4 text-sm text-slate-400">
            {lesson.course_modules.title}
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {lesson.title}
          </h1>

          {lesson.estimated_minutes != null && (
            <p className="mt-4 flex items-center gap-2 text-sm text-slate-400">
              <Clock3 className="h-4 w-4" />
              {formatDuration(lesson.estimated_minutes)}
            </p>
          )}
        </header>

        <article className="rounded-2xl border border-white/10 bg-[#141b35] p-6 sm:p-8">
          <div className="whitespace-pre-wrap break-words text-base leading-8 text-slate-200">
            {lesson.content ||
              "Esta lección todavía no tiene contenido."}
          </div>
        </article>

        <nav
          aria-label="Navegación entre lecciones"
          className="grid gap-3 sm:grid-cols-3"
        >
          {previousLesson ? (
            <Link
              href={`/dashboard/courses/${course.slug}/lessons/${previousLesson.id}`}
              className="flex min-h-20 items-center gap-3 rounded-xl border border-white/10 bg-[#141b35] px-4 py-3 transition hover:border-orange-400/50 hover:bg-[#18203d]"
            >
              <ArrowLeft className="h-5 w-5 shrink-0 text-orange-400" />

              <div className="min-w-0">
                <p className="text-xs text-slate-500">
                  Anterior
                </p>
                <p className="truncate text-sm font-medium text-slate-200">
                  {previousLesson.title}
                </p>
              </div>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}

          <Link
            href={`/dashboard/courses/${course.slug}`}
            className="flex min-h-20 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#141b35] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-orange-400/50 hover:bg-[#18203d]"
          >
            <BookOpen className="h-5 w-5 text-orange-400" />
            Ver temario
          </Link>

          {nextLesson ? (
            <Link
              href={`/dashboard/courses/${course.slug}/lessons/${nextLesson.id}`}
              className="flex min-h-20 items-center justify-end gap-3 rounded-xl border border-white/10 bg-[#141b35] px-4 py-3 text-right transition hover:border-orange-400/50 hover:bg-[#18203d]"
            >
              <div className="min-w-0">
                <p className="text-xs text-slate-500">
                  Siguiente
                </p>
                <p className="truncate text-sm font-medium text-slate-200">
                  {nextLesson.title}
                </p>
              </div>

              <ArrowRight className="h-5 w-5 shrink-0 text-orange-400" />
            </Link>
          ) : (
            <div className="flex min-h-20 items-center justify-center rounded-xl border border-white/10 bg-[#141b35] px-4 py-3 text-center">
              <div>
                <p className="text-xs text-orange-400">
                  Curso completado
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Llegaste a la última lección.
                </p>
              </div>
            </div>
          )}
        </nav>

        <p className="text-sm text-slate-500">
          El seguimiento de progreso y las evaluaciones se incorporarán en una
          etapa posterior.
        </p>
      </div>
    </main>
  );
}