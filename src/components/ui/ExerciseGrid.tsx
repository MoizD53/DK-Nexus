import Link from "next/link";
import { Badge } from "./Badge";

interface ExerciseGridProps {
  exercises: any[];
  basePath: string; // e.g. "/member/exercises" or "/owner/exercises"
}

export function ExerciseGrid({ exercises, basePath }: ExerciseGridProps) {
  if (exercises.length === 0) return null; // Let the page handle EmptyState

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {exercises.map((ex) => (
        <Link 
          key={ex.id} 
          href={`${basePath}/${ex.id}`}
          className="group flex flex-col bg-stone-900 border border-stone-800 rounded-xl overflow-hidden hover:border-stone-700 transition-colors"
        >
          {/* Thumbnail Area */}
          <div className="aspect-video bg-stone-950 border-b border-stone-800 relative overflow-hidden flex items-center justify-center">
            {ex.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ex.thumbnailUrl} alt={ex.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="flex flex-col items-center justify-center text-stone-700">
                <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium uppercase tracking-widest">Video Coming Soon</span>
              </div>
            )}
            
            {/* Top right badges overlay */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
              <Badge variant="stone">{ex.category}</Badge>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="p-4 flex flex-col flex-1">
            <h3 className="text-sm font-semibold text-white group-hover:text-amber-500 transition-colors line-clamp-1">{ex.name}</h3>
            
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center text-xs text-stone-400">
                <svg className="w-4 h-4 mr-1.5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="truncate">{ex.primaryMuscle}</span>
              </div>
              {ex.equipment && (
                <div className="flex items-center text-xs text-stone-400">
                  <svg className="w-4 h-4 mr-1.5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{ex.equipment}</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-3 border-t border-stone-800/50 flex items-center justify-between text-xs font-medium mt-auto">
              <span className={
                ex.difficulty === "Beginner" ? "text-emerald-400" : 
                ex.difficulty === "Intermediate" ? "text-amber-400" : 
                ex.difficulty === "Advanced" ? "text-red-400" : "text-stone-500"
              }>
                {ex.difficulty || "All Levels"}
              </span>
              <span className="text-stone-500 group-hover:text-amber-500 transition-colors flex items-center gap-1">
                View Details
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
