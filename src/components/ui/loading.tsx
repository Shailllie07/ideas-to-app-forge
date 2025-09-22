import * as React from "react";
import { Plane, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ size = "md", className }, ref) => {
    const sizeClasses = {
      sm: "w-6 h-6",
      md: "w-8 h-8", 
      lg: "w-12 h-12"
    };

    return (
      <div 
        ref={ref}
        className={cn("flex items-center justify-center", className)}
      >
        <div className="relative">
          <Plane 
            className={cn(
              "text-primary animate-bounce",
              sizeClasses[size]
            )}
          />
          <MapPin 
            className={cn(
              "text-secondary absolute -bottom-1 -right-1 animate-pulse",
              size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-6 h-6"
            )}
          />
        </div>
      </div>
    );
  }
);

Loading.displayName = "Loading";

export { Loading };