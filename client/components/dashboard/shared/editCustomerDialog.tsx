"use client";

import { useEffect,  useMemo, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";

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
import useSWR, { KeyedMutator } from "swr";
import { ICustomer } from "@/types/order.type";
import { fetcher } from "@/lib/fetcher";

type Props = {
  id: string;
  trigger: ReactNode;
  mutateCustomersData?: KeyedMutator<{ data: ICustomer[] }>;
  onUpdate?: (updatedCustomer: ICustomer) => void;
};

export default function EditCustomerDialog({
  id,
  trigger,
  mutateCustomersData,
  onUpdate,
}: Props) {
  const { data } = useSWR(`customers/${id}`, fetcher);
  const customer = useMemo(() => data?.data, [data]);
  //console.log(customer);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
  });
  useEffect(() => {
    if (customer) {
      setFormData({
        full_name: customer.full_name || "",
        phone: customer.phone || "",
        address: customer.address || "",
      });
    }
  }, [customer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCustomer = async () => {
    if (!formData.full_name || !formData.phone || !formData.address) {
      toast.error("Name, phone and address are required");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await api.put(`/customers/${id}`, formData);

      if (res.status === 200 || res.status === 201) {
        toast.success("Customer updated successfully");
        await mutateCustomersData?.();
        if (onUpdate && res.data.data) {
          onUpdate(res.data.data);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className="bg-accent max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Customer Data</AlertDialogTitle>
          <AlertDialogDescription>
            Edit the customer information below.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-3 py-4">
          <Input
            name="full_name"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={handleInputChange}
          />

          <Input
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleInputChange}
          />

          <Input
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleInputChange}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={handleAddCustomer}
            disabled={isSubmitting}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isSubmitting ? "Saving..." : "Update Customer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
