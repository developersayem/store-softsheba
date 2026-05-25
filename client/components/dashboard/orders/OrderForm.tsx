"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, Plus, Save, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { IOrder } from "@/types/order.type";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

const orderSchema = z.object({
  status: z.string(),
  payment_method: z.string(),
  shipping_charge: z.number().min(0),
  discount: z.number().min(0),
  subtotal: z.number(),
  total: z.number(),

  shipping_address: z.object({
    full_name: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Phone is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    note: z.string().optional(),
  }),

  items: z.array(
    z.object({
      _id: z.string().optional(),
      name: z.string().min(1, "Product name is required"),
      sku: z.string().optional(),
      price: z.number().min(0),
      quantity: z.number().min(1),
      total: z.number(),
    }),
  ),

  courier: z
    .object({
      name: z.string().optional(),
      trackingCode: z.string().optional(),
      tracking_url: z.string().optional(),
    })
    .optional(),
});

// Infer the type
type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderFormProps {
  initialData: IOrder;
  orderId: string;
  onSuccess?: () => void;
}

export default function OrderForm({
  initialData,
  orderId,
  onSuccess,
}: OrderFormProps) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      status: initialData.status || "pending",
      payment_method: initialData.payment_method || "cod",

      shipping_charge: initialData.shipping_charge || 0,
      discount: initialData.discount || 0,
      subtotal: initialData.subtotal || 0,
      total: initialData.total || 0,

      shipping_address: {
        full_name: initialData?.shipping_address?.full_name || "",
        phone: initialData?.shipping_address?.phone || "",
        address: initialData?.shipping_address?.address || "",
        city: initialData?.shipping_address?.city || "",
        state: initialData?.shipping_address?.state || "",
        postal_code: initialData?.shipping_address?.postal_code || "",
        note: initialData?.shipping_address?.note || "",
      },

      items:
        initialData.items?.map((item) => ({
          ...item,
          sku: item.sku || "",
        })) || [],

      courier: initialData.courier
        ? {
            name: initialData.courier?.name || "",
            trackingCode: initialData.courier?.trackingCode || "",
            tracking_url: initialData.courier?.tracking_url || "",
          }
        : undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Watchers for auto-calculation
  const watchedItems = useWatch({ control: form.control, name: "items" });
  const watchedShipping = useWatch({
    control: form.control,
    name: "shipping_charge",
  });
  const watchedDiscount = useWatch({ control: form.control, name: "discount" });

  useEffect(() => {
    const safeItems = watchedItems || [];

    const newSubtotal = safeItems.reduce((acc, item) => {
      return acc + Number(item.price || 0) * Number(item.quantity || 1);
    }, 0);

    const newTotal =
      newSubtotal + Number(watchedShipping || 0) - Number(watchedDiscount || 0);

    const currentSubtotal = form.getValues("subtotal");
    const currentTotal = form.getValues("total");

    if (currentSubtotal !== newSubtotal) {
      form.setValue("subtotal", newSubtotal);
    }
    if (currentTotal !== newTotal) {
      form.setValue("total", newTotal);
    }
  }, [watchedItems, watchedShipping, watchedDiscount, form]);

  const onSubmit = async (data: OrderFormValues) => {
    try {
      const formattedItems = data.items.map((item) => ({
        ...item,
        total: item.price * item.quantity,
      }));

      const payload = {
        ...data,
        items: formattedItems,
      };

      const res = await api.put(`/orders/${orderId}`, { payload });

      if (res.status !== 200) throw new Error("Failed to update");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Order Number
                </label>
                <div className="p-2 border rounded-md bg-muted text-muted-foreground font-mono">
                  {initialData.order_number}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Customer ID
                </label>
                <div className="p-2 border rounded-md bg-muted text-muted-foreground font-mono text-xs truncate">
                  {initialData.customerId?._id}
                </div>
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cod">Cash on Delivery</SelectItem>
                        <SelectItem value="online_payment">
                          Online Payment
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Courier Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="courier.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="e.g. Pathao"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="courier.trackingCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tracking Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="TRK-123..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Order Items</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ name: "", price: 0, quantity: 1, total: 0, sku: "" })
              }
            >
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-2 items-end border-b pb-4"
                >
                  <div className="col-span-5">
                    <FormField
                      control={form.control}
                      name={`items.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Product Name
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Product Name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.sku`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">SKU</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder="SKU"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Qty</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              min={1}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="shipping_address.full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shipping_address.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shipping_address.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shipping_address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shipping_address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-4 h-4" /> Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">
                  {form.watch("subtotal")?.toFixed(2) || "0.00"}
                </span>
              </div>

              <div className="flex justify-between items-center gap-4">
                <span className="text-sm text-muted-foreground">Shipping</span>
                <FormField
                  control={form.control}
                  name="shipping_charge"
                  render={({ field }) => (
                    <FormItem className="w-24">
                      <FormControl>
                        <Input
                          type="number"
                          className="text-right h-8"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-between items-center gap-4">
                <span className="text-sm text-muted-foreground">Discount</span>
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem className="w-24">
                      <FormControl>
                        <Input
                          type="number"
                          className="text-right h-8"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>{form.watch("total")?.toFixed(2) || "0.00"}</span>
              </div>

              <div className="w-full flex gap-4 pt-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className=""
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className=""
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Update
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}
