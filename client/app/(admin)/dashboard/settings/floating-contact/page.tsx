"use client";

import FloatingContactSettingsForm from "@/components/dashboard/settings/floating-contact/FloatingContactSettingsForm";
import { useStoreSettings } from "@/contexts/store-settings-context";
import { Loader2, MessageSquare } from "lucide-react";

const FloatingContactSettingsPage = () => {
  const { isUpdating } = useStoreSettings();

  return (
    <div className="py-8 px-4">
      {isUpdating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-lg bg-background px-6 py-4 shadow-lg border border-border">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Updating settings...</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Floating Contact Widget</h1>
          <p className="text-muted-foreground mt-1">
            Configure your storefront&apos;s floating contact buttons (Phone, WhatsApp, Messenger).
          </p>
        </div>
      </div>

      <FloatingContactSettingsForm />
    </div>
  );
};

export default FloatingContactSettingsPage;
