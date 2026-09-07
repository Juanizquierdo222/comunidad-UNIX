import Link from "next/link";
import { GraduationCap, Presentation, Users, Mic2, ArrowRight } from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

const ROLES = [
  {
    icon: GraduationCap,
    title: "Alumnos",
    description: "Regístrate con tu número de control y tu institución de procedencia.",
  },
  {
    icon: Presentation,
    title: "Instructores",
    description: "Registra tu departamento, especialidad y grado académico.",
  },
  {
    icon: Users,
    title: "Externos",
    description: "Participa sin pertenecer al instituto. Recibe un código de acreditación único.",
  },
  {
    icon: Mic2,
    title: "Expositores",
    description: "Comparte tu semblanza, organización y enlaces profesionales.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />

      <main id="main-content" className="flex-1">
        <section className="border-b border-surface-200 bg-gradient-to-b from-white to-surface-50">
          <div className="container-app flex flex-col items-center gap-6 py-20 text-center sm:py-28">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-600/20">
              Registro y acreditación en línea
            </span>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl">
              Un registro claro para cada tipo de participante
            </h1>
            <p className="max-w-2xl text-lg text-surface-600">
              Alumnos, Instructores, Externos y Expositores completan un formulario adaptado a su perfil,
              con validaciones claras y confirmación inmediata.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Crear mi cuenta
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container-app py-16 sm:py-20" aria-labelledby="roles-heading">
          <h2 id="roles-heading" className="text-center text-2xl font-semibold text-surface-900 sm:text-3xl">
            Un formulario para cada rol
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-surface-600">
            El sistema adapta automáticamente los campos requeridos según el tipo de participante.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="h-full">
                <CardBody className="flex h-full flex-col gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-semibold text-surface-900">{title}</h3>
                  <p className="text-sm text-surface-600">{description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
