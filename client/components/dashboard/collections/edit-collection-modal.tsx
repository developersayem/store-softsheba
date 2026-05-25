"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CollectionForm } from "./collection-form";
import { ICollection } from "@/types/collection.type";
import { toast } from "sonner";
import { KeyedMutator } from "swr";
import api from "@/lib/axios";

interface EditCollectionModalProps {
  open: boolean;
  onClose: () => void;
  collection: ICollection | null;
  mutateCollectionsData: KeyedMutator<{ data: ICollection[] }>;
}

export function EditCollectionModal({
  open,
  onClose,
  collection,
  mutateCollectionsData,
}: EditCollectionModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await api.put(`/collections/${collection?._id}`, data);
      if (res.status === 200) {
        toast.success("Collection updated successfully");
        await mutateCollectionsData(); // refresh collections
      }
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  if (!collection) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-lg bg-accent"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
        </DialogHeader>
        <CollectionForm
          initialData={collection}
          onSubmit={handleSubmit}
          submitLabel="Update"
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
