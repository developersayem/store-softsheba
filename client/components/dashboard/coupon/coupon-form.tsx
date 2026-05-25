"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ICoupon } from "@/types/coupon.type";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ProductsSelector } from "@/components/shared/products-selector";

interface CouponFormProps {
  initialData?: Partial<ICoupon>;
  onSubmit: (data: FormData) => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function CouponForm({
  initialData = {},
  onSubmit,
  submitLabel = "Save",
  isLoading,
}: CouponFormProps) {
  const [code, setCode] = React.useState(initialData.code || "");

  const [discountType, setDiscountType] = React.useState<
    ICoupon["discount_type"]
  >(initialData.discount_type || "flat");
  const [discount, setDiscount] = React.useState(initialData.discount || 0);
  const [minPurchase, setMinPurchase] = React.useState<number | "">(
    initialData.min_purchase ?? ""
  );
  const [startDate, setStartDate] = React.useState(
    initialData.start_date
      ? new Date(initialData.start_date).toISOString().slice(0, 16)
      : ""
  );
  const [endDate, setEndDate] = React.useState(
    initialData.end_date
      ? new Date(initialData.end_date).toISOString().slice(0, 16)
      : ""
  );
  const [productsIds, setProductsIds] = React.useState<string[]>(
    initialData.products || []
  );
  const [isActive, setIsActive] = React.useState(initialData.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("code", code);
    data.append("discount_type", discountType);
    data.append("discount", String(discount));
    if (minPurchase !== "") data.append("min_purchase", String(minPurchase));
    data.append("start_date", startDate);
    data.append("end_date", endDate);
    data.append("products", JSON.stringify(productsIds));
    data.append("isActive", String(isActive));

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Coupon Code */}
      <div className="space-y-2">
        <Label>Code</Label>
        <Input
          placeholder="SUMMER20"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          required
        />
      </div>

      {/* Discount */}
      <div className="grid grid-cols-2 gap-4">
        {/* Discount Type */}
        <div className="w-full space-y-2">
          <Label>Discount Type</Label>
          <Select
            value={discountType}
            onValueChange={(val: ICoupon["discount_type"]) =>
              setDiscountType(val)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flat">Flat</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Discount Amount */}
        <div className="w-full space-y-2">
          <Label>
            Discount {discountType === "percentage" ? "(%)" : "(amount)"}
          </Label>
          <Input
            type="number"
            placeholder={discountType === "percentage" ? "0 - 100" : "Amount"}
            value={discount || ""}
            onChange={(e) => setDiscount(Number(e.target.value))}
            min={discountType === "percentage" ? 1 : 1}
            max={discountType === "percentage" ? 100 : undefined}
            required
          />
        </div>
      </div>

      {/* Minimum Purchase */}
      <div className="space-y-2">
        <Label>Minimum Purchase (optional)</Label>
        <Input
          type="number"
          placeholder="e.g. 1000"
          value={minPurchase}
          onChange={(e) =>
            setMinPurchase(e.target.value === "" ? "" : Number(e.target.value))
          }
          min={0}
        />
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Products Multi-select */}
      <div className="space-y-2">
        <Label>Products</Label>
        <ProductsSelector
          value={productsIds}
          onChange={(val) => setProductsIds(val)}
        />
      </div>

      {/* Active Toggle */}
      <div className="flex items-center justify-between">
        <Label>Active</Label>
        <Switch
          checked={isActive}
          onCheckedChange={(val) => setIsActive(val)}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <Button size="sm" type="submit" loading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
