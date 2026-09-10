import { z } from "zod";

export const userRoleSchema = z.enum(["alumno", "instructor", "externo", "expositor"]);
export type UserRoleInput = z.infer<typeof userRoleSchema>;

export const institutionTypeSchema = z.enum([
  "ITC",
  "UT",
  "UNICARIBE",
  "POLITECNICO",
  "OTRA",
  "SIN_INSTITUCION",
]);

export const academicDegreeSchema = z.enum(["MTRO", "DR", "ING", "LIC", "OTRO"]);

export const INSTITUTION_OPTIONS: { value: z.infer<typeof institutionTypeSchema>; label: string }[] = [
  { value: "ITC", label: "Instituto Tecnológico de Cancún" },
  { value: "UT", label: "UT" },
  { value: "UNICARIBE", label: "Unicaribe" },
  { value: "POLITECNICO", label: "Politécnico" },
  { value: "OTRA", label: "Otra institución (escribe cuál)" },
  { value: "SIN_INSTITUCION", label: "Sin institución" },
];

export const ACADEMIC_DEGREE_OPTIONS: { value: z.infer<typeof academicDegreeSchema>; label: string }[] = [
  { value: "MTRO", label: "Mtro." },
  { value: "DR", label: "Dr." },
  { value: "ING", label: "Ing." },
  { value: "LIC", label: "Lic." },
  { value: "OTRO", label: "Otro (escribe cuál)" },
];

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, "El nombre debe tener al menos 2 caracteres")
  .max(150, "El nombre es demasiado largo");

export const emailSchema = z.string().trim().toLowerCase().email("Correo electrónico inválido");

export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(72, "La contraseña es demasiado larga")
  .regex(/[a-z]/, "Debe incluir al menos una letra minúscula")
  .regex(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
  .regex(/[0-9]/, "Debe incluir al menos un número");

export function refineOtherInstitution<
  T extends { institution_type: string; institution_other_name?: string | null },
>(data: T, ctx: z.RefinementCtx) {
  if (data.institution_type === "OTRA") {
    if (!data.institution_other_name || data.institution_other_name.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Escribe el nombre de tu institución",
        path: ["institution_other_name"],
      });
    }
  }
}