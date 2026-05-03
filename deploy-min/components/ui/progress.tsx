import * as React from "react";

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number;
  }
>(({ className, value = 0, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ${className || ""}`}
    {...props}
  >
    <div
      className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all"
      style={{ width: `${value}%` }}
    />
  </div>
));
Progress.displayName = "Progress";

export { Progress };
