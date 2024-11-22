import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  color = "text-blue-500",
  className = "",
}) => {
  const sizeVariants = {
    sm: "w-6 h-6 border-[2px]",
    md: "w-10 h-10 border-[3px]",
    lg: "w-14 h-14 border-[4px]",
  };

  return (
    <div
      className={`flex justify-center items-center min-h-[200px] ${className}`}
      aria-label="Loading"
      role="status"
    >
      <div
        className={`
          ${sizeVariants[size]} 
          ${color} 
          rounded-full 
          border-transparent 
          border-t-current 
          animate-spin
          shadow-md
          hover:shadow-lg
          transition-all
          duration-300
          ease-in-out
        `}
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};
