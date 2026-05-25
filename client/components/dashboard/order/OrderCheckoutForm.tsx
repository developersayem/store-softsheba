"use client";

import api from "@/lib/axios";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Plus } from "lucide-react";

import { Dispatch, SetStateAction } from "react";
import AddCustomerDialog from "../shared/addCustomerDialog";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

/* ---------------- SCHEMA ---------------- */

export const checkoutSchema = z.object({
  customerId: z.string().optional(),
  name: z.string(),
  phone: z.string(),
  deliveryType: z.string(),
  deliveryAddress: z.string(),
  pickupAddress: z.string().optional(),

  shippingDate: z.string().optional(),

  courier: z.string(),
  preferredPartner: z.string().optional(),
  orderSource: z.string().optional(),

  paymentMethod: z.union([z.literal("cod"), z.literal("online_payment")]),

  advanceAmount: z.number().min(0),

  discountType: z.union([z.literal("flat"), z.literal("percent")]),
  discount: z.number().min(0),

  deliveryFee: z.number().min(0),
  isFreeDelivery: z.boolean(),

  notes: z.string().optional(),
  internalNotes: z.string().optional(),

  carrybeeCity: z.string().optional(),
  carrybeeZone: z.string().optional(),
  carrybeeArea: z.string().optional(),
  carrybeeSecondaryPhone: z.string().optional(),
  isClosedBox: z.boolean().default(false),
  isExchange: z.boolean().default(false),
  weight: z.number().optional(),
});

export interface ICheckout {
  customerId?: string;
  name: string;
  phone: string;
  deliveryType: string;
  deliveryAddress: string;
  pickupAddress?: string;
  shippingDate?: string;
  courier: string;
  preferredPartner?: string;
  orderSource?: string;
  paymentMethod: "cod" | "online_payment";
  advanceAmount: number;
  discountType: "flat" | "percent";
  discount: number;
  deliveryFee: number;
  isFreeDelivery: boolean;
  notes?: string;
  internalNotes?: string;
  carrybeeCity?: string;
  carrybeeZone?: string;
  carrybeeArea?: string;
  carrybeeSecondaryPhone?: string;
  isClosedBox: boolean;
  isExchange: boolean;
  weight?: number;
}

/* ---------------- TYPES ---------------- */

export type Customer = {
  _id: string;
  full_name: string;
  phone: string;
  address: string;
};

interface ICartItem {
  _id: string;
  name: string;
  price: number;
  qty: number;
  quantity?: number;
  attributes?: {
    name: string;
    value: string;
    unit?: string;
  }[];
  selectedAttributes?: {
    name?: string;
    attribute?: string;
    value: string;
    unit?: string;
  }[];
  productAttributes?: {
    name?: string;
    attribute?: string;
    value: string;
    unit?: string;
  }[];
  weight?: number;
}

type Props = {
  selectedCustomer: Customer | null;
  setSelectedCustomer: Dispatch<SetStateAction<Customer | null>>;
  setCheckoutStep: Dispatch<
    SetStateAction<"cart" | "checkout-form" | "checkout-page">
  >;
  setOrderCheckoutStep?: Dispatch<SetStateAction<"order" | "checkout-page">>;
  onSubmitOrder: (data: ICheckout) => void;
  cartSubtotal: number;
  checkoutData: ICheckout | null;
  setCheckoutData: Dispatch<SetStateAction<ICheckout | null>>;
  cart: ICartItem[];
};

/* ---------------- COMPONENT ---------------- */

export default function OrderCheckoutForm({
  setCheckoutStep,
  onSubmitOrder,
  cartSubtotal,
  selectedCustomer,
  setSelectedCustomer,
  checkoutData,
  cart,
  // handleCheckoutSubmit,
}: Props) {
  const { data } = useSWR("/customers", fetcher);
  //console.log(data.data)
  const customers = data?.data ?? [];
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerDropdown, setCustomerDropdown] = useState(false);

  // Carrybee Specific State
  interface ICarrybeeCity {
    id: number;
    name: string;
  }
  interface ICarrybeeZone {
    id: number;
    name: string;
  }
  interface ICarrybeeArea {
    id: number;
    name: string;
  }

  const [cities, setCities] = useState<ICarrybeeCity[]>([]);
  const [zones, setZones] = useState<ICarrybeeZone[]>([]);
  const [areas, setAreas] = useState<ICarrybeeArea[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const form = useForm<ICheckout>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(checkoutSchema) as any,
    defaultValues: checkoutData ?? {
      deliveryType: "regular",
      courier: "steadfast",
      paymentMethod: "cod",
      advanceAmount: 0,
      discountType: "flat",
      discount: 0,
      deliveryFee: 0,
      isFreeDelivery: false,
      carrybeeSecondaryPhone: "",
      isClosedBox: false,
      isExchange: false,
      weight: 500,
    },
  });

  const { courier } = form.watch();
  const deliveryType = form.watch("deliveryType");
  const isFreeDelivery = form.watch("isFreeDelivery");

  const discount = form.watch("discount") || 0;
  const discountType = form.watch("discountType");
  const deliveryFee = form.watch("deliveryFee") || 0;
  const advance = form.watch("advanceAmount") || 0;
  const discountAmount =
    discountType === "percent" ? (cartSubtotal * discount) / 100 : discount;

  const total = cartSubtotal - discountAmount + deliveryFee - advance;

  const filteredCustomers = customers.filter(
    (c: Customer) =>
      c.phone.includes(customerSearch) ||
      c.full_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.address?.toLowerCase().includes(customerSearch.toLowerCase()),
  );

  const submitHandler = (data: ICheckout) => {
    onSubmitOrder(data);
  };
  useEffect(() => {
    if (selectedCustomer) {
      setCustomerSearch(selectedCustomer.phone);
      form.setValue("customerId", selectedCustomer._id);
      form.setValue("name", selectedCustomer.full_name);
      form.setValue("phone", selectedCustomer.phone);
      form.setValue("deliveryAddress", selectedCustomer.address);
    }
  }, [selectedCustomer, form]);

  // Removed redundant courier declaration

  useEffect(() => {
    if (courier === "carrybee") {
      fetchCities();
    }
  }, [courier]);

  // If already have city/zone/area IDs from checkoutData, fetch their sub-items
  useEffect(() => {
    const cityId = form.getValues("carrybeeCity");
    const zoneId = form.getValues("carrybeeZone");
    if (cityId) fetchZones(cityId);
    if (cityId && zoneId) fetchAreas(cityId, zoneId);
  }, [courier, form]); // Run once when courier changes or on mount if already carrybee

  const fetchCities = async () => {
    setLoadingLocations(true);
    try {
      const res = await api.get("/courier-api/carrybee/cities");
      setCities(res.data.data);
    } catch (error) {
      console.error("Failed to fetch Carrybee cities", error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchZones = async (cityId: string) => {
    setLoadingLocations(true);
    try {
      const res = await api.get(`/courier-api/carrybee/zones/${cityId}`);
      setZones(res.data.data);
    } catch (error) {
      console.error("Failed to fetch Carrybee zones", error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchAreas = async (cityId: string, zoneId: string) => {
    setLoadingLocations(true);
    try {
      const res = await api.get(
        `/courier-api/carrybee/areas/${cityId}/${zoneId}`,
      );
      setAreas(res.data.data);
      return res.data.data;
    } catch (error) {
      console.error("Failed to fetch Carrybee areas", error);
    } finally {
      setLoadingLocations(false);
    }
  };

  // AUTO-DETECT AREA LOGIC
  const deliveryAddress = form.watch("deliveryAddress");

  const normalizeStr = (s: string) =>
    s
      .toLowerCase()
      .replace(/[\s\-_,./()]/g, "")
      .trim();

  useEffect(() => {
    if (courier === "carrybee" && deliveryAddress && cities.length > 0) {
      const addr = normalizeStr(deliveryAddress);

      // 1. Try to find matched City
      const matchedCity = cities.find((c) =>
        addr.includes(normalizeStr(c.name)),
      );
      if (
        matchedCity &&
        form.getValues("carrybeeCity") !== matchedCity.id.toString()
      ) {
        form.setValue("carrybeeCity", matchedCity.id.toString());
        form.setValue("carrybeeZone", "");
        form.setValue("carrybeeArea", "");
        fetchZones(matchedCity.id.toString());
      }
    }
  }, [deliveryAddress, courier, cities, form]);

  useEffect(() => {
    const cityId = form.watch("carrybeeCity");
    if (
      courier === "carrybee" &&
      deliveryAddress &&
      zones.length > 0 &&
      cityId
    ) {
      const addr = normalizeStr(deliveryAddress);

      // 2. Try to find matched Zone
      const matchedZone = zones.find((z) =>
        addr.includes(normalizeStr(z.name)),
      );
      if (
        matchedZone &&
        form.getValues("carrybeeZone") !== matchedZone.id.toString()
      ) {
        form.setValue("carrybeeZone", matchedZone.id.toString());
        form.setValue("carrybeeArea", "");
        fetchAreas(cityId, matchedZone.id.toString());
      }
    }
  }, [deliveryAddress, courier, zones, form]);

  useEffect(() => {
    const cityId = form.watch("carrybeeCity");
    const zoneId = form.watch("carrybeeZone");
    if (
      courier === "carrybee" &&
      deliveryAddress &&
      areas.length > 0 &&
      cityId &&
      zoneId
    ) {
      const addr = normalizeStr(deliveryAddress);

      // 3. Try to find matched Area
      const matchedArea = areas.find((a) =>
        addr.includes(normalizeStr(a.name)),
      );
      if (
        matchedArea &&
        form.getValues("carrybeeArea") !== matchedArea.id.toString()
      ) {
        form.setValue("carrybeeArea", matchedArea.id.toString());
      }
    }
  }, [deliveryAddress, courier, areas, form]);

  const convertBengaliToEnglish = (s: string): string => {
    const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return s.replace(/[০-৯]/g, (w) => bengaliDigits.indexOf(w).toString());
  };

  useEffect(() => {
    if (courier === "carrybee" && cart && cart.length > 0) {
      let totalWeight = 0;

      cart.forEach((item: ICartItem) => {
        let itemWeightGrams = 0;
        let foundInAttributes = false;

        // 1. Try to find weight in various attribute fields
        const attributes =
          item.attributes || item.selectedAttributes || item.productAttributes;

        const processAttr = (attr: {
          name?: string;
          attribute?: string;
          value: string;
          unit?: string;
        }) => {
          const name = (attr.name || attr.attribute || "").toLowerCase();
          const value = (attr.value || "").toLowerCase();
          const unit = (attr.unit || "").toLowerCase();
          const combined = (name + " " + value + " " + unit).toLowerCase();

          if (
            combined.includes("weight") ||
            combined.includes("ওজন") ||
            combined.includes("kg") ||
            combined.includes("gm") ||
            combined.includes("gram") ||
            combined.includes("কেজি") ||
            combined.includes("গ্রাম")
          ) {
            const cleanVal = convertBengaliToEnglish(value);
            const numericPart = parseFloat(cleanVal.replace(/[^0-9.]/g, ""));

            if (!isNaN(numericPart)) {
              const isKg =
                combined.includes("kg") ||
                combined.includes("কেজি") ||
                item.name.toLowerCase().includes("kg") ||
                item.name.includes("কেজি");

              itemWeightGrams = numericPart * (isKg ? 1000 : 1);
              foundInAttributes = true;
              return true;
            }
          }
          return false;
        };

        if (Array.isArray(attributes)) {
          for (const attr of attributes) {
            if (processAttr(attr)) break;
          }
        } else if (attributes && typeof attributes === "object") {
          // Handle object map case
          for (const [key, val] of Object.entries(attributes)) {
            if (processAttr({ name: key, value: String(val) })) break;
          }
        }

        // 2. Fallback: Parse from product name if not found in attributes
        if (!foundInAttributes) {
          const nameEng = convertBengaliToEnglish(item.name || "");
          const weightMatches = nameEng.match(
            /(\d+(?:\.\d+)?)\s*(?:kg|কেজি|গ্রাম|gm|gram)/gi,
          );
          if (weightMatches && weightMatches.length > 0) {
            // Take the FIRST match (usually the base weight)
            const firstMatch = weightMatches[0];
            const numericPart = parseFloat(firstMatch.replace(/[^0-9.]/g, ""));
            if (!isNaN(numericPart)) {
              const isKg =
                firstMatch.toLowerCase().includes("kg") ||
                firstMatch.includes("কেজি");
              itemWeightGrams = numericPart * (isKg ? 1000 : 1);
            }
          }
        }

        // 3. Final Fallback: Product-level weight field
        if (itemWeightGrams === 0 && item.weight) {
          itemWeightGrams = item.weight;
        }

        if (itemWeightGrams > 0) {
          totalWeight += itemWeightGrams * (item.qty || item.quantity || 1);
        }
      });

      if (totalWeight > 0) {
        form.setValue("weight", Math.round(totalWeight), {
          shouldValidate: true,
          shouldDirty: true,
        });
      } else if (!form.getValues("weight")) {
        form.setValue("weight", 500);
      }
    }
  }, [courier, cart, form]);

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSubmit={form.handleSubmit(submitHandler as any)}
        className="p-4 space-y-5 bg-muted/30 rounded-lg"
      >
        {/* DELIVERY TYPE */}

        <FormField
          control={form.control}
          name="deliveryType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* CUSTOMER SEARCH */}

        <FormItem>
          <FormLabel>Search Customer</FormLabel>

          <div className="flex gap-2">
            <Popover open={customerDropdown} onOpenChange={setCustomerDropdown}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 justify-start">
                  {customerSearch || "Search Customer"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0">
                <Command>
                  <CommandInput
                    placeholder="Search phone or name"
                    value={customerSearch}
                    onValueChange={setCustomerSearch}
                  />

                  {filteredCustomers.length === 0 && (
                    <CommandEmpty className="py-6 text-center text-muted-foreground">
                      <p className="text-xs mb-2">No customer found</p>
                      <AddCustomerDialog
                        initialPhone={
                          /^\d+$/.test(customerSearch) ? customerSearch : ""
                        }
                        initialName={
                          /^\d+$/.test(customerSearch) ? "" : customerSearch
                        }
                        trigger={
                          <Button
                            variant="link"
                            className="text-teal-600 p-0 h-auto text-xs"
                          >
                            Add &quot;{customerSearch}&quot; as new customer
                          </Button>
                        }
                      />
                    </CommandEmpty>
                  )}

                  <CommandGroup>
                    {filteredCustomers.map((customer: Customer) => (
                      <CommandItem
                        key={customer._id}
                        onSelect={() => {
                          form.setValue("customerId", customer._id);
                          form.setValue("name", customer.full_name);
                          form.setValue("phone", customer.phone);
                          form.setValue("deliveryAddress", customer.address);
                          setCustomerSearch(customer.phone);
                          setCustomerDropdown(false);
                          setSelectedCustomer(customer);
                        }}
                      >
                        <div className="flex flex-col">
                          <span>
                            {customer.full_name} ({customer.phone})
                          </span>
                          {customer.address && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {customer.address}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            <AddCustomerDialog
              trigger={
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 bg-teal-600 text-white hover:bg-teal-700 hover:text-white border-teal-600"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        </FormItem>

        {/* ADDRESS */}

        {deliveryType !== "pickup" && (
          <FormField
            control={form.control}
            name="deliveryAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Address</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {deliveryType === "pickup" && (
          <FormField
            control={form.control}
            name="pickupAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pickup Address</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {/* SHIPPING DATE */}

        <FormField
          control={form.control}
          name="shippingDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shipping Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* COURIER */}

        <FormField
          control={form.control}
          name="courier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Delivery Partner</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  <SelectItem value="steadfast">Steadfast</SelectItem>
                  <SelectItem value="pathao">Pathao</SelectItem>
                  <SelectItem value="carrybee">Carrybee</SelectItem>
                  <SelectItem value="redx">RedX</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {courier === "carrybee" && (
          <div className="space-y-4 p-4 border rounded-md bg-white dark:bg-accent/50">
            <div className="flex items-center justify-between">
              <FormLabel className="text-sm font-semibold">
                Delivery Area (Carrybee)
              </FormLabel>
              {loadingLocations && (
                <span className="text-[10px] text-teal-600 animate-pulse">
                  Detecting...
                </span>
              )}
            </div>

            {/* Nuport-style breadcrumb/chips UI */}
            <div className="flex flex-wrap gap-2 items-center min-h-[40px] p-2 rounded-lg bg-muted/30 border border-dashed">
              {!form.watch("carrybeeCity") && !form.watch("carrybeeZone") && (
                <span className="text-xs text-muted-foreground italic">
                  No area detected yet...
                </span>
              )}

              {form.watch("carrybeeCity") && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 rounded-md border border-teal-200/50 text-[11px] font-medium">
                  {
                    cities.find(
                      (c) => c.id.toString() === form.watch("carrybeeCity"),
                    )?.name
                  }
                  <button
                    type="button"
                    onClick={() => {
                      form.setValue("carrybeeCity", "");
                      form.setValue("carrybeeZone", "");
                      form.setValue("carrybeeArea", "");
                      setZones([]);
                      setAreas([]);
                    }}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              )}

              {form.watch("carrybeeZone") && (
                <>
                  <span className="text-muted-foreground text-xs">{">"}</span>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 rounded-md border border-teal-200/50 text-[11px] font-medium">
                    {
                      zones.find(
                        (z) => z.id.toString() === form.watch("carrybeeZone"),
                      )?.name
                    }
                    <button
                      type="button"
                      onClick={() => {
                        form.setValue("carrybeeZone", "");
                        form.setValue("carrybeeArea", "");
                        setAreas([]);
                      }}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                </>
              )}

              {form.watch("carrybeeArea") && (
                <>
                  <span className="text-muted-foreground text-xs">{">"}</span>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 rounded-md border border-teal-200/50 text-[11px] font-medium">
                    {
                      areas.find(
                        (a) => a.id.toString() === form.watch("carrybeeArea"),
                      )?.name
                    }
                    <button
                      type="button"
                      onClick={() => {
                        form.setValue("carrybeeArea", "");
                      }}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Selectors only shown if not matched or user wants to override */}
              {!form.watch("carrybeeCity") && (
                <FormField
                  control={form.control}
                  name="carrybeeCity"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue("carrybeeZone", "");
                          form.setValue("carrybeeArea", "");
                          fetchZones(val);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Select City" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem
                              key={city.id}
                              value={city.id.toString()}
                            >
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}

              {form.watch("carrybeeCity") && !form.watch("carrybeeZone") && (
                <FormField
                  control={form.control}
                  name="carrybeeZone"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue("carrybeeArea", "");
                          fetchAreas(form.getValues("carrybeeCity")!, val);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue
                              placeholder={
                                loadingLocations ? "Loading..." : "Select Zone"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {zones.map((zone) => (
                            <SelectItem
                              key={zone.id}
                              value={zone.id.toString()}
                            >
                              {zone.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}

              {form.watch("carrybeeZone") &&
                !form.watch("carrybeeArea") &&
                areas.length > 0 && (
                  <FormField
                    control={form.control}
                    name="carrybeeArea"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue
                                placeholder={
                                  loadingLocations
                                    ? "Loading..."
                                    : "Select Area"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {areas.map((area) => (
                              <SelectItem
                                key={area.id}
                                value={area.id.toString()}
                              >
                                {area.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                )}
            </div>

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Weight (grams)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="h-8 text-xs"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}

        {/* PAYMENT */}

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <RadioGroup
                className="flex gap-4"
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <RadioGroupItem value="cod" /> COD
                <RadioGroupItem value="online_payment" /> Online
              </RadioGroup>
            </FormItem>
          )}
        />

        {/* ADVANCE */}

        <FormField
          control={form.control}
          name="advanceAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Advance Payment Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* DISCOUNT TYPE */}

        <FormField
          control={form.control}
          name="discountType"
          render={({ field }) => (
            <FormItem>
              <RadioGroup
                className="flex gap-4"
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <RadioGroupItem value="flat" /> Flat
                <RadioGroupItem value="percent" /> Percentage
              </RadioGroup>
            </FormItem>
          )}
        />

        {/* DISCOUNT VALUE */}

        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* NOTES */}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <Textarea {...field} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="internalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Internal Notes</FormLabel>
              <Textarea {...field} />
            </FormItem>
          )}
        />

        {/* DELIVERY FEE */}

        <FormField
          control={form.control}
          name="deliveryFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Fee</FormLabel>
              <FormControl>
                <Input
                  disabled={isFreeDelivery}
                  type="number"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* FREE DELIVERY */}

        <FormField
          control={form.control}
          name="isFreeDelivery"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <Checkbox
                checked={field.value}
                onCheckedChange={(val) => {
                  field.onChange(val);
                  if (val) form.setValue("deliveryFee", 0);
                }}
              />
              <FormLabel>Free Delivery</FormLabel>
            </FormItem>
          )}
        />

        {/* FOOTER BUTTONS */}
        <div className="border-t pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{cartSubtotal?.toFixed(2) ?? 0}</span>
          </div>

          <div className="flex justify-between text-red-500">
            <span>Discount:</span>
            <span>- {discountAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Delivery Fee:</span>
            <span>{deliveryFee.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-green-600">
            <span>Advance Payment:</span>
            <span>- {advance.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-semibold text-base border-t pt-2">
            <span>Total:</span>
            <span>{Math.max(total, 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCheckoutStep("cart")}
          >
            Back
          </Button>

          <Button
            type="submit"
            // onClick={handleCheckoutSubmit}
          >
            Proceed To Checkout
          </Button>
        </div>
      </form>
    </Form>
  );
}
