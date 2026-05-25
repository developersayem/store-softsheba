"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  CircleSlash2,
  Download,
  Funnel,
  MoreVertical,
  Plus,
  PlusCircle,
  Search,
} from "lucide-react";

import { ICustomer } from "@/types/order.type";

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
import { Checkbox } from "@/components/ui/checkbox";
import useSWR, { KeyedMutator } from "swr";
import { toast } from "sonner";
import api from "@/lib/axios";
import CustomerTableRow from "./CustomerTableRow";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetcher } from "@/lib/fetcher";
import { Calendar } from "@/components/ui/calendar";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import AddCustomerDialog from "../shared/addCustomerDialog";

interface OrdersTableProps {
  customersData?: ICustomer[];
  mutateCustomersData: KeyedMutator<{ data: ICustomer[] }>;
}

export function CustomersTable({
  customersData = [],
  mutateCustomersData,
}: OrdersTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const [selectedCustomer, setSelectedCustomer] = useState<string[]>([]);
  //console.log(selectedCustomer);
  const [groupName, setGroupName] = useState<string>("");
  const [createGroupSearch, setCreateGroupSearch] = useState("");
  const [createGroupSelectedCustomers, setCreateGroupSelectedCustomers] =
    useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<
    { productId: string; categoryId: string; name: string }[]
  >([]);

  const { data: groupsData, mutate } = useSWR(
    "/customers/groups/list",
    fetcher,
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const groups: { groupName: string; count: number }[] = groupsData?.data || [];

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const isTodayFromURL = searchParams.get("today") === "true";

  const [nextCallDate, setNextCallDate] = useState<Date | null>(
    isTodayFromURL ? new Date() : null,
  );

  const [customSearchType, setCustomSearchType] = useState<
    "product" | "category" | "nextCall" | null
  >(null);

  const [customSearchValue, setCustomSearchValue] = useState("");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextCallDate) {
      const today = new Date().toDateString();

      if (nextCallDate.toDateString() === today) {
        params.set("today", "true");
      }
    } else {
      params.delete("today");
    }

    router.replace(`?${params.toString()}`);
  }, [nextCallDate, router, searchParams]);

  // -------------------- Filtering --------------------
  const filteredCustomers = useMemo(() => {
    let result = [...customersData];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o?.address?.toLowerCase().includes(q) ||
          o.full_name.toLowerCase().includes(q) ||
          o.city?.toLowerCase().includes(q) ||
          o.phone?.toLowerCase().includes(q) ||
          o.email?.toLowerCase().includes(q),
      );
    }
    // Group Filter
    if (selectedGroup) {
      result = result.filter((c) => c.groupNames?.includes(selectedGroup));
    }
    // Next Call Date Filter
    if (nextCallDate) {
      const selected = nextCallDate.toDateString();
      result = result.filter(
        (c) => c.nextCall && new Date(c.nextCall).toDateString() === selected,
      );
    }
    return result;
  }, [customersData, search, selectedGroup, nextCallDate]);

  const createGroupFilteredCustomers = useMemo(() => {
    if (!createGroupSearch) return customersData;

    const q = createGroupSearch.toLowerCase();

    return customersData.filter(
      (c) =>
        c.full_name?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q),
    );
  }, [customersData, createGroupSearch]);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (search) count++;
    if (selectedGroup) count++;
    if (nextCallDate) count++;
    if (customSearchType && customSearchValue) count++;

    return count;
  }, [
    search,
    selectedGroup,
    nextCallDate,
    customSearchType,
    customSearchValue,
  ]);

  const clearAllFilters = useCallback(async () => {
    setSearch("");
    setSelectedGroup(null);
    setNextCallDate(null);
    setCustomSearchType(null);
    setCustomSearchValue("");
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("today");
    router.replace(`?${params.toString()}`);
    await mutateCustomersData();
  }, [mutateCustomersData, router, searchParams]);

  //handle select all
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked)
        setSelectedCustomer(filteredCustomers.map((p) => p._id as string));
      else setSelectedCustomer([]);
    },
    [filteredCustomers],
  );

  const handleBlockMany = useCallback(async () => {
    if (selectedCustomer.length === 0) {
      toast.error("Please select at least one customer to Block.");
      return;
    }
    try {
      const res = await api.post(`/customers/Block-many`, {
        ids: selectedCustomer,
      });
      if (res.status === 200) {
        toast.success(res.data.message || "Customers Blocked successfully");
        setSelectedCustomer([]);
        await mutateCustomersData?.();
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting customers");
    }
  }, [selectedCustomer, mutateCustomersData]);


  const handleCreateGroup = useCallback(async () => {
    //console.log(createGroupSelectedCustomers)
    if (createGroupSelectedCustomers.length === 0) {
      toast.error("Please select at least one customer to create a group.");
      return;
    }
    try {
      const res = await api.patch(`/customers/create-group`, {
        groupName: groupName,
        customerIds: createGroupSelectedCustomers,
      });

      if (res.status === 200) {
        toast.success("Group created and customers assigned successfully");
        setCreateGroupSelectedCustomers([]);
        setGroupName("");
        setCreateGroupSearch("");
      }
      await mutateCustomersData();
      await mutate();
    } catch {
      toast.error("Failed to create group");
    }
  }, [createGroupSelectedCustomers, groupName, mutateCustomersData, mutate]);

  const handleAssignGroup = useCallback(async () => {
    if (selectedCustomer.length === 0) {
      toast.error("Please select at least one customer.");
      return;
    }
    if (!groupName) {
      toast.error("Please select or enter a group name.");
      return;
    }
    try {
      const res = await api.patch(`/customers/create-group`, {
        groupName: groupName,
        customerIds: selectedCustomer,
      });

      if (res.status === 200) {
        toast.success("Customers assigned to group successfully");
        setSelectedCustomer([]);
        setGroupName("");
      }
      await mutateCustomersData();
      await mutate();
    } catch {
      toast.error("Failed to assign group");
    }
  }, [selectedCustomer, groupName, mutateCustomersData, mutate]);

  const handleEditGroup = async (oldGroupName: string) => {
    try {
      const res = await api.patch(`/customers/update-group`, {
        oldGroupName: oldGroupName,
        newGroupName: groupName,
        customerIds: createGroupSelectedCustomers,
      });
      if (res.status === 200) {
        toast.success("Group edited and customers updated successfully");
        mutate();
        mutateCustomersData();
        setCreateGroupSelectedCustomers([]);
        setGroupName("");
        setCreateGroupSearch("");
      }
    } catch {
      toast.error("Failed to edit group");
    }
  };

  const fetchSuggestions = useCallback(
    async (value: string) => {
      if (!value || !customSearchType) return;
      try {
        const res = await api.get("/customers/suggestions/search", {
          params: {
            q: value,
            type: customSearchType,
          },
        });
        //console.log(res);

        setSuggestions(
          res.data.data.map(
            (s: { productId?: string; categoryId?: string; name: string }) => s,
          ),
        );
      } catch {
        toast("Failed!");
      }
    },
    [customSearchType],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchSuggestions(customSearchValue);
    }, 400);
    if (customSearchValue.length == 0) {
      setSuggestions([]);
      return;
    }

    return () => clearTimeout(timeout);
  }, [customSearchValue, fetchSuggestions]);

  const handleSuggestionSelect = async (id: string, name: string) => {
    try {
      const res = await api.get("/customers/filter-by-purchase/filter", {
        params: {
          type: customSearchType,
          value: id,
        },
      });

      await mutateCustomersData({ data: res.data.data }, false);
      setSuggestions([]);
      setCustomSearchValue(name);
      setIsDropdownOpen(false);
    } catch {
      toast.error("Failed to filter customers");
    }
  };

  // delete group
  const handleDeleteGroup = useCallback(async (groupName: string) => {
    try {
      const res = await api.post("/customers/delete-group", {
        groupName,
      });
      if (res.status === 200) {
        toast.success("Group deleted and customers unassigned successfully");
      }
    } catch {
      toast.error("Failed to delete group");
    } finally {
      mutate();
      mutateCustomersData();
    }
  }, [mutate, mutateCustomersData]);

  // -------------------- Pagination --------------------
  const totalPages = Math.ceil(filteredCustomers.length / limit);
  const paginated = filteredCustomers.slice((page - 1) * limit, page * limit);

  const exportToCSV = useCallback(() => {
    if (filteredCustomers.length === 0) {
      toast.error("No data available to export");
      return;
    }

    // Define Headers
    const headers = [
      "Full Name",
      "Phone",
      "Email",
      "City",
      "Address",
      "Next Call",
      "Note",
    ];

    // Map data to rows
    const rows = filteredCustomers.map((c) => [
      `"${c.full_name || ""}"`,
      `"${c.phone || ""}"`,
      `"${c.email || ""}"`,
      `"${c.city || ""}"`,
      `"${c.address?.replace(/"/g, '""') || ""}"`, // Escape quotes in address
      `"${c.nextCall ? new Date(c.nextCall).toLocaleDateString() : ""}"`,
      `"${c.note || ""}"`,
    ]);

    // Combine into CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create Download Link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `customers_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV Downloaded successfully");
  }, [filteredCustomers]);

  return (
    <div className="space-y-4">
      {/* groups card */}
      <div>
        {/* Groups Card Section */}
        {groups.length > 0 && (
          <div className="w-full  pb-2">
            <Carousel
              opts={{
                align: "start",
                dragFree: true,
              }}
              className="w-full px-5"
            >
              <CarouselContent className="-ml-2 flex items-center">
                {groups.map((group, index) => (
                  <CarouselItem key={index} className="pl-2 basis-auto">
                    <Card
                      onClick={() => {
                        setSelectedGroup(
                          selectedGroup === group.groupName
                            ? null
                            : group.groupName,
                        );
                        setNextCallDate(null);
                        setPage(1);
                      }}
                      className={`relative group cursor-pointer transition-all duration-200 border whitespace-nowrap ${
                        selectedGroup === group.groupName
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      {/* 3 Dot Menu */}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded hover:bg-muted"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                setGroupName(group.groupName);
                                e.stopPropagation();
                              }}
                            >
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <div className="flex items-start gap-1 w-full">
                                    Edit
                                  </div>
                                </AlertDialogTrigger>

                                <AlertDialogContent className="bg-accent">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Edit Group
                                    </AlertDialogTitle>

                                    <AlertDialogDescription className="space-y-4">
                                      {/* Group Name */}
                                      <div className="space-y-2">
                                        <Label>Group Name</Label>
                                        <Input
                                          placeholder="Enter Group Name"
                                          value={groupName}
                                          onChange={(e) =>
                                            setGroupName(e.target.value)
                                          }
                                        />
                                      </div>

                                      {/* Search Customer */}
                                      <div className="space-y-2">
                                        <Label>Select Customers</Label>

                                        <Input
                                          placeholder="Search customer..."
                                          value={createGroupSearch}
                                          onChange={(e) =>
                                            setCreateGroupSearch(e.target.value)
                                          }
                                        />

                                        <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-2">
                                          {createGroupFilteredCustomers.map(
                                            (customer) => (
                                              <div
                                                key={customer._id}
                                                className="flex items-center gap-2"
                                              >
                                                <Checkbox
                                                  checked={
                                                    createGroupSelectedCustomers.includes(
                                                      customer._id as string,
                                                    ) ||
                                                    customer?.groupNames?.includes(
                                                      group.groupName,
                                                    )
                                                  }
                                                  onCheckedChange={(
                                                    checked,
                                                  ) => {
                                                    if (checked) {
                                                      setCreateGroupSelectedCustomers(
                                                        (prev) => [
                                                          ...prev,
                                                          customer._id as string,
                                                        ],
                                                      );
                                                    } else {
                                                      setCreateGroupSelectedCustomers(
                                                        (prev) =>
                                                          prev.filter(
                                                            (id) =>
                                                              id !==
                                                              customer._id,
                                                          ),
                                                      );
                                                    }
                                                  }}
                                                />

                                                <span className="text-sm">
                                                  {customer.full_name} (
                                                  {customer.phone})
                                                </span>
                                              </div>
                                            ),
                                          )}
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                          {createGroupSelectedCustomers.length}{" "}
                                          customers selected
                                        </div>
                                      </div>

                                      {/* Add Customer */}
                                      <AddCustomerDialog
                                        mutateCustomersData={
                                          mutateCustomersData
                                        }
                                        trigger={<Button>Add Customer</Button>}
                                      />
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>

                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>

                                    <AlertDialogAction
                                      onClick={() =>
                                        handleEditGroup(group.groupName)
                                      }
                                      className="bg-muted-foreground/30 hover:bg-muted-foreground/50 text-white"
                                    >
                                      Edit Group
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                //console.log("Delete group:", group.groupName);
                                handleDeleteGroup(group.groupName);
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <CardContent className="px-4 py-2 flex items-center gap-3">
                        <span className="text-sm font-medium">
                          {group.groupName}
                        </span>

                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            selectedGroup === group.groupName
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {group.count}
                        </span>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Subtle Navigation - hidden if not needed */}
              {groups.length > 6 && (
                <div className="hidden lg:block ">
                  <CarouselPrevious className="-left-4 h-7 w-7" />
                  <CarouselNext className="-right-4 h-7 w-7" />
                </div>
              )}
            </Carousel>
          </div>
        )}
      </div>
      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-start sm:items-center max-xl:flex-wrap justify-between">
        <div className="w-full flex items-center gap-2">
          {/* search */}
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customer"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          {/* filters */}
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 text-xs bg-red-500 text-white rounded-full px-2">
                    {activeFilterCount}
                  </span>
                )}
                <Funnel className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => {
                    setNextCallDate(new Date());
                    setSelectedGroup(null);
                    setPage(1);
                  }}
                >
                  Today
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Groups</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {groups.length === 0 && (
                        <DropdownMenuItem>No Groups</DropdownMenuItem>
                      )}
                      {groups.map((group) => (
                        <DropdownMenuItem
                          key={group.groupName}
                          onClick={() => {
                            setSelectedGroup(group.groupName);
                            setNextCallDate(null);
                          }}
                        >
                          {group.groupName} ({group.count})
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Custom Search</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="p-2">
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setCustomSearchType("product");
                        }}
                      >
                        By Product
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setCustomSearchType("category");
                        }}
                      >
                        By Category
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setCustomSearchType("nextCall");
                        }}
                      >
                        By Next Call
                      </DropdownMenuItem>

                      {/* DYNAMIC INPUT AREA INSIDE MENU */}
                      {customSearchType && (
                        <div className="mt-2 p-2 border-t space-y-2">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground">
                            Searching {customSearchType}
                          </p>

                          {customSearchType === "nextCall" ? (
                            <Calendar
                              mode="single"
                              selected={nextCallDate || undefined}
                              onSelect={(date) => {
                                setNextCallDate(date || null);
                                setIsDropdownOpen(false);
                              }}
                              className="rounded-md border"
                            />
                          ) : (
                            <div className="space-y-2">
                              <Input
                                value={customSearchValue}
                                onChange={(e) =>
                                  setCustomSearchValue(e.target.value)
                                }
                                placeholder="Type to search..."
                              />

                              {suggestions.length > 0 && (
                                <div>
                                  <span className="pb-2">
                                    {customSearchType}&apos;s
                                  </span>
                                  <div className="border rounded-md shadow-sm">
                                    {suggestions.map((s) => (
                                      <div
                                        key={s.name}
                                        className="p-2 hover:bg-muted cursor-pointer"
                                        onClick={() =>
                                          handleSuggestionSelect(
                                            s.productId || s.categoryId,
                                            s.name,
                                          )
                                        }
                                      >
                                        {s.name}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => {
              setNextCallDate(new Date());
              setSelectedGroup(null);
              setPage(1);
            }}
          >
            Today
          </Button>
          {activeFilterCount > 0 && (
            <>
              <Button onClick={clearAllFilters} className="text-red-500">
                Clear All Filters ({activeFilterCount})
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 justify-end max-xl:flex-wrap">
          {/* New Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="border-primary text-primary hover:bg-primary/5"
            disabled={filteredCustomers.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {/* assign group button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-primary text-white"
                disabled={selectedCustomer.length === 0}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add to Group
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="bg-accent">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Add selected customers to group
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Existing Group</Label>
                    <Select value={groupName} onValueChange={setGroupName}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.groupName} value={group.groupName}>
                            {group.groupName} ({group.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Or Enter New Group Name</Label>
                    <Input
                      placeholder="New group name"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedCustomer.length} customers will be added to &quot;{groupName || "..."}&quot;
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setGroupName("")}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={handleAssignGroup}
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {/* create group button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-primary text-white"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="bg-accent">
              <AlertDialogHeader>
                <AlertDialogTitle>Create Group</AlertDialogTitle>

                <AlertDialogDescription className="space-y-4">
                  {/* Group Name */}
                  <div className="space-y-2">
                    <Label>Group Name</Label>
                    <Input
                      placeholder="Enter Group Name"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </div>

                  {/* Search Customer */}
                  <div className="space-y-2">
                    <Label>Select Customers</Label>

                    <Input
                      placeholder="Search customer..."
                      value={createGroupSearch}
                      onChange={(e) => setCreateGroupSearch(e.target.value)}
                    />

                    <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-2">
                      {createGroupFilteredCustomers.map((customer) => (
                        <div
                          key={customer._id}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            checked={createGroupSelectedCustomers.includes(
                              customer._id as string,
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setCreateGroupSelectedCustomers((prev) => [
                                  ...prev,
                                  customer._id as string,
                                ]);
                              } else {
                                setCreateGroupSelectedCustomers((prev) =>
                                  prev.filter((id) => id !== customer._id),
                                );
                              }
                            }}
                          />

                          <span className="text-sm">
                            {customer.full_name} ({customer.phone})
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {createGroupSelectedCustomers.length} customers selected
                    </div>
                  </div>

                  {/* Add Customer */}
                  <AddCustomerDialog
                    mutateCustomersData={mutateCustomersData}
                    trigger={<Button>Add Customer</Button>}
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <AlertDialogAction
                  onClick={handleCreateGroup}
                  className="bg-muted-foreground/30 hover:bg-muted-foreground/50 text-white"
                >
                  Create Group
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {/* block button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-100 text-red-700 border-red-200 hover:bg-red-500 hover:text-white"
                disabled={selectedCustomer.length === 0}
              >
                <CircleSlash2 className="h-4 w-4 mr-2" />
                Block Selected
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="bg-accent">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently Block
                  selected customers.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 text-white"
                  onClick={handleBlockMany}
                >
                  Block
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {/* add customer */}
          {/* <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-accent dark:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </AlertDialogTrigger>

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
                  placeholder="Address"
                  value={newCustomer.address}
                  onChange={handleInputChange}
                />
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isSubmitting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleAddCustomer}
                  disabled={isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700  text-white"
                >
                  {isSubmitting ? "Saving..." : "Add Customer"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog> */}
          <AddCustomerDialog
            mutateCustomersData={mutateCustomersData}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="bg-accent dark:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            }
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    paginated.length > 0 &&
                    paginated.every((p) =>
                      selectedCustomer.includes(p._id as string),
                    )
                  }
                  onCheckedChange={(checked) =>
                    handleSelectAll(Boolean(checked))
                  }
                />
              </TableHead>

              <TableHead>NAME</TableHead>
              <TableHead>ADDRESS</TableHead>
              <TableHead>PHONE</TableHead>
              <TableHead>NOTE</TableHead>
              <TableHead>NEXT CALL</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.map((customer) => (
              <CustomerTableRow
                key={customer._id}
                customer={customer}
                selectedCustomers={selectedCustomer}
                setSelectedCustomers={setSelectedCustomer}
                mutateCustomersData={mutateCustomersData}
              />
            ))}

            {paginated.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6 text-muted-foreground"
                >
                  No Customers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(Math.max(1, page - 1))}
                className={
                  page === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink
                  isActive={page === i + 1}
                  onClick={() => setPage(i + 1)}
                  className="cursor-pointer"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                className={
                  page === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
