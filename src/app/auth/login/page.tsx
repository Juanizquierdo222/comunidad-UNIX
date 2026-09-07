import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";
import { Alert } from "@/components/ui/Alert";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta para continuar.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#0b1026] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-8 sm:justify-center">

        <div className="mb-10">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-white"
          >
            Comunidad
          </Link>
        </div>

        <section>
          <div className="mb-8">
            <h1 className="text-3xl font-bold leading-tight text-white">
              Bienvenido a Comunidad Unix ITC
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              Inicia sesión para continuar aprendiendo.
            </p>
          </div>

          <div className="mb-7 grid grid-cols-2 rounded-xl bg-white/5 p-1">
            <div className="rounded-lg bg-gradient-to-r from-orange-500/30 to-purple-500/40 px-4 py-3 text-center text-sm font-semibold text-white">
              Iniciar sesión
            </div>

            <Link
              href="/auth/register"
              className="rounded-lg px-4 py-3 text-center text-sm font-medium text-slate-400 transition hover:text-white"
            >
              Registrarse
            </Link>
          </div>

          {params.error === "auth_callback_failed" && (
            <div className="mb-4">
              <Alert variant="error">
                El enlace expiró o ya fue utilizado. Intenta nuevamente.
              </Alert>
            </div>
          )}

          <LoginForm redirectTo={params.redirectTo} />
        </section>
      </div>
    </main>
  );
}