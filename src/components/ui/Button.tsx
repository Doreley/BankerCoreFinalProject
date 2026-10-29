import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  ariaLabel?: string;
};

export function Button({ children, className = "", onClick, disabled = false, type = "button", ariaLabel }: ButtonProps) {
  return (
    <button aria-label={ariaLabel} className={`button ${className}`} disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  );
}