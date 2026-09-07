import { describe, expect, it } from "vitest";
import { registrationSchema } from "@/validations/registration";

const basePassword = "Segura123";

describe("registrationSchema — Alumno", () => {
  it("acepta un registro válido con institución conocida", () => {
    const result = registrationSchema.safeParse({
      role: "alumno",
      full_name: "Ana Pérez",
      email: "ana@example.com",
      password: basePassword,
      control_number: "21040123",
      institution_type: "UT",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza 'OTRA' institución sin especificar el nombre", () => {
    const result = registrationSchema.safeParse({
      role: "alumno",
      full_name: "Ana Pérez",
      email: "ana@example.com",
      password: basePassword,
      control_number: "21040123",
      institution_type: "OTRA",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("institution_other_name");
    }
  });

  it("acepta 'OTRA' institución cuando se especifica el nombre", () => {
    const result = registrationSchema.safeParse({
      role: "alumno",
      full_name: "Ana Pérez",
      email: "ana@example.com",
      password: basePassword,
      control_number: "21040123",
      institution_type: "OTRA",
      institution_other_name: "Instituto Tecnológico Regional",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza número de control demasiado corto", () => {
    const result = registrationSchema.safeParse({
      role: "alumno",
      full_name: "Ana Pérez",
      email: "ana@example.com",
      password: basePassword,
      control_number: "1",
      institution_type: "UT",
    });
    expect(result.success).toBe(false);
  });
});

describe("registrationSchema — Instructor", () => {
  it("rechaza grado académico 'OTRO' sin especificar", () => {
    const result = registrationSchema.safeParse({
      role: "instructor",
      full_name: "Carlos Ruiz",
      email: "carlos@example.com",
      password: basePassword,
      department: "Academia de Sistemas",
      specialty: "Bases de datos",
      academic_degree: "OTRO",
    });
    expect(result.success).toBe(false);
  });

  it("acepta un registro completo con grado académico conocido", () => {
    const result = registrationSchema.safeParse({
      role: "instructor",
      full_name: "Carlos Ruiz",
      email: "carlos@example.com",
      password: basePassword,
      department: "Academia de Sistemas",
      specialty: "Bases de datos",
      academic_degree: "DR",
    });
    expect(result.success).toBe(true);
  });
});

describe("registrationSchema — Externo", () => {
  it("requiere organización", () => {
    const result = registrationSchema.safeParse({
      role: "externo",
      full_name: "Externo Uno",
      email: "externo@example.com",
      password: basePassword,
      institution_type: "SIN_INSTITUCION",
      organization: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("registrationSchema — Expositor", () => {
  it("requiere una semblanza de al menos 10 caracteres", () => {
    const result = registrationSchema.safeParse({
      role: "expositor",
      full_name: "Expositor Uno",
      email: "expositor@example.com",
      password: basePassword,
      bio: "muy corta",
      institution_type: "SIN_INSTITUCION",
    });
    expect(result.success).toBe(false);
  });

  it("valida el formato de la URL de perfil si se proporciona", () => {
    const result = registrationSchema.safeParse({
      role: "expositor",
      full_name: "Expositor Uno",
      email: "expositor@example.com",
      password: basePassword,
      bio: "Biografía suficientemente larga para pasar la validación",
      institution_type: "SIN_INSTITUCION",
      profile_link: "no-es-una-url",
    });
    expect(result.success).toBe(false);
  });

  it("permite omitir el enlace de perfil", () => {
    const result = registrationSchema.safeParse({
      role: "expositor",
      full_name: "Expositor Uno",
      email: "expositor@example.com",
      password: basePassword,
      bio: "Biografía suficientemente larga para pasar la validación",
      institution_type: "SIN_INSTITUCION",
      profile_link: "",
    });
    expect(result.success).toBe(true);
  });
});


describe("registrationSchema — Seguridad de roles", () => {
  it("rechaza el rol admin en el registro público", () => {
    const result = registrationSchema.safeParse({
      role: "admin",
      full_name: "Admin Malicioso",
      email: "attacker@example.com",
      password: basePassword,
    });
    expect(result.success).toBe(false);
  });
});
