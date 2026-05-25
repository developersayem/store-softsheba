"use client";

import OrderForm from "@/components/dashboard/orders/OrderForm";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/fetcher";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";

export default function EditOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading, error, mutate } = useSWR(
    id ? `/orders/${id}` : null,
    fetcher,
  );
  console.log(data?.data);

  if (isLoading) return <div>Loading order...</div>;
  if (error) return <div>Failed to load order</div>;

  return (
    <div className="p-6 space-y-4">
        <div className="flex gap-3 items-center">
            <Button
        variant="outline"
        size="icon"
        onClick={() => router.back()}
        className="h-8 w-8"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="text-xl font-semibold">Edit Order</h1>
        </div>
      

      <OrderForm
        initialData={data?.data}
        orderId={id}
        onSuccess={() => {
          mutate();
          router.push("/dashboard/orders");
        }}
      />
    </div>
  );
}
