"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShippingRuleForm } from "./shipping-rule-form";
import { toast } from "sonner";
import { KeyedMutator } from "swr";
import api from "@/lib/axios";
import { IShippingRule } from "@/types/shipping_rule.type";

interface EditShippingRuleModalProps {
  open: boolean;
  onClose: () => void;
  shippingRule: IShippingRule | null;
  mutateShippingRulesData: KeyedMutator<{ data: IShippingRule[] }>;
}

export function EditShippingRuleModal({
  open,
  onClose,
  shippingRule,
  mutateShippingRulesData,
}: EditShippingRuleModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (payload: Partial<IShippingRule>) => {
    if (!shippingRule) return;

    setIsLoading(true);
    try {
      const res = await api.put(`/shipping-rules/${shippingRule._id}`, payload);
      if (res.status === 200) {
        toast.success("Shipping rule updated successfully");
        await mutateShippingRulesData(); // refresh rules
      }
    } catch (error: unknown) {
      console.error("Error updating shipping rule:", error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Error updating shipping rule";
      toast.error(message);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  if (!shippingRule) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-lg bg-accent max-h-[80vh] overflow-y-auto"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit Shipping Rule</DialogTitle>
        </DialogHeader>
        <ShippingRuleForm
          initialData={shippingRule}
          onSubmit={handleSubmit}
          submitLabel="Update"
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
