import React from "react";
import Button from "./Button";

export interface ListField<T> {
  label: string;
  name: keyof T & string;
  type?: "text" | "number" | "textarea" | "file" | "select" | "multiselect" | "color" | "date";
  options?: { label: string; value: string | number }[];
  required?: boolean;
  className?: string;
}

interface FormProps<T> {
  fields: ListField<T>[];
  values: Partial<T>;
  onChange: (updated: Partial<T>) => void;
  onSubmit: (data: T) => void;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
  actions?: React.ReactNode;
  submitLabel?: string;
  className?: string;
}

function Form<T>({
  fields,
  values,
  onChange,
  onSubmit,
  loading,
  error,
  success,
  actions,
  submitLabel = "Guardar",
  className = "",
}: FormProps<T>) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onChange({ [name]: value } as Partial<T>);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      onChange({ [name]: files[0] } as Partial<T>);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values as T);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 w-full p-8 min-w-[500px] bg-gray-800 rounded shadow ${className}`}
    >
      {fields.map((field, i) => (
        <div key={i}>
          <label className="block text-sm font-medium text-gray-200">
            {field.label}
          </label>

          {field.type === "multiselect" && field.options ? (
            <select
              name={field.name}
              multiple
              value={(values[field.name] as any[]) || []}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions).map(
                  (opt) => (typeof opt.value === "string" && !isNaN(Number(opt.value)) ? Number(opt.value) : opt.value)
                );
                onChange({ [field.name]: selectedOptions } as Partial<T>);
              }}
              required={field.required}
              className={`mt-1 w-full rounded border border-gray-700 bg-gray-900 text-gray-100 px-3 py-2 ${field.className || ""}`}
            >
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : field.type === "color" ? (
            <div className="mt-1 flex items-center gap-4">
              <input
                name={field.name}
                type="color"
                value={values[field.name] as string || "#000000"}
                onChange={handleChange}
                required={field.required}
                className={`h-10 w-16 rounded border border-gray-700 bg-gray-900 ${field.className || ""}`}
              />
              <span className="text-sm text-gray-100">
                {(values[field.name] as string) || "#000000"}
              </span>
            </div>
          ) : field.type === "date" ? (
            <input
              name={field.name}
              type="date"
              value={
                values[field.name] instanceof Date
                  ? (values[field.name] as Date).toISOString().split("T")[0]
                  : (values[field.name] as string || "")
              }
              onChange={(e) => {
                const { name, value } = e.target;
                onChange({ [name]: new Date(value) } as Partial<T>);
              }}
              required={field.required}
              className={`mt-1 w-full rounded border border-gray-700 bg-gray-900 text-gray-100 px-3 py-2 ${field.className || ""}`}
            />
          ) : field.type === "textarea" ? (
            <textarea
              name={field.name}
              value={values[field.name] as string || ""}
              onChange={handleChange}
              required={field.required}
              className={`mt-1 w-full rounded border border-gray-700 bg-gray-900 text-gray-100 px-3 py-2 resize-none ${field.className || ""}`}
            />
          ) : field.type === "file" ? (
            <input
              name={field.name}
              type="file"
              onChange={handleFileChange}
              required={field.required}
              className={`mt-1 w-full rounded border border-gray-700 bg-gray-900 text-gray-100 px-3 py-2 ${field.className || ""}`}
            />
          ) : field.type === "select" && field.options ? (
            <select
              name={field.name}
              value={values[field.name] as string | number || ""}
              onChange={handleChange}
              required={field.required}
              className={`mt-1 w-full rounded border border-gray-700 bg-gray-900 text-gray-100 px-3 py-2 ${field.className || ""}`}
            >

              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              name={field.name}
              type={field.type || "text"}
              value={values[field.name] as string | number || ""}
              onChange={handleChange}
              required={field.required}
              className={`mt-1 w-full rounded border border-gray-700 bg-gray-900 text-gray-100 px-3 py-2 ${field.className || ""}`}
            />
          )}
        </div>
      ))}

      {error && <div className="text-red-400">{error}</div>}
      {success && <div className="text-green-400">{success}</div>}

      {actions ?? (
        <Button
          type="submit"
          variant="success"
          disabled={loading}
          className="w-full"
        >
          {loading ? "Guardando..." : submitLabel}
        </Button>
      )}
    </form>
  );
}

export default Form;
