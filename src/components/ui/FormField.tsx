import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | number;
  error?: string;
  hint?: string;
  children?: ReactNode; // for select
  min?: string | number;
  max?: string | number;
  step?: string | number;
  autoComplete?: string;
}

export function FormField({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
  error,
  hint,
  children,
  min,
  max,
  step,
  autoComplete,
}: FormFieldProps) {
  const inputClass = `w-full bg-stone-900 border ${
    error ? "border-red-500/60" : "border-stone-700"
  } text-stone-200 placeholder-stone-600 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-amber-600 transition-colors`;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-xs font-medium text-stone-400 uppercase tracking-widest"
      >
        {label}
        {required && <span className="text-amber-500 ml-0.5">*</span>}
      </label>

      {children ? (
        <select
          id={name}
          name={name}
          required={required}
          defaultValue={defaultValue ?? ""}
          className={inputClass}
        >
          {children}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue ?? ""}
          min={min}
          max={max}
          step={step}
          autoComplete={autoComplete}
          className={inputClass}
        />
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-stone-500">{hint}</p>}
    </div>
  );
}
