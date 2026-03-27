import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        ghost: "border-transparent bg-transparent text-muted-foreground hover:bg-accent", // Added ghost variant
        // Custom category variants — all unified to brand orange
        basketball: "border-transparent bg-brand text-white hover:bg-brand/90",
        soccer:     "border-transparent bg-brand text-white hover:bg-brand/90",
        swimming:   "border-transparent bg-brand text-white hover:bg-brand/90",
        tennis:     "border-transparent bg-brand text-white hover:bg-brand/90",
        baseball:   "border-transparent bg-brand text-white hover:bg-brand/90",
        athletics:  "border-transparent bg-brand text-white hover:bg-brand/90",
        football:   "border-transparent bg-brand text-white hover:bg-brand/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }