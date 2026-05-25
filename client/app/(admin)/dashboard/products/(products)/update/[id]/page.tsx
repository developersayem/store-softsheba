// app/dashboard/products/update/[id]/page.tsx
import ProductForm from "@/components/dashboard/products/product-form";
import ProductLoader from "@/components/dashboard/products/product-loader";
import { fetcher } from "@/lib/fetcher";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UpdateProductPage({ params }: PageProps) {
  // Ensure params.id is available (Next.js 15: params is a promise)
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  if (!productId) {
    return <div>Product ID is missing</div>;
  }

  // Fetch product data
  let product = null;
  try {
    const productRes = await fetcher(
      `/products/${productId}/with-all-variants`
    );
    product = productRes?.data || null;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return <div>Failed to load product.</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <ProductLoader data={product} />
      <ProductForm />
    </div>
  );
}
