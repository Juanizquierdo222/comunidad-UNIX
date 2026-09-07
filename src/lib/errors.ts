/**
 * Traduce errores técnicos (Postgres/Supabase) a mensajes seguros y
 * comprensibles para el usuario final. Nunca se debe reenviar
 * `error.message` crudo de Postgres al cliente: puede filtrar detalles
 * de esquema o de la consulta.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

const PG_UNIQUE_VIOLATION = "23505";
const PG_CHECK_VIOLATION = "23514";
const PG_FOREIGN_KEY_VIOLATION = "23503";
const PG_NOT_NULL_VIOLATION = "23502";

interface PostgresLikeError {
  code?: string;
  message?: string;
  details?: string;
}

export function toFriendlyErrorMessage(error: unknown): string {
  const pgError = error as PostgresLikeError;

  if (pgError?.code === PG_UNIQUE_VIOLATION) {
    return "Ese registro ya existe (por ejemplo, el número de control o correo ya está en uso).";
  }

  if (pgError?.code === PG_CHECK_VIOLATION) {
    return "Alguno de los datos ingresados no cumple con el formato requerido.";
  }

  if (pgError?.code === PG_FOREIGN_KEY_VIOLATION) {
    return "No fue posible completar la operación por una referencia inválida.";
  }

  if (pgError?.code === PG_NOT_NULL_VIOLATION) {
    return "Falta completar un campo obligatorio.";
  }

  if (pgError?.message?.toLowerCase().includes("invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }

  if (pgError?.message?.toLowerCase().includes("email not confirmed")) {
    return "Debes confirmar tu correo electrónico antes de iniciar sesión.";
  }

  if (pgError?.message?.toLowerCase().includes("user already registered")) {
    return "Ya existe una cuenta con ese correo electrónico.";
  }

  if (pgError?.message?.toLowerCase().includes("no tienes permiso")) {
    return "No tienes permiso para realizar esta acción.";
  }

  // Nunca reenviar el mensaje crudo: registrar en servidor y responder
  // algo genérico y accionable.
  if (process.env.NODE_ENV !== "production") {
    console.error("[toFriendlyErrorMessage] Error no mapeado:", error);
  }

  return "Ocurrió un problema al procesar tu solicitud. Intenta nuevamente en unos minutos.";
}
