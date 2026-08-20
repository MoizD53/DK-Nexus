import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import { getExercises, getCategories } from "@/lib/db/queries/exercises";
import { ExerciseGrid } from "@/components/ui/ExerciseGrid";
import { CategoryFilter } from "@/components/ui/CategoryFilter";
import { ExerciseFilters } from "@/components/ui/ExerciseFilters";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { Suspense } from "react";

export default async function OwnerExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; muscle?: string; equipment?: string; difficulty?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "owner") redirect("/login");

  const { q = "", category = "", muscle = "", equipment = "", difficulty = "" } = await searchParams;
  const [exercises, categories] = await Promise.all([
    getExercises({ search: q, category, muscle, equipment, difficulty }),
    getCategories()
  ]);

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-white">Exercise Library</h1>
        <p className="text-sm text-stone-400 mt-1">Global library of exercises available for your members.</p>
      </div>

      <div className="mb-6 space-y-4">
        <Suspense fallback={null}>
          <SearchInput placeholder="Search exercises..." />
        </Suspense>
        
        <Suspense fallback={null}>
          <ExerciseFilters />
        </Suspense>

        <Suspense fallback={null}>
          <CategoryFilter categories={categories} />
        </Suspense>
      </div>

      {exercises.length === 0 ? (
        <div className="mt-8 bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
          <EmptyState 
            title={q || category ? "No exercises match your filters" : "Library is empty"} 
            description={q || category ? "Try clearing your search or selecting a different category." : "Global library exercises will appear here."} 
          />
        </div>
      ) : (
        <ExerciseGrid exercises={exercises} basePath="/owner/exercises" />
      )}
    </div>
  );
}
