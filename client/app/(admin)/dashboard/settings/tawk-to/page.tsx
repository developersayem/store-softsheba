"use client";

import TawkToSettingsForm from "@/components/dashboard/settings/tawk-to/TawkToSettingsForm";
import { useStoreSettings } from "@/contexts/store-settings-context";
import { Loader2, MessageCircle } from "lucide-react";

const TawkToSettingsPage = () => {
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
          <MessageCircle className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tawk.to Chat Integration</h1>
          <p className="text-muted-foreground mt-1">
            Manage your live chat widget settings and position.
          </p>
        </div>
      </div>

      <TawkToSettingsForm />
    </div>
  );
};

export default TawkToSettingsPage;
