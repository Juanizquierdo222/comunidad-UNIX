"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  enrollInCourse,
  type EnrollmentState,
} from "@/app/dashboard/courses/actions";

const initialEnrollmentState: EnrollmentState = {
  error: null,
  success: false,
};

export default function EnrollButton({
  courseId,
}: {
  courseId: string;
}) {
  const router = useRouter();

  const [state, action, pending] = useActionState(
    enrollInCourse,
    initialEnrollmentState
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="courseId" value={courseId} />

      <button
        type="submit"
        disabled={pending || state.success}
        className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
      >
        {pending
          ? "Comenzando..."
          : state.success
            ? "Curso iniciado"
            : "Comenzar curso"}
      </button>

      {state.error && (
        <p role="alert" className="text-sm text-red-300">
          {state.error}
        </p>
      )}
    </form>
  );
}