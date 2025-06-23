import React from "react";
import Button from "./Button";

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  fields: React.ReactNode;
  actions?: React.ReactNode;
  error?: string | null;
  success?: string | null;
  className?: string;
  loading?: boolean;
}

const Form = ({
  fields,
  actions,
  error,
  success,
  className = "",
  loading,
  ...props
}: FormProps) => (
  <form
    className={`space-y-4 w-full p-8 min-w-[500px] ${className}`}
    {...props}
  >
    {fields}
    {error && <div className="text-red-400">{error}</div>}
    {success && <div className="text-green-400">{success}</div>}
    {actions}
    {!actions && (
      <Button
        type="submit"
        variant="success"
        disabled={loading}
        className="w-full"
      >
        {loading ? "Guardando..." : "Guardar"}
      </Button>
    )}
  </form>
);

export default Form;