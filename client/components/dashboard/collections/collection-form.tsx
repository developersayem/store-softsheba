/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICollection } from "@/types/collection.type";
// import { IProduct } from "@/types/product.type";
import { ProductsSelector } from "@/components/shared/products-selector";
import { CategoryMultiSelector } from "./categoryMultiSelect";
import { fetcher } from "@/lib/fetcher";
import { ICategory } from "@/types/category.type";
import useSWR from "swr";
import { toast } from "sonner";

interface CollectionFormProps {
  initialData?: Partial<ICollection>;
  onSubmit: (data: FormData) => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function CollectionForm({
  initialData = {},
  onSubmit,
  submitLabel = "Save",
  isLoading,
}: CollectionFormProps) {
  const { data: categoriesRes } = useSWR<{ data: ICategory[] }>(
    "/categories",
    fetcher,
  );
  // const { data: productsRes } = useSWR<{ data: IProduct[] }>(
  //   "/products/all",
  //   fetcher,
  // );

  const categoriesData = React.useMemo(
    () => categoriesRes?.data || [],
    [categoriesRes?.data],
  );
  // const allProducts = React.useMemo(
  //   () => productsRes?.data || [],
  //   [productsRes?.data],
  // );
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const products = Array.isArray(initialData.products)
    ? initialData.products.map((productId: string) => productId)
    : [];
  const category = Array.isArray(initialData.category)
    ? initialData.category.map((catId: string) => catId)
    : [];
  const [formData, setFormData] = React.useState({
    name: initialData.name || "",
    description: initialData.description || "",
    image: null as File | null,
    imagePreview: initialData.image || "",
    isFeatured: initialData.isFeatured || false,
    isPublished: initialData.isPublished ?? true,
    products: products || [],
    category: category || [],
    homeLimit: initialData.homeLimit || 12,
    sortBy: initialData.sortBy || "latest",
  });

  // Sync products when categories change - remove products that don't belong to the selected categories
  // React.useEffect(() => {
  //   if (formData.category.length === 0) {
  //     if (formData.products.length > 0) {
  //       setFormData((prev) => ({ ...prev, products: [] }));
  //     }
  //     return;
  //   }

  //   if (allProducts.length === 0) return;

  //   // Filter out products that no longer belong to any selected category
  //   const validProducts = formData.products.filter((productId) => {
  //     const product = allProducts.find((p) => p._id === productId);
  //     if (!product) return true; // Keep if not loaded yet to be safe

  //     return product.categories.some((cat: ICategory | string) =>
  //       formData.category.includes(typeof cat === "string" ? cat : cat._id),
  //     );
  //   });

  //   if (validProducts.length !== formData.products.length) {
  //     setFormData((prev) => ({ ...prev, products: validProducts }));
  //   }
  // }, [formData.category, allProducts, formData.products]);

  const handleChange = (
    key: keyof typeof formData,
    value: string | boolean | File | string[],
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

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const data = new FormData();
  //   data.append("name", formData.name);
  //   data.append("description", formData.description);
  //   if (formData.image) data.append("image", formData.image);
  //   data.append("isFeatured", String(formData.isFeatured));
  //   data.append("isPublished", String(formData.isPublished));
  //   data.append("homeLimit", String(formData.homeLimit));
  //   data.append("sortBy", formData.sortBy);
  //   formData.products.forEach((prodId: string) =>
  //     data.append("products[]", prodId),
  //   );
  //   formData.category.forEach((catId: string) =>
  //     data.append("category[]", catId),
  //   );
  //   onSubmit(data);
  // };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.category.length === 0) {
      toast.error("Collection cannot be empty. Add at least one category");
      return;
    }
    const data = new FormData();
    let hasChanges = false;

    // Helper to check and append changed fields
    const appendIfChanged = (
      key: string,
      current: string,
      initial: string | undefined,
    ) => {
      if (current !== (initial ?? "")) {
        data.append(key, current);
        hasChanges = true;
      }
    };

    appendIfChanged("name", formData.name, initialData.name);
    appendIfChanged(
      "description",
      formData.description,
      initialData.description,
    );
    appendIfChanged("sortBy", formData.sortBy, initialData.sortBy);
    appendIfChanged(
      "homeLimit",
      String(formData.homeLimit),
      String(initialData.homeLimit ?? 12),
    );

    if (formData.isFeatured !== (initialData.isFeatured ?? false)) {
      data.append("isFeatured", String(formData.isFeatured));
      hasChanges = true;
    }

    if (formData.isPublished !== (initialData.isPublished ?? true)) {
      data.append("isPublished", String(formData.isPublished));
      hasChanges = true;
    }

    if (formData.image) {
      data.append("image", formData.image);
      hasChanges = true;
    }

    // Compare arrays by value
    const initialProducts = Array.isArray(initialData.products)
      ? initialData.products
      : [];
    const initialCategory = Array.isArray(initialData.category)
      ? initialData.category
      : [];

    if (
      JSON.stringify([...formData.products].sort()) !==
      JSON.stringify([...initialProducts].sort())
    ) {
      formData.products.forEach((id) => data.append("products[]", id));
      hasChanges = true;
    }

    if (
      JSON.stringify([...formData.category].sort()) !==
      JSON.stringify([...initialCategory].sort())
    ) {
      formData.category.forEach((id) => data.append("category[]", id));
      hasChanges = true;
    }

    if (!hasChanges) return; // nothing changed, skip the request

    onSubmit(data);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Image  (2260 x 448)</Label>
        <div
          className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-primary transition"
          onClick={handleDropzoneClick} // clicking anywhere triggers file input
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
              Click to upload or drag and drop
            </p>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Collection Name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Short description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>
      <div className="flex items-center w-full gap-4 ">
        {/* Products Multi-select */}
        <div className="space-y-2 w-full ">
          <Label>Products</Label>
          <ProductsSelector
            value={formData.products}
            onChange={(val) => handleChange("products", val)}
            //categoryIds={formData.category}
          />
        </div>
        {/* category multi-select */}
        <div className="space-y-2 w-full">
          <Label>Select Products by Category</Label>
          <CategoryMultiSelector
            options={categoriesData.map((cat) => ({
              _id: cat._id,
              name: cat.name,
            }))}
            value={formData.category}
            onChange={(val) => handleChange("category", val)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* Home Limit */}
        <div className="space-y-2">
          <Label htmlFor="homeLimit">Home Page Limit</Label>
          <Input
            id="homeLimit"
            type="number"
            min={1}
            max={50}
            value={formData.homeLimit}
            onChange={(e) => handleChange("homeLimit", e.target.value)}
          />
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label htmlFor="sortBy">Sort Products By</Label>
          <Select
            value={formData.sortBy}
            onValueChange={(val) => handleChange("sortBy", val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select sorting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="flash_sale">Flash Sale Products</SelectItem>
              <SelectItem value="big_discount">
                Big Discount Products
              </SelectItem>
              <SelectItem value="high_price">High Price Products</SelectItem>
              <SelectItem value="low_price">Low Price Products</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Featured & Published Switch */}
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
        <Button type="submit" loading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
