import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getFullProfile } from "@/services/profile.service";
import { DashboardShell } from "@/components/layout/DashboardShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const fullProfile = await getFullProfile(supabase, user.id);

  if (!fullProfile) {
    redirect("/auth/login");
  }

  if (!fullProfile.profile.onboarding_completed) {
    redirect("/onboarding");
  }

  return <DashboardShell profile={fullProfile.profile}>{children}</DashboardShell>;
}
