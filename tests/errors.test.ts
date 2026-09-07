import { describe, expect, it } from "vitest";
import { toFriendlyErrorMessage } from "@/lib/errors";

describe("toFriendlyErrorMessage", () => {
  it("traduce violación de unicidad de Postgres", () => {
    expect(toFriendlyErrorMessage({ code: "23505" })).toMatch(/ya existe/i);
  });

  it("traduce violación de check constraint", () => {
    expect(toFriendlyErrorMessage({ code: "23514" })).toMatch(/formato requerido/i);
  });

  it("traduce credenciales inválidas de Supabase Auth", () => {
    expect(toFriendlyErrorMessage({ message: "Invalid login credentials" })).toMatch(/correo o contraseña/i);
  });

  it("nunca expone el mensaje técnico crudo para errores desconocidos", () => {
    const message = toFriendlyErrorMessage({ message: "relation \"public.secret_table\" does not exist" });
    expect(message).not.toContain("secret_table");
  });
});
