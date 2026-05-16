import * as React from "react"

import { cn } from "@/shared/lib/utils"

type TabsContextValue = {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function Tabs({
  className,
  value,
  defaultValue,
  onValueChange,
  ...props
}: React.ComponentProps<"div"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "")
  const selectedValue = value ?? internalValue
  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      setInternalValue(nextValue)
      onValueChange?.(nextValue)
    },
    [onValueChange]
  )

  return (
    <TabsContext.Provider
      value={{ value: selectedValue, onValueChange: handleValueChange }}
    >
      <div
        data-slot="tabs"
        className={cn("flex flex-col gap-4", className)}
        {...props}
      />
    </TabsContext.Provider>
  )
}

function TabsList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tabs-list"
      role="tablist"
      className={cn(
        "inline-flex h-10 w-fit items-center justify-center rounded-lg border border-border bg-card p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  value,
  ...props
}: React.ComponentProps<"button"> & { value: string }) {
  const context = useTabsContext()
  const isSelected = context.value === value

  return (
    <button
      data-slot="tabs-trigger"
      type="button"
      role="tab"
      aria-selected={isSelected}
      data-state={isSelected ? "active" : "inactive"}
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-md px-3 font-medium text-sm outline-none transition-[background-color,color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
        className
      )}
      onClick={() => context.onValueChange(value)}
      {...props}
    />
  )
}

function TabsContent({
  className,
  value,
  ...props
}: React.ComponentProps<"div"> & { value: string }) {
  const context = useTabsContext()

  if (context.value !== value) {
    return null
  }

  return (
    <div
      data-slot="tabs-content"
      role="tabpanel"
      className={cn("outline-none", className)}
      {...props}
    />
  )
}

function useTabsContext() {
  const context = React.useContext(TabsContext)

  if (!context) {
    throw new Error("Tabs components must be used inside Tabs")
  }

  return context
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
