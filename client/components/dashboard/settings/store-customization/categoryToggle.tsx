"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useStoreSettings } from "@/contexts/store-settings-context";

export default function CategoryToggleSettings() {
  const { categoryToggle, setCategoryToggle } = useStoreSettings();
  return (
    <div className="space-y-6 ">
      <div>
        <h1 className="text-2xl font-bold mt-6">Category Toggle Settings</h1>
      </div>
      <Card className="bg-accent">
        <CardContent className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Show Category Icons</h1>
          <div className="flex items-center space-x-2 pt-1">
            <Switch
              id="icon-toggle"
              checked={categoryToggle}
              onCheckedChange={(checked) => setCategoryToggle(checked)}
            />
            <Label htmlFor="icon-toggle" className="cursor-pointer">
              {categoryToggle ? "On" : "Off"}
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
