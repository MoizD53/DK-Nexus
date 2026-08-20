"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface CategoryFilterProps {
  categories: { id: string; name: string }[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  function setCategory(name: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (name) {
      params.set("category", name);
    } else {
      params.delete("category");
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex overflow-x-auto pb-2 -mb-2 hide-scrollbar gap-2 snap-x">
      <button
        onClick={() => setCategory(null)}
        className={`shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
          !currentCategory 
            ? "bg-amber-600 border-amber-600 text-white" 
            : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700"
        }`}
      >
        All Exercises
      </button>
      
      {categories.map(c => (
        <button
          key={c.id}
          onClick={() => setCategory(c.name)}
          className={`shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
            currentCategory === c.name 
              ? "bg-amber-600 border-amber-600 text-white" 
              : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700"
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
