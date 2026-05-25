"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { BrandForm } from "./brand-form";
import { IBrand } from "@/types/brand.type";
import { toast } from "sonner";
import { KeyedMutator } from "swr";
import api from "@/lib/axios";

interface EditBrandModalProps {
  open: boolean;
  onClose: () => void;
  brand: IBrand | null;
  mutateBrandsData: KeyedMutator<{ data: IBrand[] }>;
}

export function EditBrandModal({
  open,
  onClose,
  brand,
  mutateBrandsData,
}: EditBrandModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (data: FormData) => {
    if (!brand?._id) return;

    setIsLoading(true);
    try {
      //console.log("data:", data);
      const res = await api.patch(`/brands/${brand._id}`, data);

      if (res.status === 200) {
        toast.success("Brand updated successfully");
        await mutateBrandsData(); // Refresh table
      }
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  if (!brand) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-lg bg-accent"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit Brand</DialogTitle>
        </DialogHeader>

        <BrandForm
          initialData={brand}
          onSubmit={handleSubmit}
          submitLabel="Update"
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
