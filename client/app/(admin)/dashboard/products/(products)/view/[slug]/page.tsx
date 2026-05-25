"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft, Loader2, Pen, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/lib/fetcher";
import { IProduct } from "@/types/product.type";
import { IVariant } from "@/types/variant.type";
import { toast } from "sonner";
import api from "@/lib/axios";

const calculateDiscountPrice = (
  price: number,
  discount: number,
  type: "flat" | "percentage" | null,
) => {
  if (!discount || !type) return price;
  if (type === "flat") return price - discount;
  if (type === "percentage") return price - (price * discount) / 100;
  return price;
};

// Interface for price range information
interface PriceRange {
  minRegularPrice: number;
  maxRegularPrice: number;
  minDiscountedPrice: number;
  maxDiscountedPrice: number;
  hasDiscount: boolean;
  displayPrice: string;
  displayRegularPrice: string;
  maxDiscountPercentage: number;
}

// Enhanced function to get product price range
const getProductPriceRange = (
  product: IProduct | undefined,
): PriceRange | null => {
  if (!product) return null;

  // Handle products WITH variants
  if (product.hasVariants && product.variants && product.variants.length > 0) {
    const variants = product.variants;

    // Get all regular prices
    const regularPrices = variants.map((v: IVariant) => v.regular_price || 0);
    const minRegular = Math.min(...regularPrices);
    const maxRegular = Math.max(...regularPrices);

    // Calculate discounted prices for each variant
    const discountedPrices = variants.map((v: IVariant) =>
      calculateDiscountPrice(
        v.regular_price || 0,
        v.discount || 0,
        v.discount_type,
      ),
    );

    const minDiscounted = Math.min(...discountedPrices);
    const maxDiscounted = Math.max(...discountedPrices);

    // Check if ANY variant has a discount
    const hasDiscount = variants.some(
      (v: IVariant) => v.discount && v.discount > 0,
    );

    // Calculate maximum discount percentage across all variants
    let maxDiscountPercentage = 0;
    if (hasDiscount) {
      const discountPercentages = variants
        .filter((v: IVariant) => v.discount && v.discount > 0)
        .map((v: IVariant) => {
          if (v.discount_type === "percentage") {
            return v.discount || 0;
          } else if (v.discount_type === "flat") {
            return ((v.discount || 0) / (v.regular_price || 1)) * 100;
          }
          return 0;
        });

      maxDiscountPercentage = Math.max(...discountPercentages, 0);
    }

    // Format display strings
    const displayPrice =
      minDiscounted === maxDiscounted
        ? `৳${minDiscounted.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
        : `৳${minDiscounted
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} - ৳${maxDiscounted
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

    const displayRegularPrice =
      minRegular === maxRegular
        ? `৳${minRegular.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
        : `৳${minRegular
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} - ৳${maxRegular
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

    return {
      minRegularPrice: minRegular,
      maxRegularPrice: maxRegular,
      minDiscountedPrice: minDiscounted,
      maxDiscountedPrice: maxDiscounted,
      hasDiscount,
      displayPrice,
      displayRegularPrice,
      maxDiscountPercentage: Math.round(maxDiscountPercentage),
    };
  }

  // Handle products WITHOUT variants (single product)
  const regularPrice = product.regular_price || 0;
  const discountedPrice = calculateDiscountPrice(
    regularPrice,
    product.discount || 0,
    product.discount_type,
  );
  const hasDiscount = product.discount && product.discount > 0;

  let maxDiscountPercentage = 0;
  if (hasDiscount && product.discount) {
    if (product.discount_type === "percentage") {
      maxDiscountPercentage = product.discount;
    } else if (product.discount_type === "flat") {
      maxDiscountPercentage = (product.discount / regularPrice) * 100;
    }
  }

  return {
    minRegularPrice: regularPrice,
    maxRegularPrice: regularPrice,
    minDiscountedPrice: discountedPrice,
    maxDiscountedPrice: discountedPrice,
    hasDiscount: !!hasDiscount,
    displayPrice: `৳${discountedPrice
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
    displayRegularPrice: `৳${regularPrice
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
    maxDiscountPercentage: Math.round(maxDiscountPercentage),
  };
};

export default function ProductViewPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const { data, isLoading, mutate } = useSWR<{ data: IProduct }>(
    slug ? `/products/slug/${slug}` : null,
    fetcher,
  );

  const product = data?.data;

  // helper function to get product stock from product and its variants
  const getProductStock = () => {
    if (!product) return 0;
    if (
      product.hasVariants &&
      product.variants &&
      product.variants.length > 0
    ) {
      return product.variants.reduce(
        (total, variant) => total + (variant.stock || 0),
        0,
      );
    }
    return product.stock || 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h2 className="text-2xl font-bold text-muted-foreground">
          Product not found
        </h2>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  // Get price information using the enhanced function
  const priceInfo = getProductPriceRange(product);

  const handleDeleteProduct = async () => {
    try {
      const res = await api.delete(`/products/${product._id}`);
      if (res.status === 200) {
        toast.success("Product deleted successfully");
        router.push("/dashboard/products");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting product");
    }
  };

  const handleVariantDelete = async (variantId: string) => {
    try {
      const response = await api.delete(`/products/variants/${variantId}`, {
        method: "DELETE",
      });

      if (response.status === 200) {
        toast.success("Variant deleted successfully");
        mutate();
      } else {
        toast.error("Failed to delete variant");
      }
    } catch (error) {
      console.error("Error deleting variant:", error);
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">
          Product Details
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft /> Back
          </Button>
          {product._id && (
            <Link href={`/dashboard/products/update/${product._id}`}>
              <Button variant="default">
                <Pen /> Edit
              </Button>
            </Link>
          )}
          <Button variant="destructive" onClick={handleDeleteProduct}>
            <Trash2 /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Image */}
        <div className="md:col-span-1">
          <div className="aspect-square relative bg-gray-50 dark:bg-muted/50 rounded-lg border border-gray-100 dark:border-border overflow-hidden flex items-center justify-center">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.name}
                fill
                className="object-contain p-4"
              />
            ) : (
              <div className="text-gray-300">
                <svg
                  className="w-24 h-24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-2 space-y-6 capitalize">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-500 font-medium">
              <span>Status:</span>
              <span
                className={
                  product.is_published ? "text-green-500" : "text-yellow-500"
                }
              >
                {product.is_published
                  ? "This product Published"
                  : "This product not Published yet"}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 dark:text-foreground">
              {product.name}
            </h1>

            {product.sku && (
              <div className="text-gray-500">
                SKU :{" "}
                <span className="text-gray-900 dark:text-foreground font-medium">
                  {product.sku}
                </span>
              </div>
            )}

            {/* Enhanced Price Display with Range Support */}
            <div className="flex items-center gap-3 flex-wrap">
              {priceInfo && (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-foreground">
                      {priceInfo.displayPrice}
                    </span>
                    <span className="text-lg text-gray-500">(Cash Price)</span>
                  </div>

                  {priceInfo.hasDiscount && (
                    <>
                      <Badge className="bg-emerald-100 text-emerald-600 hover:bg-emerald-100 border-none text-base px-3 py-1">
                        {priceInfo.maxDiscountPercentage > 0
                          ? `Up to ${priceInfo.maxDiscountPercentage}% OFF`
                          : "SALE"}
                      </Badge>
                      <span className="text-xl text-gray-400 line-through">
                        {priceInfo.displayRegularPrice}
                      </span>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Badge
                className={
                  getProductStock() > 0
                    ? "bg-emerald-500 hover:bg-emerald-600 border-none"
                    : "bg-red-500 hover:bg-red-600 border-none"
                }
              >
                {getProductStock() > 0 ? "In Stock" : "Out of Stock"}
              </Badge>
              <span className="text-gray-500 text-sm">
                QUANTITY: {getProductStock()}
              </span>
            </div>

            <div
              className="text-gray-500 prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: product.short_description || "",
              }}
            />
            <div
              className="text-gray-500 prose prose-sm dark:prose-invert max-w-none mt-4"
              dangerouslySetInnerHTML={{
                __html: product.long_description || "",
              }}
            />

            {/* Product Info Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-border">
              {product.brand && (
                <div>
                  <span className="text-sm text-gray-500">Brand</span>
                  <p className="font-medium text-gray-900 dark:text-foreground">
                    {typeof product.brand === "object"
                      ? product.brand.name
                      : product.brand}
                  </p>
                </div>
              )}

              {priceInfo?.hasDiscount && (
                <div>
                  <span className="text-sm text-gray-500">Discount</span>
                  <p className="font-medium text-gray-900 dark:text-foreground">
                    Up to {priceInfo.maxDiscountPercentage}% OFF
                  </p>
                </div>
              )}

              {product.sold > 0 && (
                <div>
                  <span className="text-sm text-gray-500">Sold</span>
                  <p className="font-medium text-gray-900 dark:text-foreground">
                    {product.sold} units
                  </p>
                </div>
              )}
              {!product.hasVariants && (
                <div>
                  <span className="text-sm text-gray-500">
                    Purchase Price (Cost)
                  </span>
                  <p className="font-medium text-gray-900 dark:text-foreground">
                    ৳
                    {(product.purchase_price || 0)
                      .toFixed(0)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                </div>
              )}
            </div>

            {product.categories && product.categories.length > 0 && (
              <div className="flex items-center gap-2 text-gray-700 pt-4">
                <span className="font-semibold text-gray-900 dark:text-foreground">
                  Categories:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((c, idx) => (
                    <Badge key={idx} variant="secondary">
                      {c.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Variant List Section */}
      {product.hasVariants &&
        product.variants &&
        product.variants.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-foreground mb-6">
              Product Variant List
            </h2>
            <div className="border border-gray-100 dark:border-border rounded-md overflow-hidden bg-white dark:bg-accent shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px] font-bold text-gray-700 dark:text-muted-foreground">
                      SR
                    </TableHead>
                    <TableHead className="w-[80px] font-bold text-gray-700 dark:text-muted-foreground">
                      IMAGE
                    </TableHead>
                    <TableHead className="font-bold text-gray-700 dark:text-muted-foreground">
                      VARIANT
                    </TableHead>
                    <TableHead className="font-bold text-gray-700 dark:text-muted-foreground">
                      SKU
                    </TableHead>

                    <TableHead className="font-bold text-gray-700 dark:text-muted-foreground">
                      PRICE
                    </TableHead>
                    <TableHead className="font-bold text-gray-700 dark:text-muted-foreground">
                      SALE PRICE
                    </TableHead>
                    <TableHead className="font-bold text-gray-700 dark:text-muted-foreground">
                      PURCHASE PRICE
                    </TableHead>

                    <TableHead className="font-bold text-gray-700 dark:text-muted-foreground">
                      STOCK
                    </TableHead>
                    <TableHead className="font-bold text-gray-700 dark:text-muted-foreground">
                      STATUS
                    </TableHead>
                    <TableHead className="font-bold text-gray-700 dark:text-muted-foreground">
                      ACTION
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.variants.map((variant: IVariant, index: number) => (
                    <TableRow
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-muted/50"
                    >
                      <TableCell className="font-medium text-gray-900 dark:text-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="relative w-10 h-10 rounded border dark:border-border bg-gray-50 dark:bg-muted/50 flex items-center justify-center overflow-hidden">
                          {variant.image ? (
                            <Image
                              src={variant.image}
                              alt="Variant"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="text-gray-300">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900 dark:text-foreground">
                          {variant.attributes && variant.attributes.length > 0
                            ? variant.attributes.map((a) => a.value).join(" / ")
                            : "Default Variant"}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-foreground font-medium">
                        {variant.sku || "--"}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-foreground font-medium">
                        ৳
                        {(variant.regular_price || 0)
                          .toFixed(0)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-foreground font-medium">
                        <div className="flex items-center gap-2">
                          <span>
                            ৳
                            {calculateDiscountPrice(
                              variant.regular_price || 0,
                              variant.discount || 0,
                              variant.discount_type,
                            )
                              .toFixed(0)
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          </span>
                          {variant.discount && variant.discount > 0 && (
                            <Badge className="bg-emerald-100 text-emerald-600 hover:bg-emerald-100 border-none text-xs">
                              {variant.discount_type === "percentage"
                                ? `${variant.discount}%`
                                : `৳${variant.discount}`}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-foreground font-medium">
                        ৳
                        {(variant.purchase_price || 0)
                          .toFixed(0)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </TableCell>

                      <TableCell className="text-gray-900 dark:text-foreground font-medium">
                        {variant.stock}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            variant.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {variant.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          className="text-red-500"
                          onClick={() =>
                            handleVariantDelete(variant._id as string)
                          }
                        >
                          <Trash2 />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
    </div>
  );
}
