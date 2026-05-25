/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { IBrand } from "@/types/brand.type";

interface BrandFormProps {
  initialData?: Partial<IBrand>;
  onSubmit: (data: FormData) => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function BrandForm({
  initialData = {},
  onSubmit,
  submitLabel = "Save",
  isLoading,
}: BrandFormProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = React.useState({
    name: initialData.name || "",
    image: null as File | null,
    imagePreview: initialData.image || "",
    isFeatured: initialData.isFeatured ?? false,
    isPublished: initialData.isPublished ?? true,
  });

  const handleChange = (
    key: keyof typeof formData,
    value: string | boolean | File | null
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleChange("image", file);
      handleChange("imagePreview", URL.createObjectURL(file));
    }
  };

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const data = new FormData();

    data.append("name", formData.name);
    data.append("isFeatured", String(formData.isFeatured));
    data.append("isPublished", String(formData.isPublished));

    if (formData.image) {
      data.append("image", formData.image);
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Logo Upload */}
      <div className="space-y-2">
        <Label>Logo (512 x 512)</Label>
        <div
          className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-primary transition"
          onClick={handleDropzoneClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />
          {formData.imagePreview ? (
            <img
              src={formData.imagePreview}
              alt="Preview"
              className="h-32 w-32 object-cover rounded-md border"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Click to upload logo
            </p>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Brand Name</Label>
        <Input
          id="name"
          placeholder="Brand Name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>

      {/* Featured & Published */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="isFeatured">Featured</Label>
          <Switch
            id="isFeatured"
            checked={formData.isFeatured}
            onCheckedChange={(val) => handleChange("isFeatured", val)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="isPublished">Published</Label>
          <Switch
            id="isPublished"
            checked={formData.isPublished}
            onCheckedChange={(val) => handleChange("isPublished", val)}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" loading={isLoading}>{submitLabel}</Button>
      </div>
    </form>
  );
}
