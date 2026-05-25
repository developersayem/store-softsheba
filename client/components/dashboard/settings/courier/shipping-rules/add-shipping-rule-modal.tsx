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
import { ShippingRuleForm } from "./shipping-rule-form"; // your new form
import api from "@/lib/axios";
import { toast } from "sonner";
import { KeyedMutator } from "swr";
import { DiamondPlus } from "lucide-react";
import { IShippingRule } from "@/types/shipping_rule.type";

interface AddShippingRuleModalProps {
  mutateShippingRules: KeyedMutator<{ data: IShippingRule[] }>;
  trigger?: React.ReactNode;
}

export function AddShippingRuleModal({
  mutateShippingRules,
  trigger,
}: AddShippingRuleModalProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (payload: Partial<IShippingRule>) => {
    setIsLoading(true);
    try {
      //console.log(payload);
      const res = await api.post("/shipping-rules", payload);
      if (res.status === 201) {
        toast.success("Shipping rule created successfully");
        setOpen(false);
        await mutateShippingRules();
      }
    } catch (error: unknown) {
      console.error("Error creating shipping rule:", error);
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
            Create Shipping Rule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-lg bg-accent max-h-[80vh] overflow-y-auto"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add New Shipping Rule</DialogTitle>
        </DialogHeader>
        <ShippingRuleForm
          onSubmit={handleSubmit}
          submitLabel="Create"
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
