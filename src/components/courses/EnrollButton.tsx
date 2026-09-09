"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  enrollInCourse,
  initialEnrollmentState,
} from "@/app/dashboard/courses/actions";

export default function EnrollButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    enrollInCourse, initialEnrollmentState
  );

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="courseId" value={courseId} />
      <button type="submit" disabled={pending || state.success}
        className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60">
        {pending ? "Inscribiendo..." : state.success ? "Inscripción completada" : "Inscribirme gratis"}
      </button>
      {state.error && <p role="alert" className="text-sm text-red-300">{state.error}</p>}
      <p className="text-xs leading-5 text-slate-500">
        Tu inscripción se registrará en tu cuenta. No se realizará ningún cobro.
      </p>
    </form>
  );
}
