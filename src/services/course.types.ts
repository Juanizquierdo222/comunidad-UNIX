export type CourseLevel = "principiante" | "intermedio" | "avanzado";

export type CatalogCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  level: CourseLevel;
  estimated_minutes: number | null;
  lessons: number;
};

export function formatDuration(minutes: number | null): string {
  if (minutes == null) return "Duración por definir";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

export function formatLevel(level: CourseLevel): string {
  return { principiante: "Principiante", intermedio: "Intermedio", avanzado: "Avanzado" }[level];
}
