"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Icon } from "@iconify/react";
import { IShippingRule, IShippingArea } from "@/types/shipping_rule.type";
/* ---------------- FORM TYPES (UI ONLY) ---------------- */

type WeightRangeForm = {
  min: string;
  max: string;
  charge: string;
};

type ShippingAreaForm = {
  name: string;
  type: "flat_rate" | "free_shipping" | "rate_by_weight";
  amount: string;
  extra_per_kg: string;
  weight_ranges: WeightRangeForm[];
};

type ShippingRuleFormState = {
  name: string;
  active: boolean;
  areas: ShippingAreaForm[];
};

/* ---------------- PROPS ---------------- */

interface ShippingRuleFormProps {
  initialData?: Partial<IShippingRule>;
  onSubmit: (payload: Partial<IShippingRule>) => void;
  submitLabel?: string;
  isLoading?: boolean;
}

/* ---------------- COMPONENT ---------------- */

export function ShippingRuleForm({
  initialData = {},
  onSubmit,
  submitLabel = "Save",
  isLoading,
}: ShippingRuleFormProps) {
  const [formData, setFormData] = React.useState<ShippingRuleFormState>({
    name: initialData.name ?? "",
    active: initialData.active ?? true,
    areas:
      initialData.areas?.map((a: IShippingArea) => ({
        name: a.name,
        type: a.type,
        amount: a.type === "flat_rate" ? String(a.amount ?? "") : "",
        extra_per_kg:
          a.type === "rate_by_weight" ? String(a.extra_per_kg ?? 0) : "",
        weight_ranges:
          a.type === "rate_by_weight"
            ? a.weight_ranges.map((r) => ({
                min: String(r.min),
                max: String(r.max),
                charge: String(r.charge),
              }))
            : [],
      })) ?? [],
  });

  /* ---------------- HELPERS ---------------- */

  const updateRule = <K extends keyof ShippingRuleFormState>(
    key: K,
    value: ShippingRuleFormState[K]
  ) => setFormData((p) => ({ ...p, [key]: value }));

  const updateArea = (
    index: number,
    key: keyof ShippingAreaForm,
    value: string
  ) => {
    setFormData((p) => ({
      ...p,
      areas: p.areas.map((a, i) => (i === index ? { ...a, [key]: value } : a)),
    }));
  };

  const addArea = () =>
    updateRule("areas", [
      ...formData.areas,
      {
        name: "",
        type: "flat_rate",
        amount: "",
        extra_per_kg: "",
        weight_ranges: [],
      },
    ]);

  const removeArea = (index: number) =>
    updateRule(
      "areas",
      formData.areas.filter((_, i) => i !== index)
    );

  const addRange = (areaIndex: number) =>
    setFormData((p) => ({
      ...p,
      areas: p.areas.map((a, i) =>
        i === areaIndex
          ? {
              ...a,
              weight_ranges: [
                ...a.weight_ranges,
                { min: "", max: "", charge: "" },
              ],
            }
          : a
      ),
    }));

  const updateRange = (
    ai: number,
    ri: number,
    key: keyof WeightRangeForm,
    value: string
  ) =>
    setFormData((p) => ({
      ...p,
      areas: p.areas.map((a, i) =>
        i === ai
          ? {
              ...a,
              weight_ranges: a.weight_ranges.map((r, j) =>
                j === ri ? { ...r, [key]: value } : r
              ),
            }
          : a
      ),
    }));

  const removeRange = (ai: number, ri: number) =>
    setFormData((p) => ({
      ...p,
      areas: p.areas.map((a, i) =>
        i === ai
          ? {
              ...a,
              weight_ranges: a.weight_ranges.filter((_, j) => j !== ri),
            }
          : a
      ),
    }));

  /* ---------------- SUBMIT ---------------- */

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const areas: IShippingArea[] = formData.areas.map((a) => {
      if (a.type === "flat_rate") {
        return {
          type: "flat_rate",
          name: a.name,
          amount: Number(a.amount),
        };
      }

      if (a.type === "free_shipping") {
        return {
          type: "free_shipping",
          name: a.name,
        };
      }

      return {
        type: "rate_by_weight",
        name: a.name,
        extra_per_kg: Number(a.extra_per_kg),
        weight_ranges: a.weight_ranges.map((r) => ({
          min: Number(r.min),
          max: Number(r.max),
          charge: Number(r.charge),
        })),
      };
    });

    onSubmit({
      name: formData.name,
      active: formData.active,
      areas,
    });
  };

  /* ---------------- UI ---------------- */

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="space-y-2">
        <Label>Rule Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => updateRule("name", e.target.value)}
        />
      </div>
      {formData.areas.map((a, i) => (
        <div key={i} className="border p-4 space-y-3 rounded">
          <div className="flex justify-between">
            <Label>Area {i + 1}</Label>
            <Button
              type="button"
              variant="destructive"
              onClick={() => removeArea(i)}
            >
              Remove
            </Button>
          </div>

          <Input
            placeholder="Area Name"
            value={a.name}
            onChange={(e) => updateArea(i, "name", e.target.value)}
          />

          <Select
            value={a.type}
            onValueChange={(v) => updateArea(i, "type", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-full">
              <SelectItem value="flat_rate">Flat Rate</SelectItem>
              <SelectItem value="free_shipping">Free Shipping</SelectItem>
              <SelectItem value="rate_by_weight">Rate by Weight</SelectItem>
            </SelectContent>
          </Select>

          {a.type === "flat_rate" && (
            <Input
              placeholder="Amount"
              value={a.amount}
              onChange={(e) => updateArea(i, "amount", e.target.value)}
            />
          )}

          {a.type === "rate_by_weight" && (
            <>
              <Input
                placeholder="Extra per kg"
                value={a.extra_per_kg}
                onChange={(e) => updateArea(i, "extra_per_kg", e.target.value)}
              />

              <Button type="button" onClick={() => addRange(i)}>
                + Add Weight Range
              </Button>

              {a.weight_ranges.map((r, ri) => (
                <div key={ri} className="grid grid-cols-4 gap-2">
                  {/* Min */}
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-500 mb-1">Min</label>
                    <Input
                      placeholder="Min"
                      value={r.min}
                      onChange={(e) =>
                        updateRange(i, ri, "min", e.target.value)
                      }
                    />
                  </div>

                  {/* Max */}
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-500 mb-1">Max</label>
                    <Input
                      placeholder="Max"
                      value={r.max}
                      onChange={(e) =>
                        updateRange(i, ri, "max", e.target.value)
                      }
                    />
                  </div>

                  {/* Charge */}
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-500 mb-1">Charge</label>
                    <Input
                      placeholder="Charge"
                      value={r.charge}
                      onChange={(e) =>
                        updateRange(i, ri, "charge", e.target.value)
                      }
                    />
                  </div>

                  {/* Delete */}
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeRange(i, ri)}
                      className="w-full"
                    >
                      <Icon icon="mdi:delete" />
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      ))}
      <div className="flex justify-end items-center">
        <Button type="button" className="w-full" onClick={addArea}>
          + Add Area
        </Button>
      </div>

      <div className="w-full flex justify-between">
        <Label>Active</Label>
        <Switch
          checked={formData.active}
          onCheckedChange={(v) => updateRule("active", v)}
        />
      </div>
      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button type="submit" loading={isLoading}>{submitLabel}</Button>
      </div>
    </form>
  );
}
