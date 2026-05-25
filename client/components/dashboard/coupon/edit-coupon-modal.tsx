"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { KeyedMutator } from "swr";
import api from "@/lib/axios";
import { ICoupon } from "@/types/coupon.type";
import { CouponForm } from "./coupon-form";

interface EditCouponModalProps {
  open: boolean;
  onClose: () => void;
  coupon: ICoupon | null;
  mutateCouponsData: KeyedMutator<{ data: ICoupon[] }>;
}

export function EditCouponModal({
  open,
  onClose,
  coupon,
  mutateCouponsData,
}: EditCouponModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await api.patch(`/coupons/${coupon?._id}`, data, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 200) {
        toast.success("Coupon updated successfully");
        await mutateCouponsData();
      }
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  if (!coupon) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-lg bg-accent"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit Coupon</DialogTitle>
        </DialogHeader>

        <CouponForm
          initialData={coupon}
          onSubmit={handleSubmit}
          submitLabel="Update"
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
