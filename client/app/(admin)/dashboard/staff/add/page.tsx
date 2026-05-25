"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, Shield, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { PERMISSION_GROUPS } from "@/constants/permissions";


export default function AddStaffPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    PERMISSION_GROUPS.flatMap((group) =>
      group.permissions
        .filter((p) => p.id.endsWith(":view"))
        .map((p) => p.id)
    )
  );
  const [showPassword, setShowPassword] = useState(false);

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
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      // Re-using the 'register' function which now maps to '/staff/create'
      await register(
        formData.fullName,
        formData.email,
        formData.password,
        "", // storeName not needed for staff creation as backend handles storeId
        selectedPermissions
      );
      toast.success("Staff account created successfully");
      router.push("/dashboard/staff");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to create staff account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/staff">
          <Button variant="outline" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Staff</h1>
          <p className="text-sm text-muted-foreground">
            Create a new account and assign specific permissions.
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
              <CardDescription>Select which sections this staff member can access.</CardDescription>
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
              <CardDescription>Basic information for the new account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="Staff Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="staff@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
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
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Staff Account"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
