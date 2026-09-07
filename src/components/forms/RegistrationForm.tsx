"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { GraduationCap, Mic2, Presentation, Users } from "lucide-react";
import { registerAction } from "@/app/auth/register/actions";
import { INITIAL_ACTION_STATE, fieldError } from "@/lib/action-state";
import { ACADEMIC_DEGREE_OPTIONS, INSTITUTION_OPTIONS, type UserRoleInput } from "@/validations/common";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/utils";

const ROLE_TABS: { value: UserRoleInput; label: string; icon: typeof GraduationCap }[] = [
  { value: "alumno", label: "Alumno", icon: GraduationCap },
  { value: "instructor", label: "Instructor", icon: Presentation },
  { value: "externo", label: "Externo", icon: Users },
  { value: "expositor", label: "Expositor", icon: Mic2 },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="w-full" size="lg">
      Crear cuenta
    </Button>
  );
}

function InstitutionField({
  namePrefix = "",
  errors,
}: {
  namePrefix?: string;
  errors?: Record<string, string[]>;
}) {
  const [value, setValue] = useState("");
  const fieldName = `${namePrefix}institution_type`;
  const otherName = `${namePrefix}institution_other_name`;

  return (
    <>
      <div>
        <Label htmlFor={fieldName} required>
          Procedencia / Institución
        </Label>
        <Select
          id={fieldName}
          name={fieldName}
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          error={fieldError(errors, fieldName)}
        >
          <option value="" disabled>
            Selecciona una opción
          </option>
          {INSTITUTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <FieldError id={`${fieldName}-error`} message={fieldError(errors, fieldName)} />
      </div>

      {value === "OTRA" && (
        <div className="animate-slide-down">
          <Label htmlFor={otherName} required>
            Nombre de tu institución
          </Label>
          <Input id={otherName} name={otherName} placeholder="Escribe el nombre de tu institución" />
          <FieldError id={`${otherName}-error`} message={fieldError(errors, otherName)} />
        </div>
      )}
    </>
  );
}

function AlumnoFields({ errors }: { errors?: Record<string, string[]> }) {
  return (
    <>
      <div>
        <Label htmlFor="control_number" required>
          Id / número de control
        </Label>
        <Input id="control_number" name="control_number" placeholder="Ej. 21040123" required />
        <FieldError id="control_number-error" message={fieldError(errors, "control_number")} />
      </div>
      <InstitutionField errors={errors} />
    </>
  );
}

function InstructorFields({ errors }: { errors?: Record<string, string[]> }) {
  const [degree, setDegree] = useState("");
  return (
    <>
      <div>
        <Label htmlFor="control_number">Número de control (si aplica)</Label>
        <Input id="control_number" name="control_number" placeholder="Opcional" />
        <FieldError id="control_number-error" message={fieldError(errors, "control_number")} />
      </div>
      <div>
        <Label htmlFor="department" required>
          Departamento / Academia
        </Label>
        <Input id="department" name="department" placeholder="Ej. Academia de Sistemas" required />
        <FieldError id="department-error" message={fieldError(errors, "department")} />
      </div>
      <div>
        <Label htmlFor="specialty" required>
          Especialidad / Área de conocimiento
        </Label>
        <Input id="specialty" name="specialty" placeholder="Ej. Desarrollo de Software" required />
        <FieldError id="specialty-error" message={fieldError(errors, "specialty")} />
      </div>
      <div>
        <Label htmlFor="academic_degree" required>
          Grado académico / Título
        </Label>
        <Select
          id="academic_degree"
          name="academic_degree"
          required
          value={degree}
          onChange={(e) => setDegree(e.target.value)}
          error={fieldError(errors, "academic_degree")}
        >
          <option value="" disabled>
            Selecciona una opción
          </option>
          {ACADEMIC_DEGREE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <FieldError id="academic_degree-error" message={fieldError(errors, "academic_degree")} />
      </div>
      {degree === "OTRO" && (
        <div className="animate-slide-down">
          <Label htmlFor="academic_degree_other" required>
            Especifica tu grado académico
          </Label>
          <Input id="academic_degree_other" name="academic_degree_other" placeholder="Ej. Ph.D." />
          <FieldError
            id="academic_degree_other-error"
            message={fieldError(errors, "academic_degree_other")}
          />
        </div>
      )}
    </>
  );
}

function ExternoFields({ errors }: { errors?: Record<string, string[]> }) {
  return (
    <>
      <InstitutionField errors={errors} />
      <div>
        <Label htmlFor="organization" required>
          Organización
        </Label>
        <Input id="organization" name="organization" placeholder="Nombre de tu organización o empresa" required />
        <FieldError id="organization-error" message={fieldError(errors, "organization")} />
      </div>
      <Alert variant="info">
        Se ocultará el campo de identificador: el sistema generará automáticamente un código corto único
        (ej. EX-4F82A1) que será tu identificador de acreditación.
      </Alert>
    </>
  );
}

function ExpositorFields({ errors }: { errors?: Record<string, string[]> }) {
  return (
    <>
      <div>
        <Label htmlFor="bio" required>
          Semblanza / Biografía corta
        </Label>
        <Textarea id="bio" name="bio" placeholder="Cuéntanos brevemente tu trayectoria" required />
        <FieldError id="bio-error" message={fieldError(errors, "bio")} />
      </div>
      <InstitutionField errors={errors} />
      <div>
        <Label htmlFor="organization">Organización (opcional)</Label>
        <Input id="organization" name="organization" placeholder="Empresa, universidad, colectivo..." />
        <FieldError id="organization-error" message={fieldError(errors, "organization")} />
      </div>
      <div>
        <Label htmlFor="profile_link">Enlace a perfil / redes (opcional)</Label>
        <Input id="profile_link" name="profile_link" type="url" placeholder="https://..." />
        <FieldError id="profile_link-error" message={fieldError(errors, "profile_link")} />
      </div>
    </>
  );
}

export function RegistrationForm() {
  const [state, formAction] = useFormState(registerAction, INITIAL_ACTION_STATE);
  const [role, setRole] = useState<UserRoleInput>("alumno");

  const RoleFields = useMemo(() => {
    switch (role) {
      case "instructor":
        return InstructorFields;
      case "externo":
        return ExternoFields;
      case "expositor":
        return ExpositorFields;
      default:
        return AlumnoFields;
    }
  }, [role]);

  return (
    <div>
      <div role="tablist" aria-label="Tipo de registro" className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ROLE_TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={role === value}
            onClick={() => setRole(value)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition-colors",
              role === value
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-surface-200 text-surface-600 hover:bg-surface-50"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="role" value={role} />

        {state.status === "error" && state.message && <Alert variant="error">{state.message}</Alert>}

        <div>
          <Label htmlFor="full_name" required>
            Nombre completo
          </Label>
          <Input id="full_name" name="full_name" placeholder="Tu nombre completo" autoComplete="name" required />
          <FieldError id="full_name-error" message={fieldError(state.fieldErrors, "full_name")} />
        </div>

        <div>
          <Label htmlFor="email" required>
            Correo electrónico
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tucorreo@ejemplo.com"
            autoComplete="email"
            required
          />
          <FieldError id="email-error" message={fieldError(state.fieldErrors, "email")} />
        </div>

        <div>
          <Label htmlFor="password" required>
            Contraseña
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            required
          />
          <FieldError id="password-error" message={fieldError(state.fieldErrors, "password")} />
        </div>

        <div className="space-y-4 border-t border-surface-100 pt-4">
          <RoleFields errors={state.fieldErrors} />
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
