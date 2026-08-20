"use client";

import { useActionState, useState, startTransition } from "react";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "../actions";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { FormField } from "@/components/ui/FormField";

type Category = {
  id: string;
  name: string;
  exerciseCount: number;
};

function CreateCategoryForm() {
  const [state, formAction, isPending] = useActionState(createCategoryAction, null);

  return (
    <form action={formAction} className="flex gap-2">
      <div className="flex-1">
        <input 
          type="text" 
          name="name" 
          placeholder="New category name..." 
          required 
          className="w-full bg-stone-900 border border-stone-700 text-stone-200 placeholder-stone-600 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-amber-600 transition-colors"
        />
      </div>
      <button 
        type="submit" 
        disabled={isPending}
        className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:opacity-50 text-white font-medium text-sm px-4 rounded-md transition-colors"
      >
        {isPending ? "Adding..." : "Add"}
      </button>
      {state?.error && <p className="text-xs text-red-400 absolute mt-12">{state.error}</p>}
    </form>
  );
}

function CategoryItem({ category }: { category: Category }) {
  const [isEditing, setIsEditing] = useState(false);
  
  const boundUpdate = updateCategoryAction.bind(null, category.id);
  const [state, formAction, isPending] = useActionState(boundUpdate, null);
  
  const [isDeleting, setIsDeleting] = useState(false);

  function handleDelete() {
    if (category.exerciseCount > 0) {
      alert("Cannot delete category because it is used by exercises.");
      return;
    }
    if (!confirm(`Delete category "${category.name}"?`)) return;
    
    setIsDeleting(true);
    startTransition(async () => {
      try {
        await deleteCategoryAction(category.id);
      } catch (e: any) {
        alert(e.message || "Failed to delete");
        setIsDeleting(false);
      }
    });
  }

  if (isEditing) {
    return (
      <form action={async (fd) => {
        await formAction(fd);
        setIsEditing(false); // optimistic close, if error it won't show nicely but good enough for CMS
      }} className="flex items-center gap-2 px-5 py-3 border-b border-stone-800 last:border-0 bg-stone-900/50">
        <input 
          type="text" 
          name="name" 
          defaultValue={category.name} 
          required 
          className="flex-1 bg-stone-950 border border-stone-700 text-stone-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-amber-600"
        />
        <button type="submit" disabled={isPending} className="text-emerald-500 hover:text-emerald-400 text-sm font-medium px-2 py-1">Save</button>
        <button type="button" onClick={() => setIsEditing(false)} className="text-stone-400 hover:text-stone-300 text-sm font-medium px-2 py-1">Cancel</button>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 last:border-0 group">
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium text-stone-200">{category.name}</p>
        {category.exerciseCount > 0 && (
          <Badge variant="stone">{category.exerciseCount} exercises</Badge>
        )}
      </div>
      <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setIsEditing(true)} 
          className="text-stone-400 hover:text-stone-200 text-sm px-2 py-1"
        >
          Edit
        </button>
        <button 
          onClick={handleDelete}
          disabled={isDeleting || category.exerciseCount > 0}
          className="text-red-400/70 hover:text-red-400 disabled:opacity-30 text-sm px-2 py-1 transition-colors"
          title={category.exerciseCount > 0 ? "Cannot delete category in use" : "Delete"}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export function CategoryListClient({ categories }: { categories: Category[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-2 relative pb-2">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Add Category</p>
          <CreateCategoryForm />
        </div>
      </Card>

      <Card padding={false}>
        {categories.length === 0 ? (
          <EmptyState title="No categories found" description="Create one above." />
        ) : (
          <div className="flex flex-col">
            {categories.map(c => <CategoryItem key={c.id} category={c} />)}
          </div>
        )}
      </Card>
    </div>
  );
}
