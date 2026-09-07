"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { loginAction } from "@/app/auth/login/actions";
import { INITIAL_ACTION_STATE, fieldError } from "@/lib/action-state";
import { Alert } from "@/components/ui/Alert";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="
        mt-2 flex h-12 w-full items-center justify-center rounded-xl
        bg-gradient-to-r from-orange-500 via-rose-500 to-purple-500
        font-semibold text-white
        shadow-lg shadow-purple-950/30
        transition
        hover:brightness-110
        disabled:cursor-not-allowed disabled:opacity-60
      "
    >
      {pending ? "Iniciando sesión..." : "Iniciar sesión"}
    </button>
  );
}

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction] = useActionState(
    loginAction,
    INITIAL_ACTION_STATE
  );

  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input
        type="hidden"
        name="redirectTo"
        value={redirectTo ?? "/dashboard"}
      />

      {state.status === "error" && state.message && (
        <Alert variant="error">{state.message}</Alert>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Correo electrónico
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          required
          className="
            h-12 w-full rounded-xl
            border border-white/10
            bg-white/5
            px-4 text-sm text-white
            placeholder:text-slate-500
            outline-none
            transition
            focus:border-purple-500
            focus:ring-2 focus:ring-purple-500/20
          "
        />

        {fieldError(state.fieldErrors, "email") && (
          <p className="mt-1 text-xs text-red-400">
            {fieldError(state.fieldErrors, "email")}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Contraseña
        </label>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="
              h-12 w-full rounded-xl
              border border-white/10
              bg-white/5
              px-4 pr-12 text-sm text-white
              outline-none
              transition
              focus:border-purple-500
              focus:ring-2 focus:ring-purple-500/20
            "
          />

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="
              absolute right-4 top-1/2
              -translate-y-1/2
              text-slate-500
              transition hover:text-slate-300
            "
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {fieldError(state.fieldErrors, "password") && (
          <p className="mt-1 text-xs text-red-400">
            {fieldError(state.fieldErrors, "password")}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-400">
          <input
            type="checkbox"
            name="remember"
            className="
              h-4 w-4 rounded
              border-white/20
              bg-white/5
            "
          />
          Recordarme
        </label>

        <Link
          href="/auth/forgot-password"
          className="font-medium text-orange-400 transition hover:text-orange-300"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <SubmitButton />

      <div className="flex items-center gap-4 py-2">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-slate-500">
          o continúa con
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <button
        type="button"
        className="
          flex h-11 w-full items-center justify-center gap-3
          rounded-xl border border-white/10
          bg-white/5
          text-sm text-slate-300
          transition
          hover:bg-white/10
        "
      >
        <span className="text-lg font-bold">
          <span className="text-blue-400">G</span>
        </span>
        Continuar con Google
      </button>

      <p className="pt-2 text-center text-sm text-slate-500">
        ¿No tienes cuenta?{" "}
        <Link
          href="/auth/register"
          className="font-semibold text-orange-400 hover:text-orange-300"
        >
          Regístrate
        </Link>
      </p>
    </form>
  );
}