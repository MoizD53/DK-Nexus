import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import { getExercises } from "@/lib/db/queries/exercises";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Suspense } from "react";

export default async function AdminExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "master_admin") redirect("/login");

  const { q = "" } = await searchParams;
  const exercises = await getExercises({ search: q });

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-5xl">
      <div className="mb-7 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Exercise Library</h1>
          <p className="text-sm text-stone-400 mt-1">
            {exercises.length} exercise{exercises.length !== 1 ? "s" : ""} in the global library
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/exercises/categories"
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 text-sm font-medium px-4 py-2.5 rounded-md transition-colors"
          >
            Categories
          </Link>
          <Link
            href="/admin/exercises/new"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-sm font-medium px-4 py-2.5 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Exercise
          </Link>
        </div>
      </div>

      <div className="mb-5">
        <Suspense fallback={null}>
          <SearchInput placeholder="Search exercises..." />
        </Suspense>
      </div>

      <Card padding={false}>
        {exercises.length === 0 ? (
          <EmptyState
            title={q ? "No exercises match your search" : "No exercises yet"}
            description={q ? "Try a different search term." : "Build the global library by adding your first exercise."}
          />
        ) : (
          <div className="divide-y divide-stone-800">
            {exercises.map((ex) => (
              <Link
                key={ex.id}
                href={`/admin/exercises/${ex.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-stone-800/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-md bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0 overflow-hidden relative">
                  {ex.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ex.thumbnailUrl} alt={ex.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-5 h-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-stone-200 group-hover:text-white transition-colors truncate">
                      {ex.name}
                    </p>
                    <Badge variant="stone">{ex.category}</Badge>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 truncate">
                    {ex.primaryMuscle} {ex.equipment ? `· ${ex.equipment}` : ""}
                  </p>
                </div>
                <svg className="w-4 h-4 text-stone-600 group-hover:text-stone-400 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
