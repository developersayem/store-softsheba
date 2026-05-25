// products/add/page.tsx
import ProductForm from "@/components/dashboard/products/product-form";
import ProductReset from "@/components/dashboard/products/product-reset";

export default function AddProductPage() {
  return (
    <div>
      <ProductReset />
      <ProductForm />
    </div>
  );
}
