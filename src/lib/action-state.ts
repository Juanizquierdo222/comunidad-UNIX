export interface ActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export const INITIAL_ACTION_STATE: ActionState = { status: "idle" };

export function fieldError(fieldErrors: ActionState["fieldErrors"], field: string): string | undefined {
  return fieldErrors?.[field]?.[0];
}
