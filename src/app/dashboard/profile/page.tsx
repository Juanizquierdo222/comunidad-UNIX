import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  GraduationCap,
  Hash,
  Mail,
  Phone,
  User,
} from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getFullProfile } from "@/services/profile.service";

const roleNames: Record<string, string> = {
  alumno: "Alumno",
  instructor: "Instructor",
  externo: "Miembro externo",
  expositor: "Expositor",
  admin: "Administrador",
};

const institutionNames: Record<string, string> = {
  ITC: "Instituto Tecnológico de Cancún",
  UT: "Universidad Tecnológica",
  UNICARIBE: "Universidad del Caribe",
  POLITECNICO: "Universidad Politécnica",
  OTRA: "Otra institución",
  SIN_INSTITUCION: "Sin institución",
};

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
          <Icon className="h-4 w-4 text-slate-400" />
        </div>

        <div className="min-w-0">
          <p className="text-xs text-slate-500">{label}</p>
          <p className="mt-1 break-words text-sm font-medium text-slate-200">
            {value || "No especificado"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const fullProfile = await getFullProfile(supabase, user.id);

  if (!fullProfile) {
    redirect("/dashboard");
  }

  const { profile, details } = fullProfile;

  const createdAt = profile.created_at
    ? new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(profile.created_at))
    : null;

  const institution =
    details && "institution_type" in details
      ? details.institution_type === "OTRA" &&
        "institution_other_name" in details
        ? details.institution_other_name || "Otra institución"
        : institutionNames[details.institution_type] ||
          details.institution_type
      : null;

  return (
    <div className="min-h-screen bg-[#0b1026] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Regresar */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al dashboard
        </Link>

        {/* Encabezado del perfil */}
        <section className="rounded-2xl border border-white/10 bg-[#141b35] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-2xl font-bold text-white sm:text-3xl">
                  {profile.full_name}
                </h1>

                <BadgeCheck className="h-5 w-5 shrink-0 text-blue-400" />
              </div>

              <p className="mt-1 text-sm text-slate-400">
                {roleNames[profile.role] ?? profile.role}
              </p>
            </div>

            <span className="inline-flex w-fit shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
              Perfil activo
            </span>
          </div>
        </section>

        {/* Contenido */}
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="space-y-4 lg:col-span-2">
            <div>
              <h2 className="text-lg font-semibold">
                Información personal
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Información asociada a tu cuenta en Comunidad UNIX ITC.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem
                icon={User}
                label="Nombre completo"
                value={profile.full_name}
              />

              <InfoItem
                icon={Mail}
                label="Correo electrónico"
                value={user.email}
              />

              <InfoItem
                icon={Phone}
                label="Teléfono"
                value={profile.phone}
              />

              <InfoItem
                icon={CalendarDays}
                label="Miembro desde"
                value={createdAt}
              />
            </div>

            {/* Información específica según rol */}
            {profile.role !== "admin" && details && (
              <>
                <div className="pt-4">
                  <h2 className="text-lg font-semibold">
                    Información de{" "}
                    {roleNames[profile.role] ?? profile.role}
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Datos correspondientes a tu tipo de usuario.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {"control_number" in details && (
                    <InfoItem
                      icon={Hash}
                      label="Número de control"
                      value={details.control_number}
                    />
                  )}

                  {"institution_type" in details && (
                    <InfoItem
                      icon={Building2}
                      label="Procedencia / Institución"
                      value={institution}
                    />
                  )}

                  {"department" in details && (
                    <InfoItem
                      icon={Building2}
                      label="Departamento / Academia"
                      value={details.department}
                    />
                  )}

                  {"specialty" in details && (
                    <InfoItem
                      icon={GraduationCap}
                      label="Especialidad"
                      value={details.specialty}
                    />
                  )}

                  {"academic_degree" in details && (
                    <InfoItem
                      icon={GraduationCap}
                      label="Grado académico"
                      value={
                        details.academic_degree === "OTRO" &&
                        "academic_degree_other" in details
                          ? details.academic_degree_other ||
                            details.academic_degree
                          : details.academic_degree
                      }
                    />
                  )}

                  {"organization" in details && (
                    <InfoItem
                      icon={Building2}
                      label="Organización"
                      value={details.organization}
                    />
                  )}
                </div>

                {"bio" in details && details.bio && (
                  <div className="rounded-2xl border border-white/10 bg-[#141b35] p-5">
                    <p className="text-xs text-slate-500">
                      Semblanza
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {details.bio}
                    </p>
                  </div>
                )}

                {"profile_link" in details &&
                  details.profile_link && (
                    <div className="rounded-2xl border border-white/10 bg-[#141b35] p-5">
                      <p className="text-xs text-slate-500">
                        Enlace de perfil
                      </p>

                      <p className="mt-2 break-all text-sm text-blue-400">
                        {details.profile_link}
                      </p>
                    </div>
                  )}
              </>
            )}
          </section>

          {/* Panel lateral */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#141b35] p-5">
              <h2 className="font-semibold">
                Tu cuenta
              </h2>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs text-slate-500">
                    Rol
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-200">
                    {roleNames[profile.role] ?? profile.role}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs text-slate-500">
                    Estado del registro
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-sm text-emerald-400">
                    <BadgeCheck className="h-4 w-4" />
                    Registro completado
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
              <h3 className="font-medium text-orange-300">
                Comunidad UNIX ITC
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Tu perfil identifica tu participación dentro de la
                comunidad y permite mostrarte contenido de acuerdo con
                tu rol.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}