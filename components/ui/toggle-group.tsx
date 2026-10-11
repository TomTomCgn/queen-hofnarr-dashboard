"use client";

import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn("inline-flex w-fit items-center rounded-md border shadow-xs", className)}
      {...props}
    />
  );
}

function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        "inline-flex h-9 min-w-0 flex-1 items-center justify-center px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none first:rounded-l-md last:rounded-r-md border-l first:border-l-0 hover:bg-muted hover:text-muted-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:z-10 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[state=on]:font-semibold",
        className,
      )}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
