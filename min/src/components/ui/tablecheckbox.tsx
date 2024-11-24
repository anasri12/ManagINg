"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "@/app/utils/tailwind";
import { CheckIcon } from "@radix-ui/react-icons";

const TableCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-6 w-6 shrink-0 rounded-md border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-red-600 data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <CheckIcon className="h-6 w-6" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
TableCheckbox.displayName = CheckboxPrimitive.Root.displayName;

export { TableCheckbox };