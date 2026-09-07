import { z } from "zod";
import { academicDegreeSchema, emailSchema, fullNameSchema, institutionTypeSchema, passwordSchema, userRoleSchema } from "./common";

const baseAccountSchema = {
  full_name: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
};

// Nota: z.discriminatedUnion requiere que cada miembro sea un ZodObject
// "plano" (sin .refine/.superRefine todavía). Las reglas condicionales
// (ej. "OTRA" requiere institution_other_name) se aplican DESPUÉS, sobre
// la unión completa, en `registrationSchema` más abajo.

export const alumnoRegistrationSchema = z.object({
  ...baseAccountSchema,
  role: z.literal("alumno"),
  control_number: z
    .string()
    .trim()
    .min(3, "El número de control debe tener al menos 3 caracteres")
    .max(30, "El número de control es demasiado largo"),
  institution_type: institutionTypeSchema,
  institution_other_name: z.string().trim().max(150).optional(),
});
export type AlumnoRegistrationInput = z.infer<typeof alumnoRegistrationSchema>;

export const instructorRegistrationSchema = z.object({
  ...baseAccountSchema,
  role: z.literal("instructor"),
  control_number: z.string().trim().max(30).optional(),
  department: z.string().trim().min(2, "Indica el departamento o academia").max(150),
  specialty: z.string().trim().min(2, "Indica la especialidad o área de conocimiento").max(150),
  academic_degree: academicDegreeSchema,
  academic_degree_other: z.string().trim().max(60).optional(),
});
export type InstructorRegistrationInput = z.infer<typeof instructorRegistrationSchema>;

export const externoRegistrationSchema = z.object({
  ...baseAccountSchema,
  role: z.literal("externo"),
  institution_type: institutionTypeSchema,
  institution_other_name: z.string().trim().max(150).optional(),
  organization: z.string().trim().min(2, "Indica tu organización").max(150),
});
export type ExternoRegistrationInput = z.infer<typeof externoRegistrationSchema>;

export const expositorRegistrationSchema = z.object({
  ...baseAccountSchema,
  role: z.literal("expositor"),
  bio: z.string().trim().min(10, "Escribe una semblanza de al menos 10 caracteres").max(2000),
  institution_type: institutionTypeSchema,
  institution_other_name: z.string().trim().max(150).optional(),
  organization: z.string().trim().max(150).optional(),
  profile_link: z.string().trim().url("Ingresa una URL válida (https://...)").optional().or(z.literal("")),
});
export type ExpositorRegistrationInput = z.infer<typeof expositorRegistrationSchema>;

const registrationUnionSchema = z.discriminatedUnion("role", [
  alumnoRegistrationSchema,
  instructorRegistrationSchema,
  externoRegistrationSchema,
  expositorRegistrationSchema,
]);

export const registrationSchema = registrationUnionSchema.superRefine((data, ctx) => {
  if ("institution_type" in data && data.institution_type === "OTRA") {
    const value = "institution_other_name" in data ? data.institution_other_name : undefined;
    if (!value || value.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Escribe el nombre de tu institución",
        path: ["institution_other_name"],
      });
    }
  }

  if (data.role === "instructor" && data.academic_degree === "OTRO") {
    if (!data.academic_degree_other || data.academic_degree_other.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Escribe tu grado académico",
        path: ["academic_degree_other"],
      });
    }
  }
});

export type RegistrationInput = z.infer<typeof registrationUnionSchema>;

export { userRoleSchema };
