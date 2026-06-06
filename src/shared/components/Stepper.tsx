import { motion, useReducedMotion } from "framer-motion"
import { CheckIcon, LoaderCircleIcon } from "lucide-react"

import { cn } from "@/shared/lib/utils"

export type StepperStep = {
  id: string
  label: string
  description?: string
}

type StepperProps = {
  activeStep: number
  className?: string
  steps: StepperStep[]
}

export function Stepper({ activeStep, className, steps }: StepperProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <ol className={cn("flex flex-col", className)} role="list">
      {steps.map((step, index) => {
        const state: "completed" | "active" | "pending" =
          index < activeStep
            ? "completed"
            : index === activeStep
              ? "active"
              : "pending"

        return (
          <li
            className="relative flex gap-4"
            key={step.id}
            {...(state === "active" ? { "aria-current": "step" } : {})}
          >
            {index !== steps.length - 1 && (
              <div
                aria-hidden="true"
                className={cn(
                  "absolute top-9 left-4 -translate-x-1/2 h-[calc(100%-2rem)] w-px transition-colors duration-300",
                  state === "completed" ? "bg-primary" : "bg-border"
                )}
              />
            )}

            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300",
                state === "completed" &&
                  "border-primary bg-primary text-primary-foreground",
                state === "active" &&
                  "border-primary bg-primary/10 text-primary",
                state === "pending" &&
                  "border-border bg-card text-muted-foreground"
              )}
            >
              {state === "completed" ? (
                <CheckIcon aria-hidden="true" className="size-4" />
              ) : state === "active" ? (
                <motion.span
                  animate={shouldReduceMotion ? {} : { rotate: 360 }}
                  transition={{
                    duration: 2,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                >
                  <LoaderCircleIcon aria-hidden="true" className="size-4" />
                </motion.span>
              ) : (
                <span className="text-xs">{index + 1}</span>
              )}
            </span>

            <motion.div
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-0.5 pb-8 pt-1"
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: index > activeStep + 1 ? 0.5 : 0,
                      x: -6,
                    }
              }
              transition={{ delay: index * 0.04, duration: 0.24 }}
            >
              <span
                className={cn(
                  "font-medium text-sm leading-snug transition-colors duration-300",
                  state === "completed" && "text-foreground",
                  state === "active" && "text-primary",
                  state === "pending" && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
              {step.description && (
                <span
                  className={cn(
                    "text-xs leading-relaxed transition-colors duration-300",
                    state === "active"
                      ? "text-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  {step.description}
                </span>
              )}
            </motion.div>
          </li>
        )
      })}
    </ol>
  )
}
