"use client"

import type React from "react"
import { forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import styles from "./button.module.css"

const buttonVariants = cva(styles.button, {
  variants: {
    variant: {
      default: styles.default,
      outline: styles.outline,
      ghost: styles.ghost,
      link: styles.link,
    },
    size: {
      default: styles.sizeDefault,
      sm: styles.sizeSm,
      lg: styles.sizeLg,
      icon: styles.sizeIcon,
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = "button"

    return <Comp className={`${buttonVariants({ variant, size })} ${className || ""}`} ref={ref} {...props} />
  },
)

Button.displayName = "Button"

export { Button, buttonVariants }
