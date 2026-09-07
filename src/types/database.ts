/**
 * Tipos que reflejan el esquema de supabase/migrations/*.sql
 * Si el esquema cambia, actualiza este archivo (o genera con
 * `supabase gen types typescript --linked` una vez conectado al proyecto).
 */

export type UserRole = "alumno" | "instructor" | "externo" | "expositor" | "admin";

export type InstitutionType = "UT" | "UNICARIBE" | "POLITECNICO" | "OTRA" | "SIN_INSTITUCION";

export type AcademicDegree = "MTRO" | "DR" | "ING" | "LIC" | "OTRO";

export type ProfileRow = {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type AlumnoProfileRow = {
  profile_id: string;
  control_number: string;
  institution_type: InstitutionType;
  institution_other_name: string | null;
  created_at: string;
  updated_at: string;
};

export type InstructorProfileRow = {
  profile_id: string;
  control_number: string | null;
  department: string;
  specialty: string;
  academic_degree: AcademicDegree;
  academic_degree_other: string | null;
  created_at: string;
  updated_at: string;
};

export type ExternoProfileRow = {
  profile_id: string;
  public_code: string;
  institution_type: InstitutionType;
  institution_other_name: string | null;
  organization: string;
  created_at: string;
  updated_at: string;
};

export type ExpositorProfileRow = {
  profile_id: string;
  public_code: string;
  bio: string;
  institution_type: InstitutionType;
  institution_other_name: string | null;
  organization: string | null;
  profile_link: string | null;
  created_at: string;
  updated_at: string;
};

export type PeopleDirectoryRow = {
  profile_id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  created_at: string;
  control_number: string | null;
  public_code: string | null;
  institution_type: InstitutionType | null;
  institution_label: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & Pick<ProfileRow, "id" | "role" | "full_name">;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      alumno_profiles: {
        Row: AlumnoProfileRow;
        Insert: Partial<AlumnoProfileRow> &
          Pick<AlumnoProfileRow, "profile_id" | "control_number" | "institution_type">;
        Update: Partial<AlumnoProfileRow>;
        Relationships: [];
      };
      instructor_profiles: {
        Row: InstructorProfileRow;
        Insert: Partial<InstructorProfileRow> &
          Pick<InstructorProfileRow, "profile_id" | "department" | "specialty" | "academic_degree">;
        Update: Partial<InstructorProfileRow>;
        Relationships: [];
      };
      externo_profiles: {
        Row: ExternoProfileRow;
        Insert: Partial<ExternoProfileRow> &
          Pick<ExternoProfileRow, "profile_id" | "institution_type" | "organization">;
        Update: Partial<ExternoProfileRow>;
        Relationships: [];
      };
      expositor_profiles: {
        Row: ExpositorProfileRow;
        Insert: Partial<ExpositorProfileRow> &
          Pick<ExpositorProfileRow, "profile_id" | "bio" | "institution_type">;
        Update: Partial<ExpositorProfileRow>;
        Relationships: [];
      };
    };
    Views: {
      people_directory: {
        Row: PeopleDirectoryRow;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      institution_type: InstitutionType;
      academic_degree: AcademicDegree;
    };
    CompositeTypes: Record<string, never>;
  };
};
