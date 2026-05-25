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
import { CategoryForm } from "./category-form";
import api from "@/lib/axios";
import { toast } from "sonner";
import { KeyedMutator } from "swr";
import { DiamondPlus } from "lucide-react";
import { ICategory } from "@/types/category.type";

interface AddCategoriesModalProps {
  categoriesData: ICategory[];
  mutateCategoriesData: KeyedMutator<{ data: ICategory[] }>;
  trigger?: React.ReactNode;
}

export function AddCategoriesModal({
  categoriesData,
  mutateCategoriesData,
  trigger,
}: AddCategoriesModalProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // todo: need to update
  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      console.log("From data:", Object.fromEntries([...data.entries()]));
      const formData = Object.fromEntries([...data.entries()]) as {
        [key: string]: string;
      };
      console.log("Form data:", formData);
      const res = await api.post("/categories", data);
      if (res.status === 201) {
        toast.success("Category created successfully");
        setOpen(false); // close modal
        await mutateCategoriesData(); // refresh categories
      }
    } catch (error: unknown) {
      console.error("Error creating category:", error);
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
        className="sm:max-w-lg bg-accent  -translate-y-[45%]"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <CategoryForm
          parentOptions={categoriesData.map((category) => ({
            _id: category._id,
            name: category.name,
          }))}
          onSubmit={handleSubmit}
          submitLabel="Create"
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
