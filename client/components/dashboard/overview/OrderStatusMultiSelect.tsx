import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";

export default function OrderStatusMultiSelect({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const ORDER_STATUS_OPTIONS = [
    { label: "Pending", value: "pending" },
    { label: "On Hold", value: "on hold" },
    { label: "Approved", value: "approved" },
    { label: "Processing", value: "processing" },
    { label: "Ready To Ship", value: "ready to ship" },
    { label: "In-Transit", value: "in-transit" },
    { label: "Delivered Payment Due", value: "delivered-payment-due" },
    {
      label: "Delivered Payment Collected",
      value: "delivered-payment-collected",
    },
    { label: "Cancelled", value: "cancelled" },
    { label: "Pending Returned", value: "pending-returned" },
    { label: "Returned", value: "returned" },
    { label: "Damaged", value: "damaged" },
  ];
  const allSelected = value.length === ORDER_STATUS_OPTIONS.length;

  const toggleAll = () => {
    onChange(allSelected ? [] : ORDER_STATUS_OPTIONS.map((o) => o.value));
  };

  const toggleOne = (val: string) => {
    onChange(
      value.includes(val) ? value.filter((v) => v !== val) : [...value, val],
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center justify-between w-full h-9 px-2 text-xs border rounded-md">
          Order Status
          <ChevronDown className="w-4 h-4" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[220px] p-2">
        {/* Select All */}
        <div className="flex items-center gap-2 py-1">
          <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
          <span className="text-sm font-medium">Select All</span>
        </div>

        <div className="border-t my-2" />

        {/* Options */}
        <div className="space-y-1  overflow-y-auto">
          {ORDER_STATUS_OPTIONS.map((opt) => (
            <div key={opt.value} className="flex items-center gap-2 py-1">
              <Checkbox
                checked={value.includes(opt.value)}
                onCheckedChange={() => toggleOne(opt.value)}
              />
              <span className="text-sm">{opt.label}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
