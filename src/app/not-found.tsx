import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-50 px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-100 text-surface-500">
        <FileQuestion className="h-8 w-8" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-semibold text-surface-900">Página no encontrada</h1>
      <p className="max-w-md text-sm text-surface-500">
        La página que buscas no existe o fue movida. Verifica la dirección o vuelve al inicio.
      </p>
      <Link href="/">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
}
