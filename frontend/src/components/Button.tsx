import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "success" | "danger" | "info";
  as?: React.ElementType;
  to?: string;
};

const baseStyles =
  "rounded-3xl px-4 py-2 font-semibold shadow focus:outline-none focus:ring transition-transform duration-200 ease-in-out";

const variants = {
  primary: "bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white focus:ring-blue-500",
  success: "bg-green-600 hover:bg-green-700 hover:scale-105 text-white focus:ring-green-500",
  danger: "bg-red-600 hover:bg-red-700 hover:scale-105 text-white focus:ring-red-500",
  info: "bg-cyan-600 hover:bg-cyan-700 hover:scale-105 text-white focus:ring-cyan-500",
};

export const Button = ({
  variant = "primary",
  className = "",
  children,
  as: Component = "button",
  ...props
}: ButtonProps) => (
  <Component
    className={`${baseStyles} ${variants[variant]} ${className}`}
    {...props}
  >
    {children}
  </Component>
);

export default Button;