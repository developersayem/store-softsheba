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
import { CollectionForm } from "./collection-form";
import api from "@/lib/axios";
import { toast } from "sonner";
import { KeyedMutator } from "swr";
import { ICollection } from "@/types/collection.type";
import { IProduct } from "@/types/product.type";
import { DiamondPlus } from "lucide-react";

interface AddCollectionModalProps {
  products?: IProduct[];
  mutateCollectionsData: KeyedMutator<{ data: ICollection[] }>;
  trigger?: React.ReactNode;
}

export function AddCollectionModal({
  // products,
  mutateCollectionsData,
  trigger,
}: AddCollectionModalProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await api.post("/collections", data);
      if (res.status === 201) {
        toast.success("Collection created successfully");
        setOpen(false); // close modal
        await mutateCollectionsData(); // refresh collections
      }
    } catch (error: unknown) {
      console.error("Error creating collection:", error);

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
            Create
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-lg bg-accent"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add New Collection</DialogTitle>
        </DialogHeader>
        <CollectionForm
          onSubmit={handleSubmit}
          submitLabel="Create"
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
