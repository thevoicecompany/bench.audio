/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

const inputs = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
];

export function Combobox({
  //   inputs,
  onChange,
  searchLabel,
  selectLabel,
}: {
  inputs: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  searchLabel: string;
  selectLabel: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  console.log({ inputs });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value ? inputs?.find((i) => i.value === value)?.label : selectLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={searchLabel} />
          <CommandEmpty>Not found.</CommandEmpty>
          <CommandGroup>
            {/* {inputs?.map((i) => (
              <CommandItem
                key={i.value}
                value={i.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  onChange(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === i.value ? "opacity-100" : "opacity-0",
                  )}
                />
                {i.label}
              </CommandItem>
            ))} */}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
