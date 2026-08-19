import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

const Select = SelectPrimitive.Root

function SelectGroup({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props} />
  );
}

function SelectValue({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn(
        "min-w-0 flex-1 truncate text-left",
        className
      )}
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        [
          // Layout
          "flex w-full items-center justify-between",
          "gap-2",

          // Size
          "h-10 px-3",

          // Appearance
          "rounded-md border border-input",
          "bg-background text-sm",
          "shadow-sm",

          // Text
          "whitespace-nowrap",

          // Interaction
          "transition-colors",
          "outline-none",
          "select-none",

          // Focus
          "focus-visible:border-ring",
          "focus-visible:ring-2",
          "focus-visible:ring-ring/30",

          // Disabled
          "disabled:cursor-not-allowed",
          "disabled:opacity-50",

          // Placeholder
          "data-placeholder:text-muted-foreground",

          // Selected value
          "[&_[data-slot=select-value]]:min-w-0",
          "[&_[data-slot=select-value]]:flex-1",
          "[&_[data-slot=select-value]]:truncate",

          // Icons
          "[&_svg]:pointer-events-none",
          "[&_svg]:shrink-0",
          "[&_svg:not([class*='size-'])]:size-4",

          // Dark mode
          "dark:bg-input/30",
          "dark:hover:bg-input/50",
        ].join(" "),
        className
      )}
      {...props}
    >
      {children}

      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon
            className="pointer-events-none size-4 shrink-0 text-muted-foreground"
          />
        }
      />
    </SelectPrimitive.Trigger>
  );
}
function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-[100]"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            [
              "relative isolate z-[100]",

              // Width
              "w-[var(--anchor-width)]",
              "min-w-[180px]",

              // Height
              "max-h-[300px]",

              // Appearance
              "overflow-x-hidden overflow-y-auto",
              "rounded-md",
              "border border-border",
              "bg-popover",
              "text-popover-foreground",
              "shadow-lg",

              // Animation
              "origin-(--transform-origin)",
              "duration-100",

              "data-open:animate-in",
              "data-open:fade-in-0",
              "data-open:zoom-in-95",
              "data-closed:animate-out",
              "data-closed:fade-out-0",
              "data-closed:zoom-out-95",
            ].join(" "),
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />

          <SelectPrimitive.List className="p-1">
            {children}
          </SelectPrimitive.List>

          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props} />
  );
}

function SelectItem({
  className,
  children,
  ...props
}) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        [
          "relative flex w-full cursor-default",
          "items-center",

          // Spacing
          "min-h-10",
          "gap-2",
          "rounded-md",
          "py-2",
          "pr-9",
          "pl-3",

          // Text
          "text-sm",
          "leading-5",
          "outline-none",
          "select-none",

          // Hover / focus
          "focus:bg-accent",
          "focus:text-accent-foreground",

          // Disabled
          "data-disabled:pointer-events-none",
          "data-disabled:opacity-50",

          // Icons
          "[&_svg]:pointer-events-none",
          "[&_svg]:shrink-0",
          "[&_svg:not([class*='size-'])]:size-4",
        ].join(" "),
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="min-w-0 flex-1 truncate">
        {children}
      </SelectPrimitive.ItemText>

      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-3 flex size-4 items-center justify-center">
            <CheckIcon className="size-4" />
          </span>
        }
      />
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props} />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}>
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}>
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
