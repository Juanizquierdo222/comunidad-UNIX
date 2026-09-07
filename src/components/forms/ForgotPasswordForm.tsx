"use client";

import { useFormState, useFormStatus } from "react-dom";
import { forgotPasswordAction } from "@/app/auth/forgot-password/actions";
import { INITIAL_ACTION_STATE, fieldError } from "@/lib/action-state";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="w-full" size="lg">
      Enviar enlace de recuperación
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useFormState(forgotPasswordAction, INITIAL_ACTION_STATE);

  if (state.status === "success") {
    return <Alert variant="success">{state.message}</Alert>;
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status === "error" && state.message && <Alert variant="error">{state.message}</Alert>}
      <div>
        <Label htmlFor="email" required>
          Correo electrónico
        </Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="tucorreo@ejemplo.com" required />
        <FieldError id="email-error" message={fieldError(state.fieldErrors, "email")} />
      </div>
      <SubmitButton />
    </form>
  );
}
