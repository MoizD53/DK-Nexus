"use client";

import { useTransition, useState } from "react";
import { addWeightAction } from "./actions";
import { FormField } from "@/components/ui/FormField";

export function WeightForm() {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await addWeightAction(formData);
        setIsOpen(false);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      }
    });
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-3 bg-stone-900 border border-stone-800 rounded-lg text-sm font-medium text-amber-500 hover:bg-stone-800 transition-colors"
      >
        + Record Weight
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Log New Weight</h3>
      
      {error && (
        <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <FormField label="Weight (kg)" name="weight" type="number" step="0.1" required />
        </div>
        <div className="flex-[2]">
          <FormField label="Notes (optional)" name="notes" placeholder="How did you feel?" />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button 
          type="button" 
          onClick={() => setIsOpen(false)}
          className="px-4 py-2 text-sm font-medium text-stone-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isPending}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
