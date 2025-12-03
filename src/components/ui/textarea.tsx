import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: boolean;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, id, name, label, error, helperText, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const textareaId = id || name || React.useId();
    
    const handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      props.onFocus?.(event);
    };
    
    const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      props.onBlur?.(event);
    };
    
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasValue(event.target.value.length > 0);
      props.onChange?.(event);
    };

    return (
      <div className="relative w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              "absolute left-3 transition-all duration-200 pointer-events-none bg-background px-1 z-10",
              isFocused || hasValue
                ? "text-xs text-primary top-0"
                : "text-sm text-muted-foreground top-3"
            )}
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          name={name || textareaId}
          className={cn(
            "flex min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-200",
            label && "pt-6",
            error && "border-destructive focus-visible:ring-destructive",
            isFocused && "shadow-lg shadow-primary/10 scale-[1.01]",
            className,
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        {helperText && (
          <p className={cn(
            "text-xs mt-1 transition-colors duration-200",
            error ? "text-destructive" : "text-muted-foreground"
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
