"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
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
import {
  CalendarDays,
  Eye,
  Info,
  Pen,
  Phone,
  Settings2Icon,
  User,
  X,
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import useSWR, { KeyedMutator } from "swr";
import { ICustomer } from "@/types/order.type";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PencilIcon, TrashIcon } from "lucide-react";
import EditCustomerDialog from "../shared/editCustomerDialog";
import { fetcher } from "@/lib/fetcher";
import { Order } from "../order/data";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface Props {
  customer: ICustomer;
  selectedCustomers: string[];
  setSelectedCustomers: Dispatch<SetStateAction<string[]>>;
  mutateCustomersData: KeyedMutator<{ data: ICustomer[] }>;
}
const slugyfy = (str: string) => {
  return str.toLowerCase().replace(/\s+/g, "-");
};

export default function CustomerTableRow({
  customer,
  selectedCustomers,
  setSelectedCustomers,
  mutateCustomersData,
}: Props) {
  const router = useRouter();
  const isSelected = selectedCustomers.includes(customer._id);
  const [nextCall, setNextCall] = useState(
    customer?.nextCall
      ? new Date(customer.nextCall).toISOString().split("T")[0]
      : "",
  );
  const [newNote, setNewNote] = useState<string>("");
  const [author, setAuthor] = useState<string>("");

  const handleSelect = (checked: boolean) => {
    setSelectedCustomers((prev) =>
      checked
        ? [...prev, customer._id]
        : prev.filter((id) => id !== customer._id),
    );
  };

  const handleBlockToggle = useCallback(async () => {
    try {
      const endpoint = customer.isBlocked
        ? `/customers/${customer._id}/unblock`
        : `/customers/${customer._id}/block`;

      const res = await api.post(endpoint, {
        reason: "Violation of terms",
      });

      if (res.status === 200) {
        toast.success(
          customer.isBlocked ? "Customer unblocked" : "Customer blocked",
        );
        await mutateCustomersData();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update customer status");
    }
  }, [customer._id, customer.isBlocked, mutateCustomersData]);

  const handleDelete = useCallback(async () => {
    try {
      const res = await api.delete(`/customers/${customer._id}`);
      if (res.status === 200) {
        toast.success("Customer deleted");
        await mutateCustomersData();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete customer");
    }
  }, [customer._id, mutateCustomersData]);

  const handleUpdate = useCallback(async () => {
    try {
      const res = await api.put(`/customers/${customer._id}`, {
        newNote: newNote
          ? { content: newNote, author: author || "Admin" }
          : null,
        nextCall: nextCall ? new Date(nextCall) : null,
      });
      if (res.status === 200) {
        toast.success("Customer updated");
        setNewNote(""); // Clear input
        setAuthor("");
        await mutateCustomersData();
      }
    } catch {
      toast.error("Update failed");
    }
  }, [customer._id, newNote, nextCall, author, mutateCustomersData]);

  const { data } = useSWR(`/customers/${customer._id}`, fetcher);
  //console.log(data.data)
  const customerData = useMemo(() => data?.data, [data]);
  const orders = customerData?.orders || [];
  const pendingOrders =
    orders.filter(
      (order: Order) => order?.status?.toLowerCase() === "pending",
    ) || [];
  const deliveredOrders =
    orders.filter(
      (order: Order) => order?.status?.toLowerCase() === "delivered",
    ) || [];
  const approvedOrders =
    orders.filter(
      (order: Order) => order?.status?.toLowerCase() === "approved",
    ) || [];
  const processingOrders =
    orders.filter(
      (order: Order) => order?.status?.toLowerCase() === "processing",
    ) || [];
  const onHoldOrders =
    orders.filter(
      (order: Order) => order?.status?.toLowerCase() === "on hold",
    ) || [];
  const readyToShipOrders =
    orders.filter(
      (order: Order) => order?.status?.toLowerCase() === "ready to ship",
    ) || [];
  const inTransitOrders =
    orders.filter(
      (order: Order) => order?.status?.toLowerCase() === "in-transit",
    ) || [];
  const cancelledOrders =
    orders.filter(
      (order: Order) => order?.status?.toLowerCase() === "cancelled",
    ) || [];
  const flaggedOrders =
    orders.filter(
      (order: Order) => order?.status?.toLowerCase() === "flagged",
    ) || [];

  return (
    <TableRow>
      <TableCell>
        <Checkbox checked={isSelected} onCheckedChange={handleSelect} />
      </TableCell>

      <TableCell>{customer.full_name}</TableCell>
      <TableCell>{customer.address}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Phone
            className="w-4 h-4"
            onClick={() => {
              window.location.href = `tel:${customer.phone}`;
            }}
          />
          <span
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(customer.phone);
              toast.success("Phone number copied");
            }}
          >
            {customer.phone}
          </span>
        </div>
      </TableCell>
      <TableCell className="line-clamp-1 max-w-40 text-ellipsis">
        {customer?.note || "—"}
      </TableCell>
      <TableCell>{nextCall || "—"}</TableCell>

      <TableCell className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Settings2Icon />{" "}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                {/* customer profile start*/}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div className="w-full flex items-center gap-2">
                      <Eye />
                      View Profile
                    </div>
                  </AlertDialogTrigger>

                  <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Customer Profile </AlertDialogTitle>
                      <div className="grid grid-cols-2 gap-4 py-4 text-sm border-b">
                        <div>
                          <span className="text-muted-foreground block">
                            Name
                          </span>
                          <p className="font-medium">{customer.full_name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">
                            Phone
                          </span>
                          <p className="font-medium">{customer.phone}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">
                            Address
                          </span>
                          <p className="font-medium">{customer.address}</p>
                        </div>
                      </div>
                    </AlertDialogHeader>

                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2 mt-2">
                        <CalendarDays className="w-4 h-4" /> Note History
                      </h4>
                      <div className="border rounded-md">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead className="w-1/4">Author</TableHead>
                              <TableHead>Note</TableHead>
                              <TableHead className="text-right">Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {customer.noteHistory?.length ? (
                              [...customer.noteHistory]
                                .reverse()
                                .map((n, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell className="font-medium flex items-center gap-1 text-xs">
                                      <User className="w-3 h-3" /> {n.author}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      {n.content}
                                    </TableCell>
                                    <TableCell className="text-right text-[10px] text-muted-foreground">
                                      {new Date(n.createdAt).toLocaleString()}
                                    </TableCell>
                                  </TableRow>
                                ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={3}
                                  className="text-center text-muted-foreground"
                                >
                                  No notes yet
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    {/* order history */}

                    <p>Total orders : {data?.data?.orders?.length || 0}</p>
                    <hr />
                    <div className="grid grid-cols-3 text-xs gap-1">
                      <p>Pending : {pendingOrders?.length || 0}</p>
                      <p>Delivered : {deliveredOrders?.length || 0}</p>
                      <p>Approved : {approvedOrders?.length || 0}</p>
                      <p>Processing : {processingOrders?.length || 0}</p>
                      <p>On Hold : {onHoldOrders?.length || 0}</p>
                      <p>Ready to Ship : {readyToShipOrders?.length || 0}</p>
                      <p>In Transit : {inTransitOrders?.length || 0}</p>
                      <p>Cancelled : {cancelledOrders?.length || 0}</p>
                      <p>Flagged : {flaggedOrders?.length || 0}</p>
                    </div>
                    <hr />
                    {/* status wise seperate order display */}
                    {/* pending orders */}
                    {pendingOrders && pendingOrders.length > 0 && (
                      <div className="mt-3 rounded-md border-none p-3 bg-[#fefcf8] dark:bg-amber-950/10">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-semibold text-gray-800 dark:text-gray-200 text-[11px]">
                            Pending Orders
                          </span>
                          <Badge className="bg-[#f2b962] hover:bg-[#f2b962] text-black dark:bg-amber-600 dark:hover:bg-amber-600 dark:text-white rounded-sm px-2 text-[10px] font-bold">
                            1
                          </Badge>
                          {/* Small Bar Animation */}
                          <div className="flex items-end gap-[2px] h-3.5 ml-1 overflow-hidden">
                            <style>{`
                      @keyframes eq-play {
                        0%, 100% { transform: scaleY(0.3); }
                        50% { transform: scaleY(1); }
                      }
                    `}</style>
                            <div
                              className="w-[2px] h-3.5 bg-gray-600 dark:bg-gray-400 origin-bottom"
                              style={{
                                animation: "eq-play 1s infinite ease-in-out",
                              }}
                            />
                            <div
                              className="w-[2px] h-3.5 bg-gray-600 dark:bg-gray-400 origin-bottom"
                              style={{
                                animation:
                                  "eq-play 0.8s infinite ease-in-out 0.2s",
                              }}
                            />
                            <div
                              className="w-[2px] h-3.5 bg-gray-600 dark:bg-gray-400 origin-bottom"
                              style={{
                                animation:
                                  "eq-play 1.2s infinite ease-in-out 0.4s",
                              }}
                            />
                            <div
                              className="w-[2px] h-3.5 bg-gray-600 dark:bg-gray-400 origin-bottom"
                              style={{
                                animation:
                                  "eq-play 0.9s infinite ease-in-out 0.1s",
                              }}
                            />
                          </div>
                        </div>

                        {pendingOrders.map((order: Order) => (
                          <div className="space-y-2 my-2" key={order._id}>
                            <div className="bg-white dark:bg-popover p-2.5 rounded   flex justify-between items-start text-[11px]">
                              <div>
                                <div className="flex items-center gap-1.5 font-medium mb-1.5">
                                  <Button
                                    variant={"link"}
                                    className="text-[#3a8b9e] px-0! dark:text-cyan-400"
                                    onClick={() =>
                                      router.push(
                                        `/dashboard/order/view/${order?._id}`,
                                      )
                                    }
                                  >
                                    {order?.order_number}
                                  </Button>
                                  <div className="bg-[#3f6371] dark:bg-slate-700 text-white rounded-full p-[2px]">
                                    <Info className="h-2.5 w-2.5" />
                                  </div>
                                </div>
                                <div className="space-y-2 pb-2 ">
                                  {order.items?.map((order) => (
                                    <p
                                      key={order._id}
                                      onClick={() =>
                                        router.push(
                                          `/dashboard/products/view/${slugyfy(order?.name || "")}`,
                                        )
                                      }
                                      className="text-xs text-muted-foreground hover:underline cursor-pointer"
                                    >
                                      {order?.name} x {order?.quantity} x BDT{" "}
                                      {order?.price}
                                    </p>
                                  ))}
                                </div>
                                <p className="font-bold text-gray-800 dark:text-gray-200">
                                  Total: BDT{" "}
                                  {Number(order?.subtotal || 0).toFixed(2)}
                                </p>
                              </div>

                              <div className="text-right">
                                <Badge
                                  variant="secondary"
                                  className="bg-[#fef4e8] hover:bg-[#fef4e8] text-[#f2a550] dark:bg-orange-950/40 dark:hover:bg-orange-950/40 dark:text-orange-400 rounded px-2 mb-1.5 border-none font-medium capitalize"
                                >
                                  {order.status}
                                </Badge>
                                <p className="text-muted-foreground flex items-center justify-end gap-1">
                                  {new Date(
                                    order?.created_at ?? "",
                                  ).toLocaleString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  <Info className="h-3 w-3" />
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Approved orders */}
                    {approvedOrders && approvedOrders.length > 0 && (
                      <div className="mt-3 rounded-md border-none p-3 bg-[#fefcf8] dark:bg-blue-950/10">
                        {/* Header */}
                        <div className="flex items-start gap-2 mb-3">
                          <span className="font-semibold text-gray-800 dark:text-gray-200 text-[11px]">
                            Approved Orders
                          </span>
                          <Badge className="bg-blue-400 hover:bg-blue-500 text-black  dark:text-white rounded-sm px-2 text-[10px] font-bold">
                            1
                          </Badge>
                          {/* Small Bar Animation */}
                          <div className="flex items-end gap-[2px] h-3.5 ml-1 overflow-hidden">
                            <style>{`
                      @keyframes eq-play {
                        0%, 100% { transform: scaleY(0.3); }
                        50% { transform: scaleY(1); }
                      }
                    `}</style>
                            <div
                              className="w-[2px] h-3.5 bg-gray-600 dark:bg-gray-400 origin-bottom"
                              style={{
                                animation: "eq-play 1s infinite ease-in-out",
                              }}
                            />
                            <div
                              className="w-[2px] h-3.5 bg-gray-600 dark:bg-gray-400 origin-bottom"
                              style={{
                                animation:
                                  "eq-play 0.8s infinite ease-in-out 0.2s",
                              }}
                            />
                            <div
                              className="w-[2px] h-3.5 bg-gray-600 dark:bg-gray-400 origin-bottom"
                              style={{
                                animation:
                                  "eq-play 1.2s infinite ease-in-out 0.4s",
                              }}
                            />
                            <div
                              className="w-[2px] h-3.5 bg-gray-600 dark:bg-gray-400 origin-bottom"
                              style={{
                                animation:
                                  "eq-play 0.9s infinite ease-in-out 0.1s",
                              }}
                            />
                          </div>
                        </div>

                        {approvedOrders.map((order: Order) => (
                          <div className="space-y-2 my-2" key={order._id}>
                            <div className="bg-white dark:bg-popover p-2.5 rounded   flex justify-between items-center text-[11px]">
                              <div>
                                <div className="flex items-center gap-1.5 font-medium mb-1.5">
                                  <Button
                                    variant={"link"}
                                    className="text-[#3a8b9e] px-0! dark:text-cyan-400"
                                    onClick={() =>
                                      router.push(
                                        `/dashboard/order/view/${order?._id}`,
                                      )
                                    }
                                  >
                                    {order?.order_number}
                                  </Button>
                                  <div className="bg-[#3f6371] dark:bg-slate-700 text-white rounded-full p-[2px]">
                                    <Info className="h-2.5 w-2.5" />
                                  </div>
                                </div>
                                <div className="space-y-2 pb-2 ">
                                  {order.items?.map((order) => (
                                    <p
                                      key={order._id}
                                      onClick={() =>
                                        router.push(
                                          `/dashboard/products/view/${slugyfy(order?.name || "")}`,
                                        )
                                      }
                                      className="text-xs text-muted-foreground hover:underline cursor-pointer"
                                    >
                                      {order?.name} x {order?.quantity} x BDT{" "}
                                      {order?.price}
                                    </p>
                                  ))}
                                </div>
                                <p className="font-bold text-gray-800 dark:text-gray-200">
                                   Total: BDT {Number(order?.subtotal || 0).toFixed(2)}
                                </p>
                              </div>

                              <div className="text-right">
                                <Badge
                                  variant="secondary"
                                  className="bg-blue-300 text-blue-900 rounded px-2 mb-1.5 border-none font-medium capitalize"
                                >
                                  {order.status}
                                </Badge>
                                <p className="text-muted-foreground flex items-center justify-end gap-1">
                                  {new Date(
                                    order?.created_at ?? "",
                                  ).toLocaleString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  <Info className="h-3 w-3" />
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {RenderOrderSection(
                      "Processing Orders",
                      processingOrders,
                      "bg-purple-400",
                      "text-white",
                    )}

                    {RenderOrderSection(
                      "On Hold Orders",
                      onHoldOrders,
                      "bg-yellow-400",
                      "text-black",
                    )}

                    {RenderOrderSection(
                      "Ready To Ship Orders",
                      readyToShipOrders,
                      "bg-indigo-400",
                      "text-white",
                    )}

                    {RenderOrderSection(
                      "In Transit Orders",
                      inTransitOrders,
                      "bg-cyan-400",
                      "text-black",
                    )}

                    {RenderOrderSection(
                      "Delivered Orders",
                      deliveredOrders,
                      "bg-green-500",
                      "text-white",
                    )}

                    {RenderOrderSection(
                      "Cancelled Orders",
                      cancelledOrders,
                      "bg-red-400",
                      "text-white",
                    )}

                    {RenderOrderSection(
                      "Flagged Orders",
                      flaggedOrders,
                      "bg-gray-500",
                      "text-white",
                    )}

                    {/* order history end */}
                    <AlertDialogFooter>
                      <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                {/* customer profile end */}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div className="w-full flex items-center gap-2">
                      <PencilIcon />
                      Edit
                    </div>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Update Customer</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label htmlFor="author">Author Name</Label>
                        <Input
                          id="author"
                          placeholder="Who is writing this note?"
                          value={author || "Admin"}
                          onChange={(e) => setAuthor(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Add New Note</Label>

                        <Textarea
                          placeholder="Type follow-up details here..."
                          value={newNote === "" ? customer.note : newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === " ") {
                              e.stopPropagation();
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Schedule Next Call</Label>
                        <Input
                          type="date"
                          value={nextCall}
                          onChange={(e) => setNextCall(e.target.value)}
                        />
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setNewNote("")}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-primary"
                        onClick={handleUpdate}
                      >
                        Save Changes
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <EditCustomerDialog
                  id={customer._id}
                  mutateCustomersData={mutateCustomersData}
                  trigger={
                    <Button variant="ghost" className="px-0! mx-0!">
                      <Pen />
                      Update
                    </Button>
                  }
                />
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div
                  onClick={handleBlockToggle}
                  className="flex gap-2 items-center"
                >
                  <X />
                  {customer.isBlocked ? "Unblock" : "Block"}
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                variant="destructive"
              >
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div className="w-full flex items-center gap-2">
                      <TrashIcon className="text-red-400" />
                      Delete
                    </div>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete customer?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 text-white"
                        onClick={handleDelete}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

const RenderOrderSection = (
  title: string,
  orders: Order[],
  badgeColor: string,
  badgeTextColor: string,
) => {
  const router = useRouter();
  if (!orders || orders.length === 0) return null;

  return (
    <div className="mt-3 rounded-md border-none p-3 bg-[#fefcf8] dark:bg-slate-900/20">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-semibold text-gray-800 dark:text-gray-200 text-[11px]">
          {title}
        </span>

        <Badge
          className={`${badgeColor} ${badgeTextColor} rounded-sm px-2 text-[10px] font-bold`}
        >
          {orders.length}
        </Badge>
      </div>

      {orders.map((order: Order) => (
        <div className="space-y-2 my-2" key={order._id}>
          <div className="bg-white dark:bg-popover p-2.5 rounded flex justify-between items-start text-[11px]">
            <div>
              <div className="flex items-center gap-1.5 font-medium mb-1.5">
                <Button
                  variant="link"
                  className="text-[#3a8b9e] px-0! dark:text-cyan-400"
                  onClick={() =>
                    router.push(`/dashboard/order/view/${order?._id}`)
                  }
                >
                  {order?.order_number}
                </Button>

                <div className="bg-[#3f6371] dark:bg-slate-700 text-white rounded-full p-[2px]">
                  <Info className="h-2.5 w-2.5" />
                </div>
              </div>
              <div className="space-y-2 pb-2 ">
                {order.items?.map((order) => (
                  <p
                    key={order._id}
                    onClick={() =>
                      router.push(
                        `/dashboard/products/view/${slugyfy(order?.name || "")}`,
                      )
                    }
                    className="text-xs text-muted-foreground hover:underline cursor-pointer"
                  >
                    {order?.name} x {order?.quantity} x BDT {order?.price}
                  </p>
                ))}
              </div>

              <p className="font-bold text-gray-800 dark:text-gray-200">
                Total: BDT {Number(order?.subtotal || 0).toFixed(2)}
              </p>
            </div>

            <div className="text-right">
              <Badge className="rounded px-2 mb-1.5 border-none font-medium capitalize">
                {order.status}
              </Badge>

              <p className="text-muted-foreground flex items-center justify-end gap-1">
                {new Date(order?.created_at ?? "").toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                <Info className="h-3 w-3" />
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
