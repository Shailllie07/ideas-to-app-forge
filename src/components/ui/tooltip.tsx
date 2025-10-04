import * as React from "react";
import { cn } from "@/lib/utils";

// Fallback tooltip shim to avoid runtime issues if Radix tooltip misbundles React
// This no-op implementation preserves structure without rendering a tooltip

const TooltipProvider: React.FC<{ children: React.ReactNode; delayDuration?: number }> = ({ children }) => <>{children}</>;

const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

const TooltipTrigger = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"span"> & { asChild?: boolean }>(
  ({ asChild, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, { ref, ...props });
    }
    return (
      <span ref={ref as any} {...props}>
        {children}
      </span>
    );
  },
);
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { side?: "left" | "right" | "top" | "bottom"; align?: "start" | "center" | "end" }
>(({ className, ...props }, ref) => {
  // Intentionally render nothing in fallback to prevent crashes
  return null;
});
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
