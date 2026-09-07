"use client";

import { useFormState, useFormStatus } from "react-dom";
import { resetPasswordAction } from "@/app/auth/reset-password/actions";
import { INITIAL_ACTION_STATE, fieldError } from "@/lib/action-state";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError, FieldHint } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="w-full" size="lg">
      Guardar nueva contraseña
    </Button>
  );
}

export function ResetPasswordForm() {
  const [state, formAction] = useFormState(resetPasswordAction, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status === "error" && state.message && <Alert variant="error">{state.message}</Alert>}

      <div>
        <Label htmlFor="password" required>
          Nueva contraseña
        </Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
        <FieldHint>Mínimo 8 caracteres, con mayúscula, minúscula y número.</FieldHint>
        <FieldError id="password-error" message={fieldError(state.fieldErrors, "password")} />
      </div>

      <div>
        <Label htmlFor="confirmPassword" required>
          Confirmar contraseña
        </Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
        <FieldError id="confirmPassword-error" message={fieldError(state.fieldErrors, "confirmPassword")} />
      </div>

      <SubmitButton />
    </form>
  );
}
