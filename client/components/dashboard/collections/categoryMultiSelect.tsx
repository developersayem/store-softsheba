"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface ICategorySelectorProps {
  options: { _id: string; name: string }[];
  value?: string[]; // array of selected category IDs
  onChange: (val: string[]) => void;
  placeholder?: string;
}

export function CategoryMultiSelector({
  options,
  value = [],
  onChange,
  placeholder = "Select categories",
}: ICategorySelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptions = options.filter((opt) => value.includes(opt._id));

  const handleSelect = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start border">
          {selectedOptions.length > 0
            ? `${selectedOptions.length} categories selected`
            : placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0 capitalize" align="start">
        <Command>
          <CommandInput
            placeholder="Search categories..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList onWheel={(e) => e.stopPropagation()}>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => {
                const isSelected = value.includes(option._id);
                return (
                  <CommandItem
                    key={option._id}
                    onSelect={() => handleSelect(option._id)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected ? "bg-primary text-primary-foreground" : ""
                      )}
                    >
                      {isSelected && <Check />}
                    </div>
                    <span>{option.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
