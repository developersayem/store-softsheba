"use client";

import { useState, useMemo } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Search, Trash2, Pencil, Ban, CheckCircle2 } from "lucide-react";
import { IUser } from "@/types/user.type";
import { KeyedMutator } from "swr";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

interface StaffTableProps {
  staffData?: IUser[];
  mutateStaffData: KeyedMutator<{ data: IUser[] }>;
}

export function StaffTable({ staffData = [], mutateStaffData }: StaffTableProps) {
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const filteredStaff = useMemo(() => {
    return staffData.filter(
      (user) =>
        user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [staffData, search]);

  const handleToggleActive = async (user: IUser) => {
    try {
      const newStatus = !user.isActive;
      await api.patch(`/staff/${user._id}`, { isActive: newStatus });
      toast.success(`Staff account ${newStatus ? "activated" : "restricted"} successfully`);
      mutateStaffData();
    } catch {
      toast.error("Failed to update staff status");
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/staff/${userToDelete}`);
      toast.success("Staff member removed successfully");
      mutateStaffData();
    } catch {
      toast.error("Failed to remove staff member");
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.length > 0 ? (
              filteredStaff.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[300px]">
                      {user.permissions?.length > 0 ? (
                        user.permissions.map((p) => (
                          <Badge key={p} variant="outline" className="text-[10px]">
                            {p}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No specific permissions</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/dashboard/staff/${user._id}/edit`}>
                        <Button variant="ghost" size="icon" className="size-8">
                          <Pencil className="size-4 text-primary" />
                        </Button>
                      </Link>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-8"
                        onClick={() => handleToggleActive(user)}
                        title={user.isActive ? "Restrict Access" : "Grant Access"}
                      >
                        {user.isActive ? (
                          <Ban className="size-4 text-orange-500" />
                        ) : (
                          <CheckCircle2 className="size-4 text-green-500" />
                        )}
                      </Button>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-8"
                        onClick={() => setUserToDelete(user._id)}
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/dashboard/staff/${user._id}/edit`}>
                            <DropdownMenuItem className="cursor-pointer">
                              <Pencil className="mr-2 size-4" /> Edit
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleToggleActive(user)}
                          >
                            {user.isActive ? (
                              <><Ban className="mr-2 size-4 text-orange-500" /> Restrict</>
                            ) : (
                              <><CheckCircle2 className="mr-2 size-4 text-green-500" /> Activate</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500 cursor-pointer"
                            onClick={() => setUserToDelete(user._id)}
                          >
                            <Trash2 className="mr-2 size-4" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No staff members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the staff member&apos;s access to the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
