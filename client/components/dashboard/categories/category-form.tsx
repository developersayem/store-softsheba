/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ParentCategorySelector } from "./parent-category-selector";
import { ICategory } from "@/types/category.type";

interface ICategoryFormProps {
  initialData?: Partial<ICategory>;
  parentOptions: { _id: string; name: string }[];
  onSubmit: (data: FormData) => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function CategoryForm({
  initialData = {},
  parentOptions,
  onSubmit,
  submitLabel = "Save",
  isLoading = false,
}: ICategoryFormProps) {
  const iconInputRef = React.useRef<HTMLInputElement | null>(null);
  const bannerInputRef = React.useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = React.useState({
    name: initialData.name || "",
    description: initialData.description || "",
    parent: initialData.parent?._id || "",

    icon: null as File | null,
    iconPreview: initialData.icon || "",

    banner: null as File | null,
    bannerPreview: initialData.banner || "",

    isFeatured: initialData.isFeatured ?? false,
    isPublished: initialData.isPublished ?? true,
  });

  const update = (key: keyof typeof formData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // =============================
  // FILE HANDLERS
  // =============================
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    update("icon", file);
    update("iconPreview", URL.createObjectURL(file));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    update("banner", file);
    update("bannerPreview", URL.createObjectURL(file));
  };

  // =============================
  // SUBMIT
  // =============================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("isFeatured", String(formData.isFeatured));
    data.append("isPublished", String(formData.isPublished));

    if (formData.parent) data.append("parent", formData.parent);
    if (formData.icon) data.append("icon", formData.icon);
    if (formData.banner) data.append("banner", formData.banner);

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!formData.parent && (
        <div className="grid grid-cols-3 gap-2">
          {/* ICON */}
          <div className="space-y-2">
            <Label>Icon (512 x 512)</Label>
            <div
              onClick={() => iconInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-4 flex justify-center cursor-pointer hover:border-primary"
            >
              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleIconChange}
              />

              {formData.iconPreview ? (
                <img
                  src={formData.iconPreview}
                  alt="Icon preview"
                  className="h-30 w-24 object-cover rounded-md"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click to upload icon
                </p>
              )}
            </div>
          </div>

          {/* BANNER */}
          <div className="space-y-2 col-span-2">
            <Label>Banner (2260 x 448)</Label>
            <div
              onClick={() => bannerInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-4 flex justify-center cursor-pointer hover:border-primary"
            >
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleBannerChange}
              />

              {formData.bannerPreview ? (
                <img
                  src={formData.bannerPreview}
                  alt="Banner preview"
                  className="h-30 w-full object-cover rounded-md"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click to upload banner
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NAME */}
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Category name"
        />
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Short description"
        />
      </div>

      {/* PARENT */}
      <div className="space-y-2">
        <Label>Parent Category (optional)</Label>
        <ParentCategorySelector
          options={parentOptions}
          value={formData.parent}
          onChange={(val) => update("parent", val)}
        />
      </div>

      {/* SWITCHES */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Featured</Label>
          <Switch
            checked={formData.isFeatured}
            onCheckedChange={(v) => update("isFeatured", v)}
          />
        </div>

        <div className="flex justify-between items-center">
          <Label>Published</Label>
          <Switch
            checked={formData.isPublished}
            onCheckedChange={(v) => update("isPublished", v)}
          />
        </div>
      </div>

      {/* SUBMIT */}
      <div className="w-full">
        <Button type="submit" className="w-full" loading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
