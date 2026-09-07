"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Code2,
  Filter,
  Search,
  Server,
  Shield,
  Terminal,
  Users,
  X,
} from "lucide-react";

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  level: "Principiante" | "Intermedio" | "Avanzado";
  duration: string;
  lessons: number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
};

const courses: Course[] = [
  {
    id: "linux-desde-cero",
    title: "Linux desde cero",
    description:
      "Conoce qué es Linux, sus distribuciones y aprende a utilizar tu primer entorno de trabajo.",
    category: "Fundamentos",
    level: "Principiante",
    duration: "6 horas",
    lessons: 8,
    icon: Terminal,
    gradient: "from-orange-500/25 to-amber-500/5",
  },
  {
    id: "comandos-esenciales",
    title: "Comandos esenciales",
    description:
      "Aprende a navegar por directorios, administrar archivos y trabajar con permisos desde la terminal.",
    category: "Terminal",
    level: "Principiante",
    duration: "8 horas",
    lessons: 12,
    icon: Code2,
    gradient: "from-purple-500/25 to-indigo-500/5",
  },
  {
    id: "administracion-servidores",
    title: "Administración de servidores Linux",
    description:
      "Descubre cómo gestionar usuarios, servicios, procesos y configuraciones básicas de un servidor.",
    category: "Servidores",
    level: "Intermedio",
    duration: "12 horas",
    lessons: 10,
    icon: Server,
    gradient: "from-blue-500/25 to-cyan-500/5",
  },
  {
    id: "bash-scripting",
    title: "Automatización con Bash",
    description:
      "Crea scripts para automatizar tareas repetitivas y comprender los fundamentos de shell scripting.",
    category: "Programación",
    level: "Intermedio",
    duration: "10 horas",
    lessons: 9,
    icon: Code2,
    gradient: "from-emerald-500/25 to-teal-500/5",
  },
  {
    id: "seguridad-linux",
    title: "Seguridad básica en Linux",
    description:
      "Aprende buenas prácticas de permisos, usuarios, actualizaciones y protección del sistema.",
    category: "Seguridad",
    level: "Intermedio",
    duration: "8 horas",
    lessons: 7,
    icon: Shield,
    gradient: "from-rose-500/25 to-orange-500/5",
  },
  {
    id: "redes-linux",
    title: "Redes en Linux",
    description:
      "Explora direcciones IP, conectividad, herramientas de diagnóstico y servicios de red.",
    category: "Redes",
    level: "Avanzado",
    duration: "14 horas",
    lessons: 11,
    icon: Server,
    gradient: "from-sky-500/25 to-violet-500/5",
  },
];

const categories = [
  "Todas",
  "Fundamentos",
  "Terminal",
  "Servidores",
  "Programación",
  "Seguridad",
  "Redes",
];

const levels = ["Todos", "Principiante", "Intermedio", "Avanzado"];

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [level, setLevel] = useState("Todos");

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query);

      const matchesCategory =
        category === "Todas" || course.category === category;

      const matchesLevel =
        level === "Todos" || course.level === level;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [search, category, level]);

  function clearFilters() {
    setSearch("");
    setCategory("Todas");
    setLevel("Todos");
  }

  return (
    <div className="min-h-screen bg-[#0b1026] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Encabezado */}
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            Inicio
          </Link>
          <span className="mx-2 text-slate-600">/</span>
          <span className="text-sm text-orange-400">Cursos</span>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
              Aprende a tu ritmo
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Explora nuestros cursos
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Descubre rutas de aprendizaje sobre Linux, Unix y tecnologías
              relacionadas. Desde tus primeros comandos hasta la administración
              de servidores.
            </p>
          </div>
        </div>

        {/* Aviso de contenido de ejemplo */}
        <div className="flex items-start gap-3 rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-orange-400" />
          <div>
            <p className="text-sm font-medium text-orange-200">
              Catálogo en preparación
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Estos cursos son ejemplos del contenido que podrá ofrecer la
              comunidad. Las inscripciones y lecciones estarán disponibles
              cuando los instructores publiquen los cursos oficiales.
            </p>
          </div>
        </div>

        {/* Buscador y filtros */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar cursos, temas o tecnologías..."
                aria-label="Buscar cursos"
                className="h-12 w-full rounded-xl border border-white/10 bg-[#141b35] pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10"
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                aria-label="Filtrar por nivel"
                className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-[#141b35] pl-11 pr-10 text-sm text-slate-300 outline-none focus:border-orange-500/50 lg:w-48"
              >
                {levels.map((item) => (
                  <option key={item} value={item}>
                    {item === "Todos" ? "Todos los niveles" : item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                  category === item
                    ? "bg-gradient-to-r from-orange-500 to-purple-600 text-white"
                    : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Resultados */}
        <section className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Catálogo</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredCourses.length}{" "}
                {filteredCourses.length === 1 ? "curso" : "cursos"} de ejemplo
              </p>
            </div>

            {(search || category !== "Todas" || level !== "Todos") && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </button>
            )}
          </div>

          {filteredCourses.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => {
                const Icon = course.icon;

                return (
                  <article
                    key={course.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141b35] transition hover:border-white/20"
                  >
                    <div
                      className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${course.gradient}`}
                    >
                      <Icon className="h-16 w-16 text-white/70" />

                      <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-[#0b1026]/70 px-3 py-1 text-[10px] font-medium text-slate-200">
                        Próximamente
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-orange-400">
                          {course.category}
                        </span>
                        <span className="text-slate-700">•</span>
                        <span className="text-xs text-slate-500">
                          {course.level}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold leading-snug text-white">
                        {course.title}
                      </h3>

                      <p className="mt-3 flex-1 text-sm leading-6 text-slate-400">
                        {course.description}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-white/10 pt-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Clock3 className="h-4 w-4" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4" />
                          {course.lessons} lecciones
                        </span>
                      </div>

                      <Link
                        href={`/dashboard/courses/${course.id}`}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                      >
                        Ver temario
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#141b35] px-6 py-16 text-center">
              <Search className="mx-auto h-10 w-10 text-slate-600" />
              <h3 className="mt-4 text-lg font-semibold">
                No encontramos cursos
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Intenta con otra búsqueda o cambia los filtros.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Mostrar todos
              </button>
            </div>
          )}
        </section>

        {/* Comunidad */}
        <section className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#1d2854] to-[#27234d] p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-orange-400">
                <Users className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Aprendemos juntos
                </span>
              </div>
              <h2 className="text-xl font-bold">
                El conocimiento crece cuando se comparte.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Muy pronto podrás aprender con instructores, expositores y
                otros miembros de Comunidad UNIX ITC.
              </p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/5">
              <Terminal className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}