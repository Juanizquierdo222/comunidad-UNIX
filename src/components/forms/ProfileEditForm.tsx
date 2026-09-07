"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { updateProfileAction } from "@/app/dashboard/profile/actions";
import { INITIAL_ACTION_STATE, fieldError } from "@/lib/action-state";
import { ACADEMIC_DEGREE_OPTIONS, INSTITUTION_OPTIONS } from "@/validations/common";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import type { FullProfile } from "@/services/profile.service";
import type {
  AlumnoProfileRow,
  ExpositorProfileRow,
  ExternoProfileRow,
  InstructorProfileRow,
} from "@/types/database";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} size="lg">
      Guardar cambios
    </Button>
  );
}

export function ProfileEditForm({ profile, details }: FullProfile) {
  const [state, formAction] = useFormState(updateProfileAction, INITIAL_ACTION_STATE);
  const [institution, setInstitution] = useState(
    (details as { institution_type?: string } | null)?.institution_type ?? ""
  );
  const [degree, setDegree] = useState((details as InstructorProfileRow | null)?.academic_degree ?? "");

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="role" value={profile.role} />

      {state.status === "error" && state.message && <Alert variant="error">{state.message}</Alert>}
      {state.status === "success" && state.message && <Alert variant="success">{state.message}</Alert>}

      <div>
        <Label htmlFor="full_name" required>
          Nombre completo
        </Label>
        <Input id="full_name" name="full_name" defaultValue={profile.full_name} required />
        <FieldError id="full_name-error" message={fieldError(state.fieldErrors, "full_name")} />
      </div>

      <div>
        <Label htmlFor="phone">Teléfono (opcional)</Label>
        <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} placeholder="10 dígitos" />
        <FieldError id="phone-error" message={fieldError(state.fieldErrors, "phone")} />
      </div>

      {profile.role === "alumno" && details && (
        <div className="space-y-4 border-t border-surface-100 pt-4">
          <div>
            <Label htmlFor="control_number" required>
              Id / número de control
            </Label>
            <Input
              id="control_number"
              name="control_number"
              defaultValue={(details as AlumnoProfileRow).control_number}
              required
            />
          </div>
          <div>
            <Label htmlFor="institution_type" required>
              Procedencia / Institución
            </Label>
            <Select
              id="institution_type"
              name="institution_type"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              required
            >
              {INSTITUTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
          {institution === "OTRA" && (
            <div>
              <Label htmlFor="institution_other_name" required>
                Nombre de tu institución
              </Label>
              <Input
                id="institution_other_name"
                name="institution_other_name"
                defaultValue={(details as AlumnoProfileRow).institution_other_name ?? ""}
              />
            </div>
          )}
        </div>
      )}

      {profile.role === "instructor" && details && (
        <div className="space-y-4 border-t border-surface-100 pt-4">
          <div>
            <Label htmlFor="control_number">Número de control (si aplica)</Label>
            <Input
              id="control_number"
              name="control_number"
              defaultValue={(details as InstructorProfileRow).control_number ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="department" required>
              Departamento / Academia
            </Label>
            <Input id="department" name="department" defaultValue={(details as InstructorProfileRow).department} required />
          </div>
          <div>
            <Label htmlFor="specialty" required>
              Especialidad
            </Label>
            <Input id="specialty" name="specialty" defaultValue={(details as InstructorProfileRow).specialty} required />
          </div>
          <div>
            <Label htmlFor="academic_degree" required>
              Grado académico
            </Label>
            <Select
              id="academic_degree"
              name="academic_degree"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              required
            >
              {ACADEMIC_DEGREE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
          {degree === "OTRO" && (
            <div>
              <Label htmlFor="academic_degree_other" required>
                Especifica tu grado académico
              </Label>
              <Input
                id="academic_degree_other"
                name="academic_degree_other"
                defaultValue={(details as InstructorProfileRow).academic_degree_other ?? ""}
              />
            </div>
          )}
        </div>
      )}

      {profile.role === "externo" && details && (
        <div className="space-y-4 border-t border-surface-100 pt-4">
          <div>
            <Label htmlFor="institution_type" required>
              Procedencia / Institución
            </Label>
            <Select
              id="institution_type"
              name="institution_type"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              required
            >
              {INSTITUTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
          {institution === "OTRA" && (
            <div>
              <Label htmlFor="institution_other_name" required>
                Nombre de tu institución
              </Label>
              <Input
                id="institution_other_name"
                name="institution_other_name"
                defaultValue={(details as ExternoProfileRow).institution_other_name ?? ""}
              />
            </div>
          )}
          <div>
            <Label htmlFor="organization" required>
              Organización
            </Label>
            <Input id="organization" name="organization" defaultValue={(details as ExternoProfileRow).organization} required />
          </div>
        </div>
      )}

      {profile.role === "expositor" && details && (
        <div className="space-y-4 border-t border-surface-100 pt-4">
          <div>
            <Label htmlFor="bio" required>
              Semblanza / Biografía corta
            </Label>
            <Textarea id="bio" name="bio" defaultValue={(details as ExpositorProfileRow).bio} required />
          </div>
          <div>
            <Label htmlFor="institution_type" required>
              Procedencia / Institución
            </Label>
            <Select
              id="institution_type"
              name="institution_type"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              required
            >
              {INSTITUTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
          {institution === "OTRA" && (
            <div>
              <Label htmlFor="institution_other_name" required>
                Nombre de tu institución
              </Label>
              <Input
                id="institution_other_name"
                name="institution_other_name"
                defaultValue={(details as ExpositorProfileRow).institution_other_name ?? ""}
              />
            </div>
          )}
          <div>
            <Label htmlFor="organization">Organización (opcional)</Label>
            <Input
              id="organization"
              name="organization"
              defaultValue={(details as ExpositorProfileRow).organization ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="profile_link">Enlace a perfil / redes (opcional)</Label>
            <Input
              id="profile_link"
              name="profile_link"
              type="url"
              defaultValue={(details as ExpositorProfileRow).profile_link ?? ""}
            />
          </div>
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
