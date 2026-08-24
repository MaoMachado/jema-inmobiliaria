"use client";

type TypeButton = "button" | "submit" | "reset";
type VarianButton = "primary" | "secondary" | "warning" | "danger";

interface Props {
  title: string;
  type?: TypeButton;
  variant?: VarianButton;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  ariaLabel?: string;
  onClick?: () => void;
}

export default function Button({
  title,
  type = "button",
  variant = "primary",
  className,
  disabled = false,
  loading = false,
  ariaLabel,
  onClick = () => {},
}: Props) {
  const variantStyle = {
    primary: "bg-blue-800/50 text-blue-200 hover:bg-blue-800/70 hover:shadow",
    secondary: "bg-slate-500/50 hover:bg-slate-500/70 hover:shadow",
    warning: "bg-orange-500/50 hover:bg-orange-500/70 hover:shadow",
    danger: "bg-red-500/50 hover:bg-red-500/70 hover:shadow",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-busy={loading}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      className={`px-3 py-1 rounded-md cursor-pointer hover:scale-105 transition-all disabled:cursor-not-allowed disabled:bg-gray-800/30 disabled:opacity-50 ${variantStyle[variant]} ${className}`}
    >
      {title}
    </button>
  );
}
