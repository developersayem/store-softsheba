import { Info } from "lucide-react";
import { Order } from "./data";

interface Props {
  order: Order;
}

export default function InvoiceInfoPopover({ order }: Props) {
  return (
    <div className="relative group">
      {/* Info Icon */}
      <Info className="h-4 w-4 cursor-pointer hover:text-blue-500" />

      {/* Popover */}
      <div
        className="
          invisible group-hover:visible
          absolute left-0 top-6 z-50
          w-[420px]
          rounded-md border bg-background shadow-lg
          p-4 text-sm
        "
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold">
            Invoice No{" "}
            <span className="text-[#1E8896] dark:text-[#2ec4d6]">#{order.order_number}</span>
          </h4>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border text-xs">
            <thead className="bg-muted">
              <tr>
                <th className="border px-2 py-1 text-left">SL</th>
                <th className="border px-2 py-1 text-left">Product ID</th>
                <th className="border px-2 py-1 text-left">Product Name</th>
                <th className="border px-2 py-1 text-left">Qty</th>
              </tr>
            </thead>
            <tbody>
              {order?.items?.map((item, index: number) => (
                <tr key={index} className="text-[#1E8896] dark:text-[#2ec4d6]">
                  <td className="border px-2 py-1">{index + 1}</td>
                  <td className="border px-2 py-1">
                    {item._id}
                  </td>
                  <td className="border px-2 py-1">{item.name}</td>
                  <td className="border px-2 py-1">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
