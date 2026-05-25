"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Eye,
  Truck,
  Package,
  CheckCircle,
  Clock,
  Printer,
  ChevronDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IOrder {
  id: string;
  customer: string;
  phone: string;
  email: string;
  address: string;
  amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  paymentMethod: string;
  notes?: string;
  deliveredAt?: string; // <-- ✅ make it optional
}

const demoOrders: IOrder[] = [
  {
    id: "12204",
    customer: "Smart Growth",
    phone: "+1 (555) 123-4567",
    email: "smart.growth@email.com",
    address: "123 Main St, Apt 4B, New York, NY 10001",
    amount: 189.09,
    status: "pending",
    date: "2025-08-30T12:28:00Z",
    items: [
      {
        name: "Wireless Bluetooth Headphones",
        quantity: 1,
        price: 189.09,
        image: "/wireless-bluetooth-headphones.png",
      },
    ],
    paymentMethod: "Cash",
    notes: "Please call before delivery",
  },
  {
    id: "12176",
    customer: "Alamgir Hossain",
    phone: "+1 (555) 234-5678",
    email: "alamgir.hossain@email.com",
    address: "456 Oak Ave, Suite 12, Los Angeles, CA 90210",
    amount: 121.56,
    status: "delivered",
    date: "2025-08-30T08:58:00Z",
    items: [
      {
        name: "Smart Home Speaker",
        quantity: 1,
        price: 121.56,
        image: "/smart-home-speaker.png",
      },
    ],
    paymentMethod: "Cash",
    deliveredAt: "2025-08-30T14:30:00Z",
  },
  {
    id: "12190",
    customer: "Ill I",
    phone: "+1 (555) 345-6789",
    email: "ill.i@email.com",
    address: "789 Pine Rd, Unit 5, Chicago, IL 60601",
    amount: 2720.0,
    status: "cancelled",
    date: "2025-08-29T23:51:00Z",
    items: [
      {
        name: "Premium Electronics Bundle",
        quantity: 1,
        price: 2720.0,
        image: "/electronics-bundle.png",
      },
    ],
    paymentMethod: "Cash",
  },
  {
    id: "12203",
    customer: "John Doe",
    phone: "+1 (555) 456-7890",
    email: "john.doe@email.com",
    address: "321 Elm St, Floor 3, Miami, FL 33101",
    amount: 68.12,
    status: "processing",
    date: "2025-08-29T17:38:00Z",
    items: [
      {
        name: "Cotton T-Shirt",
        quantity: 2,
        price: 34.06,
        image: "/cotton-t-shirt.png",
      },
    ],
    paymentMethod: "Cash",
  },
  {
    id: "12175",
    customer: "Alamgir Hossain",
    phone: "+1 (555) 234-5678",
    email: "alamgir.hossain@email.com",
    address: "456 Oak Ave, Suite 12, Los Angeles, CA 90210",
    amount: 121.56,
    status: "delivered",
    date: "2025-08-28T16:12:00Z",
    items: [
      {
        name: "Smart Fitness Watch",
        quantity: 1,
        price: 121.56,
        image: "/smart-fitness-watch.png",
      },
    ],
    paymentMethod: "Cash",
    deliveredAt: "2025-08-29T10:15:00Z",
  },
  {
    id: "12193",
    customer: "Sierra Brooks",
    phone: "+1 (555) 567-8901",
    email: "sierra.brooks@email.com",
    address: "654 Maple Dr, Austin, TX 78701",
    amount: 432.0,
    status: "delivered",
    date: "2025-08-28T16:12:00Z",
    items: [
      {
        name: "Home Office Setup",
        quantity: 1,
        price: 432.0,
        image: "/office-setup.png",
      },
    ],
    paymentMethod: "Cash",
    deliveredAt: "2025-08-29T09:30:00Z",
  },
  {
    id: "12169",
    customer: "John Doe",
    phone: "+1 (555) 456-7890",
    email: "john.doe@email.com",
    address: "321 Elm St, Floor 3, Miami, FL 33101",
    amount: 613.99,
    status: "delivered",
    date: "2025-08-28T16:12:00Z",
    items: [
      {
        name: "Premium Headphone Set",
        quantity: 1,
        price: 613.99,
        image: "/premium-headphones.png",
      },
    ],
    paymentMethod: "Cash",
    deliveredAt: "2025-08-29T11:45:00Z",
  },
  {
    id: "12192",
    customer: "Sierra Brooks",
    phone: "+1 (555) 567-8901",
    email: "sierra.brooks@email.com",
    address: "654 Maple Dr, Austin, TX 78701",
    amount: 108.12,
    status: "delivered",
    date: "2025-08-28T16:11:00Z",
    items: [
      {
        name: "Yoga Mat Premium",
        quantity: 1,
        price: 108.12,
        image: "/yoga-mat-premium.png",
      },
    ],
    paymentMethod: "Cash",
    deliveredAt: "2025-08-29T08:20:00Z",
  },
  {
    id: "12192",
    customer: "Sierra Brooks",
    phone: "+1 (555) 567-8901",
    email: "sierra.brooks@email.com",
    address: "654 Maple Dr, Austin, TX 78701",
    amount: 108.12,
    status: "delivered",
    date: "2025-08-28T16:11:00Z",
    items: [
      {
        name: "Yoga Mat Premium",
        quantity: 1,
        price: 108.12,
        image: "/yoga-mat-premium.png",
      },
    ],
    paymentMethod: "Cash",
    deliveredAt: "2025-08-29T08:20:00Z",
  },
];

const statusOptions = [
  { value: "pending", label: "Pending", icon: Clock },
  { value: "processing", label: "Processing", icon: Package },
  { value: "shipped", label: "Shipped", icon: Truck },
  { value: "delivered", label: "Delivered", icon: CheckCircle },
  { value: "cancelled", label: "Cancel", icon: Clock },
];

export default function RecentOrdersTable() {
  const [orders, setOrders] = useState(demoOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<
    (typeof demoOrders)[0] | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm);
    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? ({
              ...order,
              status: newStatus,
              ...(newStatus === "delivered" && {
                deliveredAt: new Date().toISOString(),
              }),
            } as IOrder)
          : order
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "processing":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Recent Order Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl font-semibold">
              Recent Order
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-45">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">All</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-foreground">
                    INVOICE NO
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    ORDER TIME
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    CUSTOMER NAME
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    METHOD
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    AMOUNT
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    STATUS
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    ACTION
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    INVOICE
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{formatDate(order.date)}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {order.paymentMethod}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${order.amount}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(order.status)}
                        variant="outline"
                      >
                        {order.status === "cancelled" ? "Cancel" : order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8">
                            {order.status === "cancelled"
                              ? "Cancel"
                              : order.status}
                            <ChevronDown className="h-4 w-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {statusOptions.map((status) => (
                            <DropdownMenuItem
                              key={status.value}
                              onClick={() =>
                                handleStatusUpdate(order.id, status.value)
                              }
                              disabled={order.status === status.value}
                            >
                              <status.icon className="h-4 w-4 mr-2" />
                              Mark as {status.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(totalPages)}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Orders will appear here when customers place them"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      ></Dialog>
    </div>
  );
}
