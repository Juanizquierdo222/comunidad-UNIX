import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BookOpen, Clock3, LockKeyhole, PlayCircle } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublishedCourse, getCourseOutline, getCourseAccess } from "@/services/course.service";
import { formatDuration, formatLevel } from "@/services/course.types";
import EnrollButton from "@/components/courses/EnrollButton";
import { getCourseDb } from "@/services/course.service";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const course = await getPublishedCourse(id);
  if (!course) notFound();

  // Consultamos el creador por separado para mantener la firma del servicio
  // de catálogo que ya utiliza el resto de la aplicación.
  const db = await getCourseDb();
  const { data: owner, error: ownerError } = await db
    .from("courses")
    .select("creator_id")
    .eq("id", course.id)
    .single();
  if (ownerError || !owner) throw new Error("No se pudo consultar el creador.");
  const creatorId = owner.creator_id as string;

  const [modules, access] = await Promise.all([
    getCourseOutline(course.id),
    getCourseAccess(course.id, user.id, creatorId),
  ]);
  const lessonCount = modules.reduce((total, module) => total + module.course_lessons.length, 0);
  const canOpen = access.isEnrolled || access.canManage;
  const firstLesson = [...modules].sort((a, b) => a.position - b.position)
    .flatMap(m => [...m.course_lessons].sort((a, b) => a.position - b.position))[0];

  return (
    <main className="min-h-screen bg-[#0b1026] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <Link href="/dashboard/courses" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver al catálogo
        </Link>
        <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1d2854] to-[#27234d] p-6 sm:p-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">
            {course.category} · {formatLevel(course.level)}
          </span>
          <h1 className="mt-3 text-3xl font-bold">{course.title}</h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-300">{course.description}</p>
          <div className="mt-6 flex flex-wrap gap-5 text-sm text-slate-300">
            <span className="flex items-center gap-2"><Clock3 className="h-4 w-4" />{formatDuration(course.estimated_minutes)}</span>
            <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" />{lessonCount} lecciones</span>
          </div>
        </section>
        <section className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Temario del curso</h2>
            {modules.length === 0 ? (
              <p className="rounded-xl border border-white/10 bg-[#141b35] p-5 text-slate-400">El temario aún no tiene módulos disponibles.</p>
            ) : modules.map((module, index) => (
              <section key={module.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#141b35]">
                <div className="border-b border-white/10 p-5">
                  <p className="text-xs font-semibold text-orange-400">Módulo {index + 1}</p>
                  <h3 className="mt-2 font-semibold">{module.title}</h3>
                  {module.description && <p className="mt-2 text-sm text-slate-400">{module.description}</p>}
                </div>
                <div className="divide-y divide-white/5">
                  {[...module.course_lessons].sort((a, b) => a.position - b.position).map((lesson, i) => {
                    const accessible = canOpen || lesson.is_preview;
                    const body = (
                      <>
                        <span className="text-slate-500">{i + 1}.</span>
                        <span className="flex-1 text-slate-300">{lesson.title}</span>
                        {lesson.estimated_minutes != null && <span className="text-xs text-slate-500">{formatDuration(lesson.estimated_minutes)}</span>}
                        {accessible ? <PlayCircle className="h-4 w-4 text-orange-400" /> : <LockKeyhole className="h-4 w-4 text-slate-500" />}
                      </>
                    );
                    return accessible ? (
                      <Link key={lesson.id} href={`/dashboard/courses/${course.slug}/lessons/${lesson.id}`}
                        className="flex items-center gap-3 px-5 py-4 text-sm hover:bg-white/5">{body}</Link>
                    ) : (
                      <div key={lesson.id} className="flex items-center gap-3 px-5 py-4 text-sm">{body}</div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
          <aside className="h-fit rounded-2xl border border-white/10 bg-[#141b35] p-5">
            <h2 className="font-semibold">Comienza a aprender</h2>
            {canOpen ? (
              <>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {access.isEnrolled ? "Ya estás inscrito. Puedes acceder al contenido del curso." : "Puedes consultar el contenido de este curso."}
                </p>
                {firstLesson && <Link href={`/dashboard/courses/${course.slug}/lessons/${firstLesson.id}`}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white">
                  <PlayCircle className="h-4 w-4" /> Comenzar a aprender
                </Link>}
              </>
            ) : access.canEnroll ? (
              <>
                <p className="my-4 text-sm leading-6 text-slate-400">Inscríbete para acceder a todas las lecciones de este curso.</p>
                <EnrollButton courseId={course.id} />
              </>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-400">
                La inscripción está disponible para alumnos y externos con el registro completo.
              </p>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
