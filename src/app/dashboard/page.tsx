import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Code2,
  GraduationCap,
  MessageCircle,
  
  Plus,
  Terminal,
  Trophy,
  Users,
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getFullProfile } from "@/services/profile.service";

const roleNames: Record<string, string> = {
  alumno: "Alumno",
  externo: "Miembro externo",
  instructor: "Instructor",
  expositor: "Expositor",
  admin: "Administrador",
};

function StatCard({
  icon: Icon,
  title,
  value,
  description,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  description: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#141b35] p-5">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const fullProfile = await getFullProfile(supabase, user.id);

  if (!fullProfile) redirect("/auth/login");

  const { profile } = fullProfile;
  const firstName = profile.full_name.split(" ")[0];
  const role = profile.role;
  const isTeacher = role === "instructor" || role === "expositor";
  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen bg-[#0b1026] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Bienvenida */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
              Comunidad UNIX ITC
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Hola, {firstName}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {isTeacher
                ? "Comparte tu conocimiento y acompaña a la comunidad."
                : isAdmin
                  ? "Gestiona las actividades y el crecimiento de la comunidad."
                  : "Continúa aprendiendo y descubre lo que está pasando en la comunidad."}
            </p>
          </div>

          <Link
            href="/dashboard/profile"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            Mi perfil
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Banner principal */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#1d2854] via-[#252452] to-[#3b2454] p-6 sm:p-8">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-xs font-medium text-orange-300">
              <Terminal className="h-3.5 w-3.5" />
              Tu espacio para aprender
            </span>
            <h2 className="mt-5 text-2xl font-bold leading-tight sm:text-3xl">
              Explora, aprende y comparte el mundo de Linux.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Descubre recursos, participa en talleres y conecta con personas
              que comparten tu interés por Linux, Unix y el software libre.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="#cursos"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Explorar cursos
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#eventos"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Ver eventos
              </Link>
            </div>
          </div>
          <Terminal className="pointer-events-none absolute -bottom-10 -right-8 h-64 w-64 rotate-[-12deg] text-white/[0.04]" />
        </section>

        {/* Indicadores */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={BookOpen}
            title={isTeacher ? "Mis contenidos" : "Mis cursos"}
            value="0"
            description="Disponible próximamente"
            color="bg-orange-500/10 text-orange-400"
          />
          <StatCard
            icon={CalendarDays}
            title="Próximos eventos"
            value="0"
            description="Actividades por publicar"
            color="bg-purple-500/10 text-purple-400"
          />
          <StatCard
            icon={Trophy}
            title="Retos completados"
            value="0"
            description="Comienza tu aprendizaje"
            color="bg-emerald-500/10 text-emerald-400"
          />
          <StatCard
            icon={Users}
            title="Tu comunidad"
            value={roleNames[role] ?? role}
            description="Tu rol actual"
            color="bg-blue-500/10 text-blue-400"
          />
        </div>

        {/* Cursos */}
        <section id="cursos" className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Comienza a aprender</h2>
              <p className="mt-1 text-sm text-slate-400">
                Rutas de aprendizaje que estamos preparando para ti.
              </p>
            </div>
            <span className="text-xs font-medium text-orange-400">
              Próximamente
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              {
                title: "Linux desde cero",
                category: "Fundamentos",
                description: "Conoce el sistema operativo, sus distribuciones y los primeros pasos en la terminal.",
                icon: Terminal,
                color: "from-orange-500/20 to-amber-500/5",
                level: "Principiante",
              },
              {
                title: "Comandos esenciales",
                category: "Terminal",
                description: "Aprende a navegar, administrar archivos y trabajar con permisos desde la consola.",
                icon: Code2,
                color: "from-purple-500/20 to-indigo-500/5",
                level: "Principiante",
              },
              {
                title: "Introducción a servidores",
                category: "Administración",
                description: "Descubre los conceptos básicos de servicios, usuarios y administración de Linux.",
                icon: GraduationCap,
                color: "from-blue-500/20 to-cyan-500/5",
                level: "Intermedio",
              },
            ].map((course) => (
              <article
                key={course.title}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#141b35]"
              >
                <div className={`flex h-32 items-center justify-center bg-gradient-to-br ${course.color}`}>
                  <course.icon className="h-14 w-14 text-white/70" />
                </div>
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-orange-400">
                      {course.category}
                    </span>
                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-slate-400">
                      {course.level}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{course.title}</h3>
                  <p className="mt-2 min-h-[60px] text-sm leading-5 text-slate-400">
                    {course.description}
                  </p>
                  <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-slate-500">
                    <Clock3 className="h-4 w-4" />
                    Contenido en preparación
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Eventos y reto */}
        <div className="grid gap-6 lg:grid-cols-5">
          <section id="eventos" className="space-y-4 lg:col-span-3">
            <div>
              <h2 className="text-xl font-bold">Próximos eventos</h2>
              <p className="mt-1 text-sm text-slate-400">
                Talleres, charlas y actividades de la comunidad.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#141b35] p-5">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-orange-400">
                    En preparación
                  </span>
                  <h3 className="mt-1 font-semibold">Taller de instalación de Linux</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Aprende a instalar una distribución Linux y configurar tu primer entorno de trabajo.
                  </p>
                  <p className="mt-3 text-xs text-slate-500">
                    Fecha y horario por confirmar
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center">
              <CalendarDays className="mx-auto h-7 w-7 text-slate-500" />
              <p className="mt-3 text-sm font-medium text-slate-300">
                Más actividades próximamente
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Aquí aparecerán los eventos oficiales de la comunidad.
              </p>
            </div>
          </section>

          <section className="space-y-4 lg:col-span-2">
            <div>
              <h2 className="text-xl font-bold">Reto de la semana</h2>
              <p className="mt-1 text-sm text-slate-400">
                Pon a prueba tus conocimientos.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#141b35] p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <Terminal className="h-6 w-6" />
              </div>
              <span className="mt-5 inline-block text-xs font-medium text-purple-400">
                Reto de ejemplo
              </span>
              <h3 className="mt-2 text-lg font-semibold">
                Tu primer comando
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                ¿Sabes cómo mostrar la ruta del directorio en el que te encuentras?
              </p>
              <div className="mt-4 rounded-xl border border-white/5 bg-[#090e20] p-4 font-mono text-sm text-emerald-400">
                $ pwd
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Próximamente podrás resolver retos y registrar tu progreso.
              </p>
            </div>
          </section>
        </div>

        {/* Acciones para creadores */}
        {(isTeacher || isAdmin) && (
          <section className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <Plus className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold">
                  {isAdmin ? "Administración de la comunidad" : "Comparte tu conocimiento"}
                </h2>
                <p className="mt-2 max-w-xl text-sm text-slate-400">
                  {isAdmin
                    ? "Próximamente podrás gestionar usuarios, aprobar contenidos y organizar actividades."
                    : "Estamos preparando las herramientas para crear cursos, proponer ponencias y administrar tus actividades."}
                </p>
              </div>
              <span className="self-start rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-300">
                Próximamente
              </span>
            </div>
          </section>
        )}

        {/* Comunidad */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#141b35] p-6">
            <MessageCircle className="h-7 w-7 text-orange-400" />
            <h3 className="mt-4 text-lg font-semibold">Comunidad y foro</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Un espacio para compartir dudas, soluciones, proyectos y experiencias con otros miembros.
            </p>
            <p className="mt-4 text-xs font-medium text-orange-400">
              Próximamente
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141b35] p-6">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            <h3 className="mt-4 text-lg font-semibold">Tu camino en Linux</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Aprende a tu ritmo y, más adelante, consulta tus cursos, retos y actividades completadas.
            </p>
            <p className="mt-4 text-xs font-medium text-emerald-400">
              Próximamente
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}