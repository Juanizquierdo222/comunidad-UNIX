import { z } from "zod";
import { academicDegreeSchema, fullNameSchema, institutionTypeSchema } from "./common";

export const profileUpdateSchema = z.object({
  full_name: fullNameSchema,
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s()-]{7,20}$/, "Teléfono inválido")
    .optional()
    .or(z.literal("")),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const alumnoDetailsUpdateSchema = z.object({
  control_number: z.string().trim().min(3).max(30),
  institution_type: institutionTypeSchema,
  institution_other_name: z.string().trim().max(150).optional(),
});

export const instructorDetailsUpdateSchema = z.object({
  control_number: z.string().trim().max(30).optional(),
  department: z.string().trim().min(2).max(150),
  specialty: z.string().trim().min(2).max(150),
  academic_degree: academicDegreeSchema,
  academic_degree_other: z.string().trim().max(60).optional(),
});

export const externoDetailsUpdateSchema = z.object({
  institution_type: institutionTypeSchema,
  institution_other_name: z.string().trim().max(150).optional(),
  organization: z.string().trim().min(2).max(150),
});

export const expositorDetailsUpdateSchema = z.object({
  bio: z.string().trim().min(10).max(2000),
  institution_type: institutionTypeSchema,
  institution_other_name: z.string().trim().max(150).optional(),
  organization: z.string().trim().max(150).optional(),
  profile_link: z.string().trim().url().optional().or(z.literal("")),
});
