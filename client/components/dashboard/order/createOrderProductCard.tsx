"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { IProduct } from "@/types/product.type";
import { IVariant } from "@/types/variant.type";
import Image from "next/image";

interface Props {
  product: IProduct;
  qtyInCart: number;
  addToCart: (product: IProduct, variant?: IVariant) => void;
  updateQty: (productId: string, delta: number, variantId?: string) => void;
}

export default function CreateOrderProductCard({
  product,
  qtyInCart,
  addToCart,
  updateQty,
}: Props) {
  //console.log(qtyInCart);
  const hasVariants =
    product.hasVariants && product.variants && product.variants.length > 0;

  // ✅ auto-select first variant
  const [selectedVariant, setSelectedVariant] = useState<IVariant | null>(
    hasVariants ? product.variants[0] : null,
  );

  // ✅ derive display data (NO duplicated state)
  const display = useMemo(() => {
    if (hasVariants && selectedVariant) {
      return {
        price: selectedVariant.sale_price ?? selectedVariant.regular_price,
        sku: selectedVariant.sku,
        image: selectedVariant.image,
        stock: selectedVariant.stock,
        variantId: selectedVariant._id,
        attributes: {
          name: selectedVariant.attributes?.[0]?.name,
          value: selectedVariant.attributes?.[0]?.value,
        },
      };
    }

    return {
      price: product.sale_price ?? product.regular_price,
      sku: product.sku,
      image: product.thumbnail,
      stock: product.stock,
      attributes: {
        name: product.productAttributes?.[0]?.name,
        value: product.productAttributes?.[0]?.value,
      },
      variantId: undefined,
    };
  }, [hasVariants, selectedVariant, product]);
  //console.log(selectedVariant);

  return (
    <div className="bg-accent p-4 rounded shadow-sm border border-transparent hover:border-teal-100 hover:shadow-md transition-all">
      {/* Top */}
      <div className="flex gap-4 border-b pb-4">
        <Image
          height={100}
          width={100}
          src={display.image ?? ""}
          alt={product.name}
          className="w-16 h-16 rounded object-cover border bg-gray-50"
        />

        <div className="flex-1">
          <h3 className="text-sm font-medium line-clamp-2">{product.name}</h3>
          <div className="text-xs text-blue-500 mt-0.5 font-medium">
            SKU: {display.sku}
          </div>

          {/* ✅ Variant Dropdown */}
          {hasVariants && (
            <select
              className="mt-1 border rounded px-2 py-1 text-xs"
              value={selectedVariant ? String(selectedVariant._id) : ""}
              onChange={(e) => {
                const v = product.variants.find(
                  (x) => String(x._id) === e.target.value,
                );

                setSelectedVariant(v ?? null);
              }}
            >
              {product.variants.map((variant) => (
                <option
                  key={variant._id}
                  value={variant._id}
                  className="bg-accent"
                >
                  {variant.attributes
                    ?.map((a) => `${a.name}: ${a.value}`)
                    .join(" / ")}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-base font-bold">
            BDT{" "}
            {display.price?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </div>

          {display.stock === 0 && (
            <div className="text-[10px] text-red-500 font-medium mt-0.5">
              Out of stock
            </div>
          )}
        </div>

        {/* Cart Controls */}
        {qtyInCart > 0 ? (
          <div className="flex flex-col items-end gap-1 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center bg-teal-600 text-white rounded overflow-hidden shadow-sm">
              <button
                onClick={() => updateQty(product._id, -1, display.variantId)}
                className="px-3 py-1.5 hover:bg-teal-700 transition active:bg-teal-800"
              >
                <Minus size={16} />
              </button>

              <span className="px-2 font-medium min-w-[30px] text-center select-none">
                {qtyInCart}
              </span>

              <button
                onClick={() => updateQty(product._id, 1, display.variantId)}
                className="px-3 py-1.5 hover:bg-teal-700 transition active:bg-teal-800"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              In Cart <Check size={10} />
            </div>
          </div>
        ) : (
          <button
            disabled={display.stock === 0}
            onClick={() => addToCart(product, selectedVariant ?? undefined)}
            className="flex items-center gap-2 border border-teal-600 text-teal-600 px-4 py-1.5 rounded font-medium hover:bg-teal-50 hover:shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <ShoppingCart size={16} /> Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
