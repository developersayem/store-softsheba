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
import { IAttribute } from "@/types/attributes.type";
import { AttributeForm } from "./attribute-form";

interface EditAttributeModalProps {
  open: boolean;
  onClose: () => void;
  attribute: IAttribute | null; // FIXED
  mutateAttributesData: KeyedMutator<{ data: IAttribute[] }>; // FIXED
}

export function EditAttributeModal({
  open,
  onClose,
  attribute,
  mutateAttributesData,
}: EditAttributeModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await api.patch(`/attributes/${attribute?._id}`, data, {
        headers: { "Content-Type": "application/json" },
      }); // FIXED ENDPOINT
      if (res.status === 200) {
        toast.success("Attribute updated successfully");
        await mutateAttributesData(); // FIXED
      }
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  if (!attribute) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-lg bg-accent"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit Attribute</DialogTitle> {/* FIXED */}
        </DialogHeader>

        <AttributeForm
          initialData={attribute} // FIXED
          onSubmit={handleSubmit}
          submitLabel="Update"
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
