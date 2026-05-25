"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import api from "@/lib/axios";
import { toast } from "sonner";
import { KeyedMutator } from "swr";
import { ICoupon } from "@/types/coupon.type";
import { DiamondPlus } from "lucide-react";
import { CouponForm } from "./coupon-form";

interface AddCouponModalProps {
  mutateCouponsData: KeyedMutator<{ data: ICoupon[] }>;
}

export function AddCouponModal({ mutateCouponsData }: AddCouponModalProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await api.post("/coupons", data, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 201) {
        toast.success("Coupon created successfully");
        setOpen(false);
        await mutateCouponsData();
      }
    } catch (error: unknown) {
      console.error("Error creating coupon:", error);

      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Something went wrong. Please try again.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <DiamondPlus />
          Create
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-lg bg-accent"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Create New Coupon</DialogTitle>
        </DialogHeader>

        <CouponForm
          onSubmit={handleSubmit}
          submitLabel="Create"
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
