import { cn } from "@/utils/styling";
import React from "react";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {};
const IconButton = ({ className, children, ...props }: IconButtonProps) => {
  return <button className={cn('text-3xl transition-all duration-300 hover:text-white shadow-lg hover:scale-110 text-brown-main',className)} {...props}>{children}</button>;
};

export default IconButton;
