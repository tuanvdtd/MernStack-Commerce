import { cn } from "~/lib/utils"
import { adminBrandTextClass } from "~/lib/admin/ui"

type StepId = "spu" | "skus"

type ProductFormStepperProps = {
  activeStep: StepId
  skuCount: number
  onStepClick?: (step: StepId) => void
}

const STEPS: { id: StepId; label: string; hint: string }[] = [
  { id: "spu", label: "SPU information", hint: "Name, category, variant axes" },
  { id: "skus", label: "SKU variants", hint: "Code, price, stock" },
]

export const ProductFormStepper = ({
  activeStep,
  skuCount,
  onStepClick,
}: ProductFormStepperProps) => (
  <nav aria-label="Product editing steps" className="w-full">
    <ol className="grid grid-cols-2 gap-3 sm:gap-4">
      {STEPS.map((step, index) => {
        const isActive = step.id === activeStep

        return (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => onStepClick?.(step.id)}
              className={cn(
                "flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/30 sm:p-4",
                isActive
                  ? "border-[var(--admin-brand)]/40 bg-[var(--admin-brand)]/8 ring-1 ring-[var(--admin-brand)]/20"
                  : "border-border bg-background"
              )}
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isActive
                    ? "bg-[var(--admin-brand)] text-[var(--admin-brand-foreground)]"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </span>
              <span className="min-w-0 space-y-0.5">
                <span
                  className={cn(
                    "block text-sm font-medium leading-tight",
                    isActive && adminBrandTextClass
                  )}
                >
                  {step.label}
                  {step.id === "skus" && skuCount > 0 ? (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      ({skuCount})
                    </span>
                  ) : null}
                </span>
                <span className="block text-xs leading-relaxed text-muted-foreground">
                  {step.hint}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  </nav>
)
