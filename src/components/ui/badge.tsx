
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
        purple: 
          "border-transparent bg-[#E5DEFF] text-[#8B5CF6] hover:bg-[#D6BCFA]",
        pink: 
          "border-transparent bg-[#FFDEE2] text-[#D946EF] hover:bg-[#FEC6A1]",
        blue: 
          "border-transparent bg-[#D3E4FD] text-[#0EA5E9] hover:bg-[#D3E4FD]/80",
        green: 
          "border-transparent bg-[#F2FCE2] text-[#6E59A5] hover:bg-[#F2FCE2]/80",
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
