import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

/**
 * Cliente administrativo con SUPABASE_SERVICE_ROLE_KEY.
 *
 * ⚠️ El paquete `server-only` provoca un ERROR DE BUILD si este archivo
 * se importa accidentalmente desde un Client Component, evitando que la
 * service role key termine en el bundle del navegador.
 *
 * Úsalo SOLO para tareas administrativas puntuales que deban saltarse
 * RLS (ej. tareas de mantenimiento ejecutadas por un admin verificado).
 * Para el flujo normal de la app, usa siempre el cliente server.ts (anon
 * key + RLS), que es más seguro por defecto.
 */
export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no está configurada. Este cliente solo debe usarse en el servidor."
    );
  }

  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
