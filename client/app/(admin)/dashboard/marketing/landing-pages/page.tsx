"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LayoutTemplate,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "sonner";

interface LandingPage {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  productId?: { name: string; slug: string; thumbnail?: string };
  createdAt: string;
}

export default function LandingPagesPage() {
  const router = useRouter();
  const { data, isLoading, mutate } = useSWR("landing-pages", fetcher);
  const pages: LandingPage[] = data?.data || [];
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this landing page?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/landing-pages/${id}`);
      toast.success("Landing page deleted");
      mutate();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/landing-pages/${id}/toggle-active`);
      mutate();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/lp/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#1E8896]/10">
            <LayoutTemplate className="h-6 w-6 text-[#1E8896]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Landing Pages</h1>
            <p className="text-sm text-muted-foreground">
              Create product-specific marketing landing pages
            </p>
          </div>
        </div>
        <Button
          onClick={() =>
            router.push("/dashboard/marketing/landing-pages/create")
          }
          className="bg-[#1E8896] hover:bg-[#166d78] gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Landing Page
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>URL Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-32">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <LayoutTemplate className="h-10 w-10 opacity-30" />
                    <p>No landing pages yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          "/dashboard/marketing/landing-pages/create"
                        )
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" /> Create your first one
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page) => (
                <TableRow key={page._id}>
                  <TableCell className="font-medium">{page.name}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {page.productId?.name || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        /lp/{page.slug}
                      </code>
                      <button
                        onClick={() => handleCopyLink(page.slug)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={page.isActive}
                        onCheckedChange={() => handleToggle(page._id)}
                        className="data-[state=checked]:bg-[#1E8896]"
                      />
                      <Badge
                        variant={page.isActive ? "default" : "secondary"}
                        className={
                          page.isActive
                            ? "bg-[#1E8896] text-white"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {page.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(page.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          window.open(`/lp/${page.slug}`, "_blank")
                        }
                      >
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          router.push(
                            `/dashboard/marketing/landing-pages/${page._id}/edit`
                          )
                        }
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={deletingId === page._id}
                        onClick={() => handleDelete(page._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
