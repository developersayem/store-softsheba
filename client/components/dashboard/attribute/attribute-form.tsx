"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { IAttribute } from "@/types/attributes.type";
import { Badge } from "@/components/ui/badge";

interface AttributeFormProps {
  initialData?: Partial<IAttribute>;
  onSubmit: (data: FormData) => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function AttributeForm({
  initialData = {},
  onSubmit,
  submitLabel = "Save",
  isLoading,
}: AttributeFormProps) {
  const [name, setName] = React.useState(initialData.name || "");
  const [unit, setUnit] = React.useState(initialData.unit || "");
  const [slug, setSlug] = React.useState(initialData.slug || "");
  const [values, setValues] = React.useState<string[]>(
    initialData.values || []
  );
  const [newValue, setNewValue] = React.useState("");
  const [isActive, setIsActive] = React.useState(initialData.isActive ?? true);

  // Auto-generate slug on name change
  React.useEffect(() => {
    let base = name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^a-z0-9-]/g, "");

    if (unit) {
      const u = unit
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^a-z0-9-]/g, "");
      base = `${base}-${u}`;
    }

    setSlug(base);
  }, [name, unit]);

  const addValue = () => {
    if (!newValue.trim()) return;
    if (values.includes(newValue.trim())) return;

    setValues([...values, newValue.trim()]);
    setNewValue("");
  };

  const removeValue = (val: string) => {
    setValues(values.filter((v) => v !== val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const data = new FormData();
    data.append("name", name);
    if (unit) data.append("unit", unit);
    data.append("slug", slug);
    values.forEach((v) => data.append("values[]", v));
    data.append("isActive", String(isActive));

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name & Unit */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Name <span className="text-red-500 text-xs">*</span>
          </Label>
          <Input
            placeholder="Attribute Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>
            Unit <span className="text-red-500 text-xs">*</span>
          </Label>
          <Input
            placeholder="e.g. kg, ml, cm"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Attribute Values */}
      <div className="space-y-2">
        <Label>
          Values <span className="text-red-500 text-xs">*</span>
        </Label>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter value, e.g. Red or 1"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addValue())
            }
          />
          <Button type="button" onClick={addValue}>
            Add
          </Button>
        </div>

        {/* Value Tags */}
        <div className="flex flex-wrap gap-2 mt-2">
          {values.map((val) => (
            <div
              key={val}
              className="flex items-center bg-secondary text-sm px-2 py-1 rounded-md"
            >
              <Badge>
                <span> {val}</span>
                <button
                  type="button"
                  onClick={() => removeValue(val)}
                  className="ml-1 text-red-500 hover:text-red-700"
                >
                  <X size={14} />
                </button>
              </Badge>
            </div>
          ))}
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input
            placeholder="attribute-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
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
