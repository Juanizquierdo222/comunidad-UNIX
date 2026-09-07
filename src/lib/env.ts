import { z } from "zod";

/**
 * Valida las variables de entorno públicas al arrancar la app.
 * Si falta alguna, falla rápido con un mensaje claro en vez de errores
 * crípticos de "fetch failed" más adelante.
 *
 * IMPORTANTE: SUPABASE_SERVICE_ROLE_KEY se valida por separado
 * (ver lib/supabase/admin.ts) y NUNCA se importa desde código de cliente.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({ message: "NEXT_PUBLIC_SUPABASE_URL debe ser una URL válida" }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20, "NEXT_PUBLIC_SUPABASE_ANON_KEY parece inválida"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!parsed.success) {
  console.error("❌ Variables de entorno públicas inválidas o faltantes:", parsed.error.flatten().fieldErrors);
  throw new Error(
    "Configuración incompleta: revisa tu archivo .env.local contra .env.example (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)."
  );
}

export const env = parsed.data;
