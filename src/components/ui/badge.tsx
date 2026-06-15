import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Badge — A small inline status indicator, used for grades in the Broadsheet
// ---------------------------------------------------------------------------

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        // Grade-specific badge variants for the Nigerian WAEC scale
        excellent:
          "border-transparent bg-emerald-100 text-emerald-800",
        good:
          "border-transparent bg-green-100 text-green-800",
        credit:
          "border-transparent bg-amber-100 text-amber-800",
        pass:
          "border-transparent bg-orange-100 text-orange-800",
        fail:
          "border-transparent bg-red-100 text-red-800",
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

/**
 * Maps a WAEC grade string (A1, B2, etc.) to the correct Badge variant
 */
function getGradeBadgeVariant(grade: string): BadgeProps["variant"] {
  switch (grade) {
    case "A1":
      return "excellent"
    case "B2":
    case "B3":
      return "good"
    case "C4":
    case "C5":
    case "C6":
      return "credit"
    case "D7":
    case "E8":
      return "pass"
    case "F9":
      return "fail"
    default:
      return "default"
  }
}

export { Badge, badgeVariants, getGradeBadgeVariant }
