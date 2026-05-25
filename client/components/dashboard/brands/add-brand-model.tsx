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
import { IProduct } from "@/types/product.type";
import { DiamondPlus } from "lucide-react";
import { IBrand } from "@/types/brand.type";
import { BrandForm } from "./brand-form";

interface AddBrandsModalProps {
  products?: IProduct[];
  mutateBrandsData: KeyedMutator<{ data: IBrand[] }>;
  trigger?: React.ReactNode;
}

export function AddBrandsModal({
  // products,
  mutateBrandsData,
  trigger,
}: AddBrandsModalProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await api.post("/brands", data);
      if (res.status === 201) {
        toast.success("Brand created successfully");
        setOpen(false); // close modal
        await mutateBrandsData(); // refresh brands
      }
    } catch (error: unknown) {
      console.error("Error creating brand:", error);

      // If backend sends a structured error
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
        {trigger ? (
          trigger
        ) : (
          <Button size="sm" type="button">
            <DiamondPlus />
            Add
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-lg bg-accent"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add New Brand</DialogTitle>
        </DialogHeader>
        <BrandForm
          onSubmit={handleSubmit}
          submitLabel="Add"
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
