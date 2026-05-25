/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Upload, X, Tag, Plus, Trash2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Combobox from "@/components/dashboard/shared/Combobox";
import {
  createEmptyVariantState,
  useProductForm,
} from "@/contexts/product-form-context";
import { AddCategoriesModal } from "../categories/add-categories-modal";
import { AddBrandsModal } from "../brands/add-brand-model";
import { AddAttributeModal } from "../attribute/add-attribute-model";
import { AddShippingRuleModal } from "../settings/courier/shipping-rules/add-shipping-rule-modal";
import Image from "next/image";
import { AddCollectionModal } from "../collections/add-collection-model";
import RichTextEditor from "@/components/dashboard/shared/RichTextEditor";

export default function ProductForm() {
  const {
    form,
    updateForm,
    selectedCollections,
    setSelectedCollections,
    selectedCategories,
    setSelectedCategories,
    selectedBrand,
    setSelectedBrand,
    selectedAttributes,
    updateSelectedAttributes,
    thumbnailPreview,
    setThumbnailPreview,
    setThumbnailFile,
    handleThumbnailChange,
    galleryPreviews,
    setGalleryPreviews,
    setGalleryFiles,
    handleGalleryChange,
    digitalFile,
    handleDigitalFile,
    tags,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    keywords,
    keywordInput,
    setKeywordInput,
    addKeyword,
    removeKeyword,
    variants,
    setVariants,
    hasVariants,
    setHasVariants,
    addVariant,
    removeVariant,
    updateVariant,
    handleVariantImage,
    setVariantAttributeValue,
    removeVariantAttribute,
    categoriesData,
    collectionData,
    brandsData,
    shippingData,
    attributesData,
    findAttributeById,
    setIsSlugEdited,
    mutateCategories,
    mutateCollections,
    mutateBrands,
    mutateAttributes,
    mutateShipping,
    productAttributes,
    setProductAttributeValue,
    removeProductAttribute,
    computedSalePrice,
  } = useProductForm();

  const toggleHasVariants = (value: boolean) => {
    setHasVariants(value);

    if (value === true) {
      // switching ON → clear simple product fields
      updateForm({
        stock: 0,
        stock_alert: 0,
        purchase_price: 0,
        sale_price: 0,
        regular_price: 0,
        discount_type: null,
        discount: 0,
        sold: 0,
      });

      // wipe existing variants and create ONE clean variant
      setVariants([createEmptyVariantState(0, selectedAttributes)]);
    } else {
      // switching OFF → remove all variants
      setVariants([]);

      // restore simple product fields (only reset stock/sold, preserve pricing)
      updateForm({
        stock: 0,
        stock_alert: 0,
        sold: 0,
      });
    }
  };
  //console.log(form);
  //console.log(form.discount_type);

  return (
    <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT SECTION  */}
      <div className="space-y-3 lg:col-span-2">
        {/* Product Info */}
        <div className="bg-white dark:bg-accent p-5 rounded-xl shadow">
          <div className="space-y-2">
            <Label>
              Product Name
              <span className="text-red-500 text-xs">*</span>
            </Label>
            <Input
              name="name"
              value={form.name}
              onChange={(e) => updateForm({ name: e.target.value })}
              placeholder="Enter product name"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            {/* Slug */}
            <div className="space-y-2">
              <Label>
                Slug
                <span className="text-red-500 text-xs">*</span>
                <span className="text-muted-foreground text-xs">
                  (English only)
                </span>
              </Label>
              <Input
                value={form.slug}
                onChange={(e) => {
                  updateForm({ slug: e.target.value });
                  setIsSlugEdited(true); // manual override
                }}
                placeholder="e.g., product-slug"
              />
            </div>
            {/* SKU */}
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input
                name="sku"
                value={form.sku ?? ""}
                onChange={(e) => updateForm({ sku: e.target.value })}
                placeholder="e.g., PROD-001"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="mt-3">
            <div className="space-y-2">
              <Label>Short Description</Label>
              <RichTextEditor
                value={form.short_description}
                onChange={(content) =>
                  updateForm({ short_description: content })
                }
                placeholder="Brief description"
                height={100}
              />
            </div>

            <div className="space-y-2 mt-4">
              <Label>Long Description</Label>
              <RichTextEditor
                value={form.long_description}
                onChange={(content) =>
                  updateForm({ long_description: content })
                }
                placeholder="Full description"
                height={300}
              />
            </div>
          </div>
        </div>

        {/* CATEGORY, BRAND, SHIPPING */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Categories (multi-select) */}
          <div className="bg-white dark:bg-accent p-5 rounded-xl shadow space-y-2">
            <Label className="text-md">
              Categories
              <span className="text-red-500 text-xs">*</span>
            </Label>
            <Combobox
              name="categories"
              placeholder="Select Categories"
              options={categoriesData}
              value={selectedCategories}
              multiple={true}
              getLabel={(cat) => cat.name}
              getValue={(cat) => cat._id}
              onChange={(val) => {
                setSelectedCategories(val as string[]);
              }}
              emptyStateAction={() => (
                <AddCategoriesModal
                  categoriesData={categoriesData}
                  mutateCategoriesData={mutateCategories}
                  trigger={
                    <button
                      type="button"
                      className="text-blue-500 hover:underline"
                    >
                      + Add
                    </button>
                  }
                />
              )}
            />

            <p className="text-sm text-muted-foreground mt-1">
              Choose one or more categories for this product.
            </p>
          </div>

          {/* COLLECTION (multi-select) */}
          <div className="bg-white dark:bg-accent p-5 rounded-xl shadow space-y-2">
            <Label className="text-md">
              Collections
            </Label>
            <Combobox
              name="collections"
              placeholder="Select Collections"
              options={collectionData}
              value={selectedCollections}
              multiple={true}
              getLabel={(cat) => cat.name}
              getValue={(cat) => cat._id}
              onChange={(val) => {
                setSelectedCollections(val as string[]);
              }}
              emptyStateAction={() => (
                <AddCollectionModal
                  mutateCollectionsData={mutateCollections}
                  trigger={
                    <button
                      type="button"
                      className="text-blue-500 hover:underline"
                    >
                      + Add
                    </button>
                  }
                />
              )}
            />

            <p className="text-sm text-muted-foreground mt-1">
              Choose one or more collections for this product.
            </p>
          </div>
          {/* Brand (single-select) */}
          <div className="bg-white dark:bg-accent p-5 rounded-xl shadow space-y-2">
            <Label className="text-md">Brand</Label>
            <Combobox
              name="brand"
              options={brandsData}
              value={selectedBrand || ""}
              multiple={false}
              getLabel={(item) => item.name}
              getValue={(item) => item._id}
              placeholder="Select brand"
              onChange={(val) => {
                setSelectedBrand(val as string | null);
              }}
              emptyStateAction={() => (
                <AddBrandsModal
                  mutateBrandsData={mutateBrands}
                  trigger={
                    <button
                      type="button"
                      className="text-blue-500 hover:underline flex items-center"
                    >
                      + Add
                    </button>
                  }
                />
              )}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Select the brand or leave empty if has no brand.
            </p>
          </div>

          {/* Attributes (multi-select) */}
          <div className="bg-white dark:bg-accent p-5 rounded-xl shadow space-y-2">
            <Label className="text-md">Attributes</Label>
            <Combobox
              name="attributes"
              placeholder="Select Attributes"
              options={attributesData}
              value={selectedAttributes}
              multiple={true}
              getLabel={(item) =>
                item.unit ? `${item.name} (${item.unit})` : item.name
              }
              getValue={(item) => item._id}
              onChange={(val) => {
                updateSelectedAttributes(val as string[]);
              }}
              emptyStateAction={() => (
                <AddAttributeModal
                  mutateAttributesData={mutateAttributes}
                  trigger={
                    <button
                      type="button"
                      className="text-blue-500 hover:underline"
                    >
                      + Add
                    </button>
                  }
                />
              )}
            />
            <p className="text-sm text-muted-foreground mt-2">
              {hasVariants
                ? "Select attributes for product variants."
                : "Select attributes to specify product details (e.g., color, size)."}
            </p>
          </div>

          {/* Shipping / Delivery (single-select) */}
          <div className="bg-white dark:bg-accent p-5 rounded-xl shadow space-y-4 sm:col-span-2">
            <div className="flex justify-between items-center">
              <Label className="text-md">Delivery Method</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Free Shipping?</span>
                <Switch
                  checked={form.is_free_shipping}
                  onCheckedChange={(val) => updateForm({ is_free_shipping: val })}
                />
              </div>
            </div>
            <Combobox
              name="delivery"
              options={shippingData}
              disabled={form.is_free_shipping}
              value={
                form.is_free_shipping
                  ? ""
                  : form.delivery
                    ? typeof form.delivery === "string"
                      ? form.delivery
                      : form.delivery._id
                    : ""
              }
              multiple={false}
              getLabel={(item) => item?.name || ""}
              getValue={(item) => item?._id || ""}
              placeholder={form.is_free_shipping ? "Globally Free Shipping" : "Select delivery method"}
              emptyStateAction={() => (
                <AddShippingRuleModal
                  mutateShippingRules={mutateShipping}
                  trigger={
                    <button
                      type="button"
                      className="text-blue-500 hover:underline flex items-center"
                    >
                      + Add
                    </button>
                  }
                />
              )}
              onChange={(val) => {
                updateForm({ delivery: val as string | null });
              }}
            />

            <p className="text-sm text-muted-foreground mt-1">
              {form.is_free_shipping 
                ? "This product will have free shipping for all customers."
                : "Select how shipping cost will be calculated for this product."}
            </p>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white dark:bg-accent p-5 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <Label className="text-lg">Variants</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm">Has Variants?</span>
              <Switch
                checked={hasVariants}
                onCheckedChange={toggleHasVariants}
              />
            </div>
          </div>

          {hasVariants && (
            <div className="mt-4 space-y-4">
              {variants.map((v) => (
                <div key={v._id} className="p-4 border rounded-lg">
                  {/* top row: image + delete */}
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="mt-3">
                      <Label>Variant Image</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <label className="flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                          {v.imagePreview &&
                          !v.imagePreview.toLowerCase().includes("placeholder") &&
                          !v.imagePreview.toLowerCase().includes("fallback") ? (
                            <div className="relative">
                              <img
                                src={v.imagePreview}
                                alt="variant"
                                className="h-24 w-24 object-cover rounded-md"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  updateVariant(v._id, {
                                    imagePreview: null,
                                    imageFile: null,
                                  });
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center text-gray-500">
                              <Upload className="h-5 w-5 mb-1" />
                              <span className="text-sm">Upload</span>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleVariantImage(v._id, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeVariant(v._id)}
                    >
                      <Trash2 /> Remove
                    </Button>
                  </div>

                  {/* SKU, stock, stock alert */}
                  <div className="grid sm:grid-cols-4 gap-3 mt-3">
                    <div className="space-y-2 col-span-2">
                      <Label>SKU</Label>
                      <Input
                        name={`variant_sku_${v._id}`}
                        value={v.sku}
                        onChange={(e) =>
                          updateVariant(v._id, { sku: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Stock
                        <span className="text-red-500 text-xs">*</span>
                      </Label>
                      <Input
                        name={`variant_stock_${v._id}`}
                        type="number"
                        value={v.stock || ""}
                        onChange={(e) =>
                          updateVariant(v._id, {
                            stock: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Stock Alert</Label>
                      <Input
                        type="number"
                        value={v.stock_alert || ""}
                        onChange={(e) =>
                          updateVariant(v._id, {
                            stock_alert: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* price, Discount, Final Price */}
                  <div className="grid sm:grid-cols-4 gap-3 mt-3">
                    <div className="space-y-2">
                      <Label>
                        Purchase Price (৳)
                        <span className="text-muted-foreground text-xs">
                          (cost)
                        </span>
                      </Label>
                      <div className="relative">
                        <Input
                        name={`variant_purchase_price_${v._id}`}
                          type="number"
                          value={v.purchase_price || ""}
                          onChange={(e) =>
                            updateVariant(v._id, {
                              purchase_price: Number(e.target.value),
                            })
                          }
                          min={0}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          ৳
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Price (৳)
                        <span className="text-red-500 text-xs">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          name={`variant_price_${v._id}`}
                          type="number"
                          value={v.regular_price || ""}
                          onChange={(e) =>
                            updateVariant(v._id, {
                              regular_price: Number(e.target.value),
                            })
                          }
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          ৳
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Discount Type</Label>
                      <Select
                        value={
                          v.discount_type === "flat" ||
                          v.discount_type === "percentage"
                            ? v.discount_type
                            : "none"
                        }
                        onValueChange={(val) =>
                          updateVariant(v._id, {
                            discount_type:
                              val === "none"
                                ? null
                                : (val as "flat" | "percentage"),
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="flat">Flat</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Discount (৳)</Label>

                      <div className="relative">
                        <Input
                          type="number"
                          value={v.discount || ""}
                          onChange={(e) =>
                            updateVariant(v._id, {
                              discount: Number(e.target.value),
                            })
                          }
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          ৳
                        </span>
                      </div>
                    </div>

                    {/* FINAL PRICE CALCULATION AND CUSTOM FIELDS */}
                    <div className="space-y-2">
                      <Label>
                        Sale Price (৳)
                        <span className="text-muted-foreground text-xs">
                          (auto)
                        </span>
                      </Label>
                      <div className="relative">
                        <Input
                          value={String(
                            v.discount_type === "flat"
                              ? Math.max(v.regular_price - v.discount, 0)
                              : v.discount_type === "percentage"
                                ? Math.max(
                                    v.regular_price -
                                      (v.regular_price * v.discount) / 100,
                                    0,
                                  )
                                : v.regular_price,
                          )}
                          readOnly
                          disabled
                          className="bg-muted pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          ৳
                        </span>
                      </div>
                    </div>

                    {/* Custom Sold */}
                    <div className="space-y-2">
                      <Label>Custom Sold</Label>
                      <Input
                        type="number"
                        value={v.sold || ""}
                        onChange={(e) =>
                          updateVariant(v._id, {
                            sold: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    {/* Custom Ratings */}
                    <div className="space-y-2">
                      <Label>Custom Ratings</Label>
                      <Input
                        type="number"
                        value={v.ratings || ""}
                        onChange={(e) =>
                          updateVariant(v._id, {
                            ratings: Number(e.target.value),
                          })
                        }
                        min={0}
                        max={100}
                        step={0.1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Status
                        <span className="text-red-500 text-xs">*</span>
                      </Label>
                      <Select
                        value={v.status}
                        onValueChange={(val) =>
                          updateVariant(v._id, {
                            status: val as "active" | "inactive",
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Variant Attributes — now value selectors */}
                  <div className="mt-3">
                    <Label>
                      Attributes
                      <span className="text-red-500 text-xs">*</span>
                    </Label>

                    <div className="space-y-2 mt-2 grid grid-cols-3 gap-5">
                      {v.attributes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No attributes for this variant. Select attributes
                          above to add them.
                        </p>
                      ) : (
                        v.attributes.map((attrPair) => {
                          const attr = findAttributeById(attrPair.attribute);
                          const currentValue = attrPair.value ?? "";

                          return (
                            <div key={attrPair.attribute} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm capitalize">
                                  {attr?.name}
                                  {attr?.unit ? ` (${attr.unit})` : ""}
                                </Label>
                              </div>

                              <div className="flex items-center gap-2">
                                <Select
                                  value={currentValue}
                                  onValueChange={(value) =>
                                    setVariantAttributeValue(
                                      v._id,
                                      attrPair.attribute,
                                      value,
                                    )
                                  }
                                >
                                  <SelectTrigger
                                    name={`variant_attribute_${v._id}_${attrPair.attribute}`}
                                    className="w-full"
                                  >
                                    <SelectValue
                                      placeholder={`Select ${attr?.name}`}
                                    />
                                  </SelectTrigger>

                                  <SelectContent>
                                    {attr?.values?.map((val) => (
                                      <SelectItem key={val} value={val}>
                                        {val}{" "}
                                        {attr.unit ? ` (${attr.unit})` : ""}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    removeVariantAttribute(
                                      v._id,
                                      attrPair.attribute,
                                    )
                                  }
                                  className="text-red-500 hover:text-red-700"
                                  title="Remove attribute"
                                >
                                  <X className="h-8 w-8" />
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={addVariant}
                  variant="outline"
                  className="mt-2 "
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Variant
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Pricing if no variants */}
        {!hasVariants && (
          <div className="bg-white dark:bg-accent p-5 rounded-xl shadow">
            <Label className="text-lg">Pricing & Inventory</Label>

            {/* Stock fields */}
            <div className="grid sm:grid-cols-4 gap-3 mt-3">
              <div className="space-y-2">
                <Label>
                  Stock
                  <span className="text-red-500 text-xs">*</span>
                </Label>
                <Input
                  name="stock"
                  type="number"
                  value={form.stock || ""}
                  onChange={(e) =>
                    updateForm({ stock: Number(e.target.value) })
                  }
                  placeholder="Available quantity"
                />
              </div>
              <div className="space-y-2">
                <Label>Stock Alert</Label>
                <Input
                  type="number"
                  value={form.stock_alert || ""}
                  onChange={(e) =>
                    updateForm({ stock_alert: Number(e.target.value) })
                  }
                  placeholder="Low stock threshold"
                />
              </div>
              {/* Custom Sold */}
              <div className="space-y-2">
                <Label>Custom Sold</Label>
                <Input
                  type="number"
                  value={form.sold || ""}
                  onChange={(e) => updateForm({ sold: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              {/* Custom Ratings */}
              <div className="space-y-2">
                <Label>Custom Ratings</Label>
                <Input
                  type="number"
                  value={form.ratings || ""}
                  onChange={(e) =>
                    updateForm({ ratings: Number(e.target.value) })
                  }
                  placeholder="0"
                  min={0}
                  max={100}
                  step={0.1}
                />
              </div>
            </div>

            {/* Price, Discount, Final Price */}
            <div className="grid sm:grid-cols-4 gap-3 mt-3">
              <div className="space-y-2">
                <Label>
                  Purchase Price (৳)
                  <span className="text-muted-foreground text-xs">(cost)</span>
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={form.purchase_price || ""}
                    onChange={(e) =>
                      updateForm({ purchase_price: Number(e.target.value) })
                    }
                    min={0}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ৳
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Price (৳)
                  <span className="text-red-500 text-xs">*</span>
                </Label>
                <div className="relative">
                  <Input
                    name="regular_price"
                    type="number"
                    value={form.regular_price || ""}
                    onChange={(e) =>
                      updateForm({ regular_price: Number(e.target.value) })
                    }
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ৳
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select
                  value={form.discount_type || "none"}
                  onValueChange={(val) =>
                    updateForm({
                      discount_type:
                        val === "none" ? null : (val as "flat" | "percentage"),
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Discount (৳)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={form.discount || ""}
                    onChange={(e) =>
                      updateForm({ discount: Number(e.target.value) })
                    }
                    placeholder="0"
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ৳
                  </span>
                </div>
              </div>

              {/* FINAL PRICE CALCULATION */}
              <div className="space-y-2">
                <Label>
                  Sale Price (৳)
                  <span className="text-muted-foreground text-xs">(auto)</span>
                </Label>
                <div className="relative">
                  <Input
                    value={String(computedSalePrice || 0)}
                    readOnly
                    disabled
                    className="bg-muted pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ৳
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Attributes for products without variants */}
        {!hasVariants && selectedAttributes.length > 0 && (
          <div className="bg-white dark:bg-accent p-5 rounded-xl shadow">
            <Label className="text-lg">Product Attributes</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              Specify the attribute values for this product.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {productAttributes?.map((attrPair) => {
                const attr = findAttributeById(attrPair.attribute);
                const currentValue = attrPair.value ?? "";

                return (
                  <div key={attrPair.attribute} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm capitalize">
                        {attr?.name}
                        {attr?.unit ? ` (${attr.unit})` : ""}
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={currentValue}
                        onValueChange={(value) =>
                          setProductAttributeValue(attrPair.attribute, value)
                        }
                      >
                        <SelectTrigger
                          name={`product_attribute_${attrPair.attribute}`}
                          className="w-full"
                        >
                          <SelectValue placeholder={`Select ${attr?.name}`} />
                        </SelectTrigger>

                        <SelectContent>
                          {attr?.values?.map((val) => (
                            <SelectItem key={String(val)} value={String(val)}>
                              {val} {attr.unit ? ` (${attr.unit})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          removeProductAttribute(attrPair.attribute)
                        }
                        className="text-red-500 hover:text-red-700"
                        title="Remove attribute"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="space-y-3 sticky top-16 self-start ">
        {/* Product Thumbnail and gallery  */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white dark:bg-accent p-5 rounded-xl shadow">
          {/* Thumbnail */}
          <div>
            <Label className="text-lg">
              Thumbnail
              <span className="text-red-500 text-xs">*</span>
              <span className="text-muted-foreground text-xs">(1026 x 1026)</span>
            </Label>
            <label
              className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 mt-2 `}
            >
              {thumbnailPreview &&
              !thumbnailPreview.toLowerCase().includes("placeholder") &&
              !thumbnailPreview.toLowerCase().includes("fallback") ? (
                <div className="relative">
                  <Image
                    src={thumbnailPreview}
                    alt="Thumbnail"
                    width={150}
                    height={150}
                    className="h-36 w-36 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setThumbnailPreview(null);
                      setThumbnailFile(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <Upload className="h-6 w-6 mb-2" />
                  <span className="text-sm text-center">Click or drag</span>
                </div>
              )}
              <input
                name="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
            </label>
          </div>
          {/* Gallery */}
          <div>
            <Label className="text-lg">Gallery <p className="text-muted-foreground text-xs">(1026 x 1026)</p></Label>
            
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 mt-2">
              <div className="flex flex-col items-center text-gray-500">
                <Upload className="h-6 w-6 mb-2" />
                <span className="text-sm text-center">Multiple images</span>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleGalleryChange}
                className="hidden"
              />
            </label>
          </div>
          {galleryPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-2 col-span-2">
              {galleryPreviews.map((img, i) => (
                <div key={i} className="relative group">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Image
                        src={img}
                        alt={`Gallery ${i}`}
                        width={150}
                        height={150}
                        className="h-24 w-full object-cover rounded-lg border cursor-pointer hover:scale-105 transition-transform"
                        loading="lazy"
                        placeholder="empty"
                      />
                    </DialogTrigger>
                    <DialogContent
                      className="max-w-3xl p-0 bg-white border-none shadow-none"
                      showCloseButton={false}
                    >
                      <Image
                        src={img}
                        alt={`Gallery ${i}`}
                        width={500}
                        height={500}
                        className="rounded-lg mx-auto max-h-[80vh"
                        loading="lazy"
                        placeholder="empty"
                      />
                    </DialogContent>
                  </Dialog>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => {
                      setGalleryPreviews((g) =>
                        g.filter((_, idx) => idx !== i),
                      );
                      setGalleryFiles((f) => f.filter((_, idx) => idx !== i));
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Digital Product */}
        <div className="bg-white dark:bg-accent p-5 rounded-xl shadow">
          <div className="flex items-center justify-between mt-2">
            <Label>
              Digital Product
              <span className="text-muted-foreground text-xs">
                (none physical product)
              </span>
            </Label>
            <Switch
              checked={form.is_digital_product}
              onCheckedChange={(val) => updateForm({ is_digital_product: val })}
            />
          </div>
          {form.is_digital_product && (
            <div className="mt-3">
              <Label>
                Upload Digital File
                <span className="text-red-500 text-xs">*</span>
              </Label>
              <label className={`flex items-center gap-2 cursor-pointer mt-2`}>
                <input
                  name="digitalFile"
                  type="file"
                  onChange={handleDigitalFile}
                  className="hidden"
                />
                <Button type="button" variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-1" /> Choose File
                </Button>
                {digitalFile && (
                  <span className="text-sm text-muted-foreground truncate max-w-37.5">
                    {digitalFile.name}
                  </span>
                )}
              </label>
            </div>
          )}
        </div>

        {/* Draft  */}
        <div className="bg-white dark:bg-accent p-5 rounded-xl shadow flex items-center justify-between">
          <Label>Draft</Label>
          <Switch
            checked={!form.is_published}
            onCheckedChange={(val) => updateForm({ is_published: !val })}
          />
        </div>

        {/* Tags */}
        <div className="bg-white dark:bg-accent p-5 rounded-xl shadow">
          <Label>Tags</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addTag())
              }
              placeholder="Add tag"
            />
            <Button type="button" onClick={addTag} variant="outline">
              <Tag className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {tags.map((t) => (
              <Badge key={t}>
                {t}
                <button type="button" onClick={() => removeTag(t)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
        {/* SEO */}
        <div className="bg-white dark:bg-accent p-5 rounded-xl shadow w-full">
          <Label>SEO</Label>
          <Input
            value={form.meta_title}
            onChange={(e) => updateForm({ meta_title: e.target.value })}
            placeholder="Meta title"
            className="mt-2"
          />
          <Textarea
            rows={2}
            value={form.meta_description}
            onChange={(e) => updateForm({ meta_description: e.target.value })}
            placeholder="Meta description"
            className="mt-2"
          />
          <div className="flex gap-2 mt-2">
            <Input
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addKeyword())
              }
              placeholder="Add keyword"
            />
            <Button type="button" onClick={addKeyword} variant="outline">
              <FileText className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {keywords.map((k) => (
              <Badge key={k} className="flex items-center gap-1">
                {k}
                <button type="button" onClick={() => removeKeyword(k)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
