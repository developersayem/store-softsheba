"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import { Button } from "@/components/ui/button";
import { ICustomer } from "@/types/order.type";

type Props = {
  customers: ICustomer[];
  onSelect: (customer: ICustomer) => void;
  onAddNew: (search: string) => void;
};

export default function CustomerSearch({
  customers,
  onSelect,
  onAddNew,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {search || "Search Customer"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-[300px]">
        <Command>
          <CommandInput
            placeholder="Search name or phone..."
            value={search}
            onValueChange={setSearch}
          />

          <div className="p-2 border-b bg-muted/50">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-9 text-xs border-dashed border-teal-600/50 hover:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/20"
              onClick={() => onAddNew(search)}
            >
              <span className="text-teal-600 font-bold">＋</span>
              Create New Customer
            </Button>
          </div>

          {filtered.length === 0 && (
            <CommandEmpty className="py-6 text-center text-muted-foreground">
              <p className="text-xs mb-2">No customer found</p>
              <Button
                variant="link"
                className="text-teal-600 p-0 h-auto text-xs"
                onClick={() => onAddNew(search)}
              >
                Add &quot;{search}&quot; as new customer
              </Button>
            </CommandEmpty>
          )}

          <CommandGroup>
            {filtered.map((customer) => (
              <CommandItem
                key={customer._id}
                onSelect={() => {
                  onSelect(customer);
                  setSearch(customer.phone);
                  setOpen(false);
                }}
              >
                {customer.full_name} ({customer.phone})
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
