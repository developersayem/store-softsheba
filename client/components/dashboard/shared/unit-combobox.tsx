import {
  Command,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandEmpty,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const units = [
  // Quantity
  { label: "Piece", value: "piece", group: "Quantity" },
  { label: "Set", value: "set", group: "Quantity" },
  { label: "Pair", value: "pair", group: "Quantity" },
  { label: "Box", value: "box", group: "Quantity" },
  { label: "Packet", value: "packet", group: "Quantity" },
  { label: "Dozen", value: "dozen", group: "Quantity" },

  // Weight
  { label: "Gram (g)", value: "g", group: "Weight" },
  { label: "Kilogram (kg)", value: "kg", group: "Weight" },
  { label: "Ton", value: "ton", group: "Weight" },
  { label: "Pound (lb)", value: "lb", group: "Weight" },
  { label: "Quintal", value: "quintal", group: "Weight" },

  // Volume
  { label: "Milliliter (ml)", value: "ml", group: "Volume" },
  { label: "Liter", value: "liter", group: "Volume" },

  // Length
  { label: "Millimeter (mm)", value: "mm", group: "Length" },
  { label: "Centimeter (cm)", value: "cm", group: "Length" },
  { label: "Meter", value: "meter", group: "Length" },
  { label: "Feet (ft)", value: "ft", group: "Length" },
  { label: "Inch", value: "inch", group: "Length" },

  // Area
  { label: "Square Feet (sq.ft)", value: "sqft", group: "Area" },
  { label: "Square Meter (sq.m)", value: "sqm", group: "Area" },

  // Time
  { label: "Minute", value: "min", group: "Time" },
  { label: "Hour", value: "hour", group: "Time" },
  { label: "Day", value: "day", group: "Time" },
  { label: "Month", value: "month", group: "Time" },
  { label: "Year", value: "year", group: "Time" },

  // Special
  { label: "Capsule", value: "capsule", group: "Special" },
  { label: "Tablet", value: "tablet", group: "Special" },
];

export function UnitCombobox({
  form,
  updateForm,
}: {
  form: { unit: string };
  updateForm: (patch: { unit: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = units.find((u) => u.value === form.unit);

  return (
    <div className="space-y-2">
      <Label>
        Unit
        <span className="text-muted-foreground text-xs">
          (required)
        </span>
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between text-muted-foreground"
          >
            {selected ? selected.label : "Select unit"}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] max-h-56 overflow-y-auto">
          <Command className="bg-accent w-full">
            <CommandInput placeholder="Search unit..." />
            <CommandEmpty>No matching unit.</CommandEmpty>

            {[
              "Quantity",
              "Weight",
              "Volume",
              "Length",
              "Area",
              "Time",
              "Special",
            ].map((group, idx) => {
              const groupItems = units.filter((u) => u.group === group);
              if (!groupItems.length) return null;

              return (
                <div key={group}>
                  <CommandGroup heading={group}>
                    {groupItems.map((unit) => (
                      <CommandItem
                        key={unit.value}
                        value={unit.value}
                        onSelect={() => {
                          updateForm({ unit: unit.value });
                          setOpen(false); // <-- CLOSE POPOVER HERE
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            form.unit === unit.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {unit.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  {idx !== 6 && <CommandSeparator />}
                </div>
              );
            })}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
