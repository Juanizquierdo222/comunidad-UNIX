import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Terminal,
} from "lucide-react";

type Lesson = {
  title: string;
  description: string;
};

type Course = {
  title: string;
  category: string;
  level: string;
  duration: string;
  description: string;
  objectives: string[];
  lessons: Lesson[];
};

const courses: Record<string, Course> = {
  "linux-desde-cero": {
    title: "Linux desde cero",
    category: "Fundamentos",
    level: "Principiante",
    duration: "6 horas",
    description:
      "Conoce qué es Linux, sus distribuciones y aprende a utilizar tu primer entorno de trabajo.",
    objectives: [
      "Comprender qué es Linux y el software libre.",
      "Identificar las principales distribuciones.",
      "Conocer el sistema de archivos de Linux.",
      "Utilizar los primeros comandos de la terminal.",
    ],
    lessons: [
      { title: "¿Qué es Linux?", description: "Historia, características y software libre." },
      { title: "Distribuciones Linux", description: "Ubuntu, Debian, Fedora y otras distribuciones." },
      { title: "Instalación y entorno", description: "Opciones para instalar y probar Linux." },
      { title: "Conociendo el escritorio", description: "Interfaz gráfica y herramientas principales." },
      { title: "Introducción a la terminal", description: "Qué es la shell y cómo utilizarla." },
      { title: "Sistema de archivos", description: "Directorios y estructura básica." },
      { title: "Primeros comandos", description: "pwd, ls, cd y comandos esenciales." },
      { title: "Práctica final", description: "Repaso de los conocimientos adquiridos." },
    ],
  },
  "comandos-esenciales": {
    title: "Comandos esenciales",
    category: "Terminal",
    level: "Principiante",
    duration: "8 horas",
    description:
      "Aprende a navegar por directorios, administrar archivos y trabajar con permisos desde la terminal.",
    objectives: [
      "Navegar por el sistema de archivos.",
      "Crear, copiar, mover y eliminar archivos.",
      "Comprender los permisos de Linux.",
      "Utilizar herramientas básicas de búsqueda y procesos.",
    ],
    lessons: [
      { title: "Navegación", description: "pwd, ls y cd." },
      { title: "Archivos y directorios", description: "mkdir, touch y cat." },
      { title: "Copiar y mover", description: "cp y mv." },
      { title: "Eliminar archivos", description: "rm y rmdir con buenas prácticas." },
      { title: "Visualización de contenido", description: "less, head y tail." },
      { title: "Búsqueda", description: "find y grep." },
      { title: "Permisos", description: "chmod, chown y grupos." },
      { title: "Procesos", description: "ps, top y kill." },
      { title: "Redirecciones", description: "Operadores de entrada y salida." },
      { title: "Tuberías", description: "Combinación de comandos." },
      { title: "Ayuda y documentación", description: "man y --help." },
      { title: "Práctica integradora", description: "Ejercicios de terminal." },
    ],
  },
  "administracion-servidores": {
    title: "Administración de servidores Linux",
    category: "Servidores",
    level: "Intermedio",
    duration: "12 horas",
    description:
      "Descubre cómo gestionar usuarios, servicios, procesos y configuraciones básicas de un servidor.",
    objectives: [
      "Comprender los componentes de un servidor Linux.",
      "Administrar usuarios y grupos.",
      "Gestionar servicios y procesos.",
      "Aplicar tareas básicas de mantenimiento.",
    ],
    lessons: [
      { title: "Introducción a servidores", description: "Conceptos y arquitectura." },
      { title: "Instalación de Linux Server", description: "Preparación del entorno." },
      { title: "Usuarios y grupos", description: "Administración de cuentas." },
      { title: "Permisos y sudo", description: "Privilegios y acceso." },
      { title: "Gestión de paquetes", description: "Instalación y actualización." },
      { title: "Servicios con systemd", description: "Administración de servicios." },
      { title: "Procesos y recursos", description: "Monitoreo básico." },
      { title: "Almacenamiento", description: "Discos y sistemas de archivos." },
      { title: "Registros del sistema", description: "Consulta de logs." },
      { title: "Copias de seguridad", description: "Fundamentos de respaldo." },
    ],
  },
  "bash-scripting": {
    title: "Automatización con Bash",
    category: "Programación",
    level: "Intermedio",
    duration: "10 horas",
    description:
      "Crea scripts para automatizar tareas repetitivas y comprender los fundamentos de shell scripting.",
    objectives: [
      "Crear y ejecutar scripts Bash.",
      "Utilizar variables, condiciones y ciclos.",
      "Trabajar con argumentos y funciones.",
      "Automatizar tareas básicas del sistema.",
    ],
    lessons: [
      { title: "Introducción a Bash", description: "Scripts y ejecución." },
      { title: "Variables", description: "Datos y expansión." },
      { title: "Entrada y salida", description: "Lectura e impresión." },
      { title: "Condicionales", description: "if, elif y else." },
      { title: "Ciclos", description: "for y while." },
      { title: "Funciones", description: "Organización del código." },
      { title: "Argumentos", description: "Parámetros de scripts." },
      { title: "Manejo de errores", description: "Códigos de salida." },
      { title: "Automatización", description: "Tareas programadas." },
    ],
  },
  "seguridad-linux": {
    title: "Seguridad básica en Linux",
    category: "Seguridad",
    level: "Intermedio",
    duration: "8 horas",
    description:
      "Aprende buenas prácticas de permisos, usuarios, actualizaciones y protección del sistema.",
    objectives: [
      "Comprender los principios de seguridad del sistema.",
      "Administrar permisos y privilegios.",
      "Aplicar actualizaciones y configuraciones seguras.",
      "Reconocer prácticas básicas de protección.",
    ],
    lessons: [
      { title: "Fundamentos de seguridad", description: "Principios y amenazas." },
      { title: "Usuarios y privilegios", description: "Control de acceso." },
      { title: "Permisos avanzados", description: "Protección de archivos." },
      { title: "Actualizaciones", description: "Mantenimiento seguro." },
      { title: "Seguridad en SSH", description: "Acceso remoto seguro." },
      { title: "Firewall básico", description: "Control de conexiones." },
      { title: "Logs y auditoría", description: "Revisión de eventos." },
    ],
  },
  "redes-linux": {
    title: "Redes en Linux",
    category: "Redes",
    level: "Avanzado",
    duration: "14 horas",
    description:
      "Explora direcciones IP, conectividad, herramientas de diagnóstico y servicios de red.",
    objectives: [
      "Comprender la configuración de red en Linux.",
      "Utilizar herramientas de diagnóstico.",
      "Analizar rutas y conectividad.",
      "Conocer los principales servicios de red.",
    ],
    lessons: [
      { title: "Fundamentos de redes", description: "TCP/IP y conceptos básicos." },
      { title: "Interfaces de red", description: "Identificación y configuración." },
      { title: "Direcciones IP", description: "IPv4, máscaras y puertas de enlace." },
      { title: "Rutas", description: "Tablas de enrutamiento." },
      { title: "Diagnóstico", description: "ping, traceroute y herramientas." },
      { title: "DNS", description: "Resolución de nombres." },
      { title: "SSH", description: "Administración remota." },
      { title: "Servicios de red", description: "Introducción a servicios comunes." },
      { title: "Firewall", description: "Fundamentos de filtrado." },
      { title: "Monitoreo", description: "Herramientas de observación." },
      { title: "Práctica final", description: "Diagnóstico de una red de ejemplo." },
    ],
  },
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = courses[id];

  if (!course) notFound();

  return (
    <div className="min-h-screen bg-[#0b1026] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link
          href="/dashboard/courses"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1d2854] to-[#262044] p-6 sm:p-10">
          <span className="inline-flex rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-xs font-medium text-orange-300">
            {course.category}
          </span>

          <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
            {course.title}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            {course.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-5 text-sm text-slate-300">
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-orange-400" />
              {course.lessons.length} lecciones
            </span>
            <span className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-orange-400" />
              {course.duration}
            </span>
            <span className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-orange-400" />
              {course.level}
            </span>
          </div>

          <div className="mt-7 rounded-xl border border-white/10 bg-black/10 p-4">
            <p className="text-sm font-medium text-orange-300">
              Curso en preparación
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Este temario es una propuesta de ejemplo. Las lecciones y las
              inscripciones estarán disponibles cuando el contenido oficial
              sea publicado por la comunidad.
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-white/10 bg-[#141b35] p-6">
              <h2 className="text-xl font-bold">Lo que aprenderás</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {course.objectives.map((objective) => (
                  <div key={objective} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    <p className="text-sm leading-6 text-slate-300">
                      {objective}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#141b35] p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold">Temario del curso</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Contenido propuesto para esta ruta de aprendizaje.
                </p>
              </div>

              <div className="space-y-3">
                {course.lessons.map((lesson, index) => (
                  <div
                    key={lesson.title}
                    className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-sm font-semibold text-slate-400">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-slate-200">
                        {lesson.title}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {lesson.description}
                      </p>
                    </div>

                    <LockKeyhole className="mt-2 h-4 w-4 shrink-0 text-slate-600" />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-[#141b35] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
                <BookOpen className="h-6 w-6 text-orange-400" />
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                Información del curso
              </h2>

              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Nivel</dt>
                  <dd className="text-right text-slate-200">{course.level}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Duración estimada</dt>
                  <dd className="text-right text-slate-200">{course.duration}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Lecciones</dt>
                  <dd className="text-slate-200">{course.lessons.length}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Modalidad</dt>
                  <dd className="text-slate-200">Por definir</dd>
                </div>
              </dl>

              <button
                type="button"
                disabled
                className="mt-6 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-500"
              >
                Inscripciones próximamente
              </button>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">
              <Terminal className="h-6 w-6 text-purple-400" />
              <h3 className="mt-4 font-semibold">Aprende con la comunidad</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Los cursos oficiales serán impartidos por instructores y
                expositores de Comunidad UNIX ITC.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}