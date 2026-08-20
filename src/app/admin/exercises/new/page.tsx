import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import { getCategories } from "@/lib/db/queries/exercises";
import { ExerciseFormClient } from "../ExerciseFormClient";
import Link from "next/link";

export default async function NewExercisePage() {
  const session = await getSession();
  if (!session || session.role !== "master_admin") redirect("/login");

  const categories = await getCategories();

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-3xl">
      <div className="mb-7 flex items-center gap-3">
        <Link
          href="/admin/exercises"
          className="text-stone-500 hover:text-stone-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-white">Add Exercise</h1>
          <p className="text-sm text-stone-400 mt-0.5">Create a new exercise in the global library</p>
        </div>
      </div>
      
      <ExerciseFormClient categories={categories} />
    </div>
  );
}
