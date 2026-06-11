import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/shared/lib/utils"

function Switch({ className, children, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input p-0.5 outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 data-[disabled]:cursor-not-allowed data-[checked]:bg-primary data-[unchecked]:bg-input data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {children ?? (
        <SwitchPrimitive.Thumb
          data-slot="switch-thumb"
          className="block size-5 rounded-full bg-background shadow-xs transition-transform data-[checked]:translate-x-4 data-[unchecked]:translate-x-0 rtl:data-[checked]:-translate-x-4"
        />
      )}
    </SwitchPrimitive.Root>
  )
}

export { Switch }
