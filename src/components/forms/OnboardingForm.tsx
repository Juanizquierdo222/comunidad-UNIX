"use client";

import { useFormState, useFormStatus } from "react-dom";
import { completeOnboardingAction } from "@/app/onboarding/actions";
import { INITIAL_ACTION_STATE, fieldError } from "@/lib/action-state";
import { ACADEMIC_DEGREE_OPTIONS, INSTITUTION_OPTIONS, type UserRoleInput } from "@/validations/common";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="w-full" size="lg">
      Completar registro
    </Button>
  );
}

export function OnboardingForm({ role, fullName }: { role: UserRoleInput; fullName: string }) {
  const [state, formAction] = useFormState(completeOnboardingAction, INITIAL_ACTION_STATE);
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="role" value={role} />
      <input type="hidden" name="full_name" value={fullName} />

      {state.status === "error" && state.message && <Alert variant="error">{state.message}</Alert>}

      {role === "alumno" && (
        <>
          <div>
            <Label htmlFor="control_number" required>
              Id / número de control
            </Label>
            <Input id="control_number" name="control_number" required />
            <FieldError id="control_number-error" message={fieldError(state.fieldErrors, "control_number")} />
          </div>
          <div>
            <Label htmlFor="institution_type" required>
              Procedencia / Institución
            </Label>
            <Select
              id="institution_type"
              name="institution_type"
              required
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              error={fieldError(state.fieldErrors, "institution_type")}
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
            <FieldError id="institution_type-error" message={fieldError(state.fieldErrors, "institution_type")} />
          </div>
          {institution === "OTRA" && (
            <div className="animate-slide-down">
              <Label htmlFor="institution_other_name" required>
                Nombre de tu institución
              </Label>
              <Input id="institution_other_name" name="institution_other_name" />
              <FieldError
                id="institution_other_name-error"
                message={fieldError(state.fieldErrors, "institution_other_name")}
              />
            </div>
          )}
        </>
      )}

      {role === "instructor" && (
        <>
          <div>
            <Label htmlFor="control_number">Número de control (si aplica)</Label>
            <Input id="control_number" name="control_number" />
          </div>
          <div>
            <Label htmlFor="department" required>
              Departamento / Academia
            </Label>
            <Input id="department" name="department" required />
            <FieldError id="department-error" message={fieldError(state.fieldErrors, "department")} />
          </div>
          <div>
            <Label htmlFor="specialty" required>
              Especialidad / Área de conocimiento
            </Label>
            <Input id="specialty" name="specialty" required />
            <FieldError id="specialty-error" message={fieldError(state.fieldErrors, "specialty")} />
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
              error={fieldError(state.fieldErrors, "academic_degree")}
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
            <FieldError id="academic_degree-error" message={fieldError(state.fieldErrors, "academic_degree")} />
          </div>
          {degree === "OTRO" && (
            <div className="animate-slide-down">
              <Label htmlFor="academic_degree_other" required>
                Especifica tu grado académico
              </Label>
              <Input id="academic_degree_other" name="academic_degree_other" />
            </div>
          )}
        </>
      )}

      {role === "externo" && (
        <>
          <div>
            <Label htmlFor="institution_type" required>
              Procedencia / Institución
            </Label>
            <Select
              id="institution_type"
              name="institution_type"
              required
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              error={fieldError(state.fieldErrors, "institution_type")}
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
            <FieldError id="institution_type-error" message={fieldError(state.fieldErrors, "institution_type")} />
          </div>
          {institution === "OTRA" && (
            <div className="animate-slide-down">
              <Label htmlFor="institution_other_name" required>
                Nombre de tu institución
              </Label>
              <Input id="institution_other_name" name="institution_other_name" />
            </div>
          )}
          <div>
            <Label htmlFor="organization" required>
              Organización
            </Label>
            <Input id="organization" name="organization" required />
            <FieldError id="organization-error" message={fieldError(state.fieldErrors, "organization")} />
          </div>
        </>
      )}

      {role === "expositor" && (
        <>
          <div>
            <Label htmlFor="bio" required>
              Semblanza / Biografía corta
            </Label>
            <Textarea id="bio" name="bio" required />
            <FieldError id="bio-error" message={fieldError(state.fieldErrors, "bio")} />
          </div>
          <div>
            <Label htmlFor="institution_type" required>
              Procedencia / Institución
            </Label>
            <Select
              id="institution_type"
              name="institution_type"
              required
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              error={fieldError(state.fieldErrors, "institution_type")}
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
          </div>
          {institution === "OTRA" && (
            <div className="animate-slide-down">
              <Label htmlFor="institution_other_name" required>
                Nombre de tu institución
              </Label>
              <Input id="institution_other_name" name="institution_other_name" />
            </div>
          )}
          <div>
            <Label htmlFor="organization">Organización (opcional)</Label>
            <Input id="organization" name="organization" />
          </div>
          <div>
            <Label htmlFor="profile_link">Enlace a perfil / redes (opcional)</Label>
            <Input id="profile_link" name="profile_link" type="url" />
          </div>
        </>
      )}

      <SubmitButton />
    </form>
  );
}
