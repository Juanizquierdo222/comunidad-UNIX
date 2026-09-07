import { describe, expect, it } from "vitest";
import { loginSchema, resetPasswordSchema } from "@/validations/auth";
import { passwordSchema } from "@/validations/common";

describe("passwordSchema", () => {
  it("rechaza contraseñas sin mayúscula", () => {
    expect(passwordSchema.safeParse("segura123").success).toBe(false);
  });

  it("rechaza contraseñas sin número", () => {
    expect(passwordSchema.safeParse("SeguraAbc").success).toBe(false);
  });

  it("rechaza contraseñas demasiado cortas", () => {
    expect(passwordSchema.safeParse("Ab1").success).toBe(false);
  });

  it("acepta una contraseña válida", () => {
    expect(passwordSchema.safeParse("Segura123").success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("rechaza correos con formato inválido", () => {
    const result = loginSchema.safeParse({ email: "no-es-correo", password: "algo" });
    expect(result.success).toBe(false);
  });

  it("acepta credenciales con formato válido", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "algo" });
    expect(result.success).toBe(true);
  });
});

describe("resetPasswordSchema", () => {
  it("rechaza cuando las contraseñas no coinciden", () => {
    const result = resetPasswordSchema.safeParse({ password: "Segura123", confirmPassword: "Segura124" });
    expect(result.success).toBe(false);
  });

  it("acepta cuando ambas contraseñas coinciden", () => {
    const result = resetPasswordSchema.safeParse({ password: "Segura123", confirmPassword: "Segura123" });
    expect(result.success).toBe(true);
  });
});
