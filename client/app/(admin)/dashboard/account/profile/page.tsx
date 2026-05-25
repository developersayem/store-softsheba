"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Eye, EyeOff } from "lucide-react";
import type { AxiosError } from "axios";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import api from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Profile() {
  const { data: user, isLoading, mutate } = useSWR("/auth/me", fetcher);

  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [twoStepEnabled, setTwoStepEnabled] = useState(false);
  const [avatar, setAvatar] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoStepEmail, setTwoStepEmail] = useState("");
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [pendingAction, setPendingAction] = useState<
    "password" | "twoStep" | "twoStepEmail" | "profile" | null
  >(null);
  const [sentToEmail, setSentToEmail] = useState("");

  // Generic function to trigger OTP request
  const triggerOtpFlow = async (
    action: "password" | "twoStep" | "twoStepEmail" | "profile",
  ) => {
    if (action === "password") {
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error("Please fill in all password fields");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    if (action === "twoStepEmail" && !twoStepEmail) {
      toast.error("Please enter a backup email address");
      return;
    }
    if (action === "profile" && email !== user?.data?.email && !email) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      setPendingAction(action);
      setIsOtpDialogOpen(true);
      const res = await api.post("/auth/request-security-otp", {
        email: user?.data?.email,
      });
      setSentToEmail(res.data.data.sentTo);
      toast("Verification code sent to your email");
    } catch (error) {
      console.log(error);
      toast("Failed to send verification code");
    }
  };

  useEffect(() => {
    if (user?.data) {
      setFullName(user.data.fullName || "");
      setEmail(user.data.email || "");
      setTwoStepEnabled(user.data.twoStepEnabled);
      setAvatar(user.data.avatar);
      setTwoStepEmail(user.data?.twoStepEmail ?? "");
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    // If email is changing, trigger OTP instead of direct update
    if (email !== user?.data?.email) {
      triggerOtpFlow("profile");
      return;
    }

    try {
      await api.patch("/auth/profile", {
        fullName,
        email,
      });
      mutate();
      toast("Profile info updated");
    } catch {
      toast("Update failed");
    }
  };

  const handleProfileVerifyAndSave = async () => {
    try {
      await api.patch("/auth/profile", {
        fullName,
        email,
        otpCode,
      });
      mutate();
      setIsOtpDialogOpen(false);
      setOtpCode("");
      toast.success("Profile updated successfully!");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(
        error?.response?.data?.message || "Profile update failed.",
      );
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      await api.patch("/auth/update-avatar", formData);
      mutate();
      toast("Avatar updated");
    } catch {
      toast("Upload failed");
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast("Passwords do not match");
      return;
    }
    try {
      await api.patch("/auth/password", {
        currentPassword,
        newPassword,
        confirmPassword,
        otpCode,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsOtpDialogOpen(false);
      setOtpCode("");

      toast.success("Password changed");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(
        error?.response?.data?.message || "Failed to update password.",
      );
    }
  };

  const handleTwoStepToggle = async () => {
    // Logic: Toggle the OPPOSITE of current state
    const targetValue = !twoStepEnabled;
    try {
      await api.patch("/auth/two-step", {
        enabled: targetValue,
        otpCode,
      });
      mutate();
      setIsOtpDialogOpen(false);
      setOtpCode("");
      toast.success(
        `Two-step verification is now ${targetValue ? "active" : "inactive"}.`,
      );
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(
        error?.response?.data?.message || "Could not change security settings.",
      );
    }
  };

  const handleTwoStepEmailChange = async () => {
    try {
      await api.patch("/auth/add-two-step", { twoStepEmail, otpCode });
      mutate();
      setIsOtpDialogOpen(false);
      setOtpCode("");
      toast.success(`Two-step verification email updated!`);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(
        error?.response?.data?.message || "Could not change security settings.",
      );
    }
  };
  //console.log(avatar)

  if (isLoading) {
    return (
      <div className="p-6 space-y-8">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Security Verification</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code sent to{" "}
              <span className="font-medium text-foreground">{sentToEmail}</span>{" "}
              to confirm these changes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOtpDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (pendingAction === "password") handlePasswordChange();
                if (pendingAction === "twoStep") handleTwoStepToggle();
                if (pendingAction === "twoStepEmail")
                  handleTwoStepEmailChange();
                if (pendingAction === "profile") handleProfileVerifyAndSave();
              }}
            >
              Verify & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div>
        <h1 className="text-2xl font-semibold">Account Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, security, and preferences
        </p>
      </div>

      <section className="bg-background border rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-medium">Profile Information</h2>
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <Avatar className="w-24 h-24 rounded-full border">
              <AvatarImage src={avatar} alt={fullName} className="object-cover" />
              <AvatarFallback className="uppercase text-2xl">
                {fullName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition"
            >
              <Camera className="text-white w-5 h-5" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="font-medium">Profile Photo</p>
            <p className="text-sm text-muted-foreground">
              PNG or JPG up to 2MB
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleProfileUpdate}>Save Changes</Button>
        </div>
      </section>

      <section className="bg-background border rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-medium">Security</h2>
        <div className="space-y-4">
          <p className="font-medium">Change Password</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showCurrentPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => triggerOtpFlow("password")}
            >
              Update Password
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Two-Step Verification</p>
            <p className="text-sm text-muted-foreground">
              Add extra security to your account
            </p>
          </div>
          <Switch
            checked={twoStepEnabled}
            onCheckedChange={() => triggerOtpFlow("twoStep")}
          />
        </div>

        <div className="flex justify-between gap-2">
          <div className="w-full space-y-3">
            <Label>
              Two Step Email Address{" "}
              <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              className="w-full"
              type="email"
              placeholder="Two step verification email"
              value={twoStepEmail}
              onChange={(e) => setTwoStepEmail(e.target.value)}
            />
          </div>
          <div className="flex items-end justify-end">
            <Button
              variant="outline"
              onClick={() => triggerOtpFlow("twoStepEmail")}
            >
              Update Email
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
