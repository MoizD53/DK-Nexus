"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ExerciseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const muscle = searchParams.get("muscle") || "";
  const equipment = searchParams.get("equipment") || "";
  const difficulty = searchParams.get("difficulty") || "";

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      <select 
        value={muscle} 
        onChange={(e) => setFilter("muscle", e.target.value)}
        className="w-full bg-stone-900 border border-stone-800 text-stone-300 text-xs sm:text-sm rounded-md px-2 py-2.5 focus:outline-none focus:border-amber-600 appearance-none"
      >
        <option value="">All Muscles</option>
        <option value="Pectoralis">Chest (Pectoralis)</option>
        <option value="Latissimus">Back (Lats)</option>
        <option value="Deltoid">Shoulders (Delts)</option>
        <option value="Biceps">Biceps</option>
        <option value="Triceps">Triceps</option>
        <option value="Quadriceps">Quads</option>
        <option value="Hamstrings">Hamstrings</option>
        <option value="Glutes">Glutes</option>
        <option value="Core">Core / Abs</option>
      </select>

      <select 
        value={equipment} 
        onChange={(e) => setFilter("equipment", e.target.value)}
        className="w-full bg-stone-900 border border-stone-800 text-stone-300 text-xs sm:text-sm rounded-md px-2 py-2.5 focus:outline-none focus:border-amber-600 appearance-none"
      >
        <option value="">All Equipment</option>
        <option value="Barbell">Barbell</option>
        <option value="Dumbbell">Dumbbell</option>
        <option value="Machine">Machine</option>
        <option value="Cable">Cable</option>
        <option value="Bodyweight">Bodyweight</option>
      </select>

      <select 
        value={difficulty} 
        onChange={(e) => setFilter("difficulty", e.target.value)}
        className="w-full bg-stone-900 border border-stone-800 text-stone-300 text-xs sm:text-sm rounded-md px-2 py-2.5 focus:outline-none focus:border-amber-600 appearance-none"
      >
        <option value="">All Levels</option>
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
      </select>
    </div>
  );
}
