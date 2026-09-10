import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AuthShell } from "@/components/auth/AuthShell";
import { OnboardingForm } from "@/components/forms/OnboardingForm";
import type { UserRoleInput } from "@/validations/common";

export const metadata: Metadata = {
  title: "Completa tu registro",
  robots: { index: false, follow: false },
};

const ONBOARDING_ROLES: UserRoleInput[] = [
  "alumno",
  "instructor",
  "externo",
  "expositor",
];

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/auth/login");
  }

  if (profile.onboarding_completed) {
    redirect("/dashboard");
  }

  if (!ONBOARDING_ROLES.includes(profile.role as UserRoleInput)) {
    // Rol administrativo u otro caso especial.
    redirect("/dashboard");
  }

  const metadataRole = user.user_metadata?.role as
    | UserRoleInput
    | undefined;

  const canChooseRole =
    !metadataRole || !ONBOARDING_ROLES.includes(metadataRole);

  return (
    <AuthShell
      title="Completa tu registro"
      description={
        canChooseRole
          ? "Selecciona tu tipo de usuario y completa los datos de tu perfil."
          : `Confirmamos tu correo. Ahora completa los datos de tu perfil de ${profile.role}.`
      }
    >
      <OnboardingForm
        role={profile.role as UserRoleInput}
        fullName={profile.full_name}
        canChooseRole={canChooseRole}
      />
    </AuthShell>
  );
}