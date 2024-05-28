import { cn } from "@/utils/styling";
import React from "react";
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  variants?:'primary' | 'secondary' | 'tertiary'
};
const Button = ({ isLoading,variants, className, children, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        "p-3 bg-brown-main text-black shadow-xl hover:bg-green-500 transition-colors hover:shadow-md rounded-lg text-2xl",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
