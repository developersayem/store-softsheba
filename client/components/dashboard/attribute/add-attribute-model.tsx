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
import { DiamondPlus } from "lucide-react";
import { IAttribute } from "@/types/attributes.type";
import { AttributeForm } from "./attribute-form";

interface AddAttributeModalProps {
  mutateAttributesData: KeyedMutator<{ data: IAttribute[] }>;
  trigger?: React.ReactNode;
}

export function AddAttributeModal({
  mutateAttributesData,
  trigger,
}: AddAttributeModalProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await api.post("/attributes", data, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 201) {
        toast.success("Attribute created successfully");
        setOpen(false); // close modal
        await mutateAttributesData(); // refresh attributes
      }
    } catch (error: unknown) {
      console.error("Error creating attribute:", error);

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
          <DialogTitle>Create New Attribute</DialogTitle>
        </DialogHeader>
        <AttributeForm
          onSubmit={handleSubmit}
          submitLabel="Create"
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
