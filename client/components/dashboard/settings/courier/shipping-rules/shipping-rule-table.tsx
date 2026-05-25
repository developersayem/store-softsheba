"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { KeyedMutator } from "swr";
import { toast } from "sonner";
import { IShippingRule } from "@/types/shipping_rule.type";
import { AddShippingRuleModal } from "./add-shipping-rule-modal";

/* ---------------- PROPS ---------------- */

interface ShippingRulesTableProps {
  shippingRules?: IShippingRule[];
  className?: string;
  onEdit?: (rule: IShippingRule) => void;
  mutateShippingRulesData: KeyedMutator<{ data: IShippingRule[] }>;
}

/* ---------------- COMPONENT ---------------- */

export function ShippingRulesTable({
  shippingRules = [],
  className,
  onEdit,
  mutateShippingRulesData,
}: ShippingRulesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<
    "all" | "flat_rate" | "free_shipping" | "rate_by_weight"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const itemsPerPage = 20;

  /* ---------------- FILTERING ---------------- */

  const filtered = useMemo(() => {
    return shippingRules.filter((rule) => {
      if (!rule._id) return false;

      const matchesSearch = rule.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filterBy === "all") return true;

      return rule.areas.some((a) => a.type === filterBy);
    });
  }, [shippingRules, searchTerm, filterBy]);

  /* ---------------- PAGINATION ---------------- */

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ---------------- SELECTION ---------------- */

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRules(paginated.map((r) => r._id!).filter(Boolean));
    } else {
      setSelectedRules([]);
    }
  };

  const handleSelectRule = (id: string, checked: boolean) => {
    setSelectedRules((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };

  /* ---------------- ACTIONS ---------------- */

  const handleToggleActive = async (ruleId: string) => {
    try {
      await api.patch(`/shipping-rules/${ruleId}/toggle-active`);
      toast.success("Status updated");
      await mutateShippingRulesData();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (ruleId: string) => {
    try {
      await api.delete(`/shipping-rules/${ruleId}`);
      toast.success("Shipping rule deleted");
      await mutateShippingRulesData();
    } catch {
      toast.error("Failed to delete rule");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className={`space-y-4 ${className ?? ""}`}>
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shipping rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-3">
          <Select
            value={filterBy}
            onValueChange={(
              value: "flat_rate" | "free_shipping" | "rate_by_weight" | "all"
            ) => setFilterBy(value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by area type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="flat_rate">Flat Rate</SelectItem>
              <SelectItem value="free_shipping">Free Shipping</SelectItem>
              <SelectItem value="rate_by_weight">Rate by Weight</SelectItem>
            </SelectContent>
          </Select>
          <AddShippingRuleModal mutateShippingRules={mutateShippingRulesData} />
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
                    paginated.every((r) => selectedRules.includes(r._id!))
                  }
                  onCheckedChange={(checked) =>
                    handleSelectAll(Boolean(checked))
                  }
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Area Types</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.map((rule) => (
              <TableRow key={rule._id}>
                <TableCell>
                  <Checkbox
                    checked={selectedRules.includes(rule._id!)}
                    onCheckedChange={(v) =>
                      handleSelectRule(rule._id!, Boolean(v))
                    }
                  />
                </TableCell>

                <TableCell>{rule.name}</TableCell>

                <TableCell className="capitalize">
                  {[
                    ...new Set(
                      rule.areas.map((a) => a?.type?.replace(/_/g, " "))
                    ),
                  ].join(", ")}
                </TableCell>

                <TableCell>
                  <Switch
                    checked={rule.active}
                    onCheckedChange={() => handleToggleActive(rule._id!)}
                  />
                </TableCell>

                <TableCell className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit?.(rule)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete “{rule.name}”.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 text-white"
                          onClick={() => handleDelete(rule._id!)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}

            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No shipping rules found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Button
              key={i}
              size="sm"
              variant={currentPage === i + 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
