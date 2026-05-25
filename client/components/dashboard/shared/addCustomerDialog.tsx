"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { AxiosError } from "axios";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Input } from "@/components/ui/input";
import { ReactNode } from "react";
import { KeyedMutator } from "swr";
import { ICustomer } from "@/types/order.type";

type Props = {
  trigger: ReactNode;
  mutateCustomersData?: KeyedMutator<{ data: ICustomer[] }>;
  initialPhone?: string;
  initialName?: string;
};

export default function AddCustomerDialog({
  trigger,
  mutateCustomersData,
  initialPhone = "",
  initialName = "",
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    full_name: initialName,
    phone: initialPhone,
    address: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.full_name || !newCustomer.phone) {
      toast.error("Name and phone are required");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await api.post("/customers", newCustomer);

      if (res.status === 200 || res.status === 201) {
        toast.success("Customer added successfully");

        setNewCustomer({
          full_name: "",
          phone: "",
          address: "",
        });

        await mutateCustomersData?.();
      }
    } catch (error: unknown) {
      console.error(error);
      let message = "Failed to add customer";
      if (error instanceof AxiosError) {
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className="bg-accent max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Customer</AlertDialogTitle>
          <AlertDialogDescription>
            Fill in customer information below.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-3 py-4">
          <Input
            name="full_name"
            placeholder="Full Name"
            value={newCustomer.full_name}
            onChange={handleInputChange}
          />

          <Input
            name="phone"
            placeholder="Phone"
            value={newCustomer.phone}
            onChange={handleInputChange}
          />

          <Input
            name="address"
            placeholder="Address (Optional)"
            value={newCustomer.address}
            onChange={handleInputChange}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Prevent closing dialog if validation fails
              handleAddCustomer();
            }}
            disabled={isSubmitting}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isSubmitting ? "Saving..." : "Add Customer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
