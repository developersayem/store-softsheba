"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { useStoreSettings } from "@/contexts/store-settings-context";

const UnderMaintenanceToggle = () => {
  const { isMaintenanceMode, setIsMaintenanceMode } = useStoreSettings();

  return (
    <div className="rounded-xl border bg-muted p-4 space-y-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <Label className="text-base font-semibold">
            Under Maintenance Mode
          </Label>
        </div>

        <Switch
          checked={isMaintenanceMode}
          onCheckedChange={(checked) => setIsMaintenanceMode(checked)}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        When enabled, customers will see a maintenance page instead of the
        storefront.
      </p>
    </div>
  );
};

export default UnderMaintenanceToggle;
