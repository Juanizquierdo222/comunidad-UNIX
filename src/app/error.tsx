"use client";

import { useEffect } from "react";
import { AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // En producción esto se enviaría a un servicio de observabilidad.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-50 px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
        <AlertOctagon className="h-8 w-8" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-semibold text-surface-900">Algo salió mal</h1>
      <p className="max-w-md text-sm text-surface-500">
        Ocurrió un error inesperado. Puedes intentar de nuevo; si el problema persiste, contacta a soporte.
      </p>
      <Button onClick={reset}>Intentar de nuevo</Button>
    </div>
  );
}
