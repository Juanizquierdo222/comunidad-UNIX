import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

/**
 * Cliente de Supabase para Server Components, Server Actions y Route
 * Handlers. Lee/escribe la sesión mediante cookies HTTP-only, gestionadas
 * por Supabase Auth (nunca localStorage). Usa la anon key + RLS: toda
 * lectura/escritura respeta las políticas de la base de datos.
 *
 * Nota (Next.js 15+/16): `cookies()` es asíncrona ("Dynamic APIs"), por
 * lo que esta función también lo es. Todos los call sites deben usar
 * `await createSupabaseServerClient()`.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // set() puede fallar si se llama desde un Server Component puro
          // (no una Server Action / Route Handler). El middleware se encarga
          // de refrescar la sesión en ese caso, así que es seguro ignorar.
        }
      },
    },
  });
}
