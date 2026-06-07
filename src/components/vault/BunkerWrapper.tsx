import React from "react";
import { cn } from "@/lib/utils";

interface BunkerWrapperProps {
  children: React.ReactNode;
  className?: string;
  variant?: "orange" | "green" | "amber" | "blue";
}

export const BunkerWrapper: React.FC<BunkerWrapperProps> = ({
  children,
  className,
  variant = "orange",
}) => {
  const variantClass = {
    orange: "",
    green: "bunker-green",
    amber: "bunker-amber",
    blue: "bunker-blue",
  }[variant];

  return (
    <div className={cn("bunker min-h-screen relative overflow-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground", variantClass, className)}>
      {/* Background Noise */}
      <div className="absolute inset-0 bunker-noise pointer-events-none" />
      
      {/* Scanlines Overlay */}
      <div className="absolute inset-0 bunker-scanlines pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Retro HUD Border */}
      <div className="fixed inset-4 border border-primary/20 pointer-events-none z-20">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary" />
      </div>
    </div>
  );
};
