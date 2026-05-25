"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Shield } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/lib/axios";
import LoadingCom from "@/components/shared/loading-com";
import { PERMISSION_GROUPS } from "@/constants/permissions";


export default function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    isActive: true,
    phoneNumber: "",
    address: "",
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await api.get(`/staff/${id}`);
        const staff = response.data.data;
        setFormData({
          fullName: staff.fullName,
          email: staff.email,
          isActive: staff.isActive,
          phoneNumber: staff.phoneNumber || "",
          address: staff.address || "",
        });
        setSelectedPermissions(staff.permissions || []);
      } catch {
        toast.error("Failed to load staff details");
        router.push("/dashboard/staff");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [id, router]);

  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleGroup = (groupIds: string[]) => {
    const allSelected = groupIds.every((id) => selectedPermissions.includes(id));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      setSelectedPermissions((prev) => [
        ...new Set([...prev, ...groupIds]),
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setUpdating(true);
    try {
      await api.patch(`/staff/${id}`, {
        fullName: formData.fullName,
        permissions: selectedPermissions,
        isActive: formData.isActive,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      });
      toast.success("Staff account updated successfully");
      router.push("/dashboard/staff");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to update staff account");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingCom />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/staff">
          <Button variant="outline" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Staff</h1>
          <p className="text-sm text-muted-foreground">
            Update account details and permissions for {formData.fullName}.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 order-2 md:order-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="size-5 text-primary" /> Permissions & Access
              </CardTitle>
              <CardDescription>Update which sections this staff member can access.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {PERMISSION_GROUPS.map((group) => {
                const groupIds = group.permissions.map((p) => p.id);
                const allSelected = groupIds.every((id) => selectedPermissions.includes(id));
                const someSelected = groupIds.some((id) => selectedPermissions.includes(id)) && !allSelected;

                return (
                  <div key={group.name} className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="font-semibold text-sm">{group.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`select-all-${group.name}`}
                          checked={allSelected}
                          onCheckedChange={() => toggleGroup(groupIds)}
                          className={someSelected ? "opacity-70" : ""}
                        />
                        <label
                          htmlFor={`select-all-${group.name}`}
                          className="text-[10px] font-medium leading-none cursor-pointer text-muted-foreground"
                        >
                          Select All
                        </label>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {group.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-start space-x-3">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor={permission.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {permission.label}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-6 order-1 md:order-2 md:sticky md:top-24 h-fit">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Details</CardTitle>
              <CardDescription>Basic information for the account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Staff Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="staff@example.com"
                  value={formData.email}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-[10px] text-muted-foreground">Email address cannot be changed.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="+880123456789"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Street, City, Country"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Account Status</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Enable or disable this staff account.
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={updating}>
            {updating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Staff Account"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
