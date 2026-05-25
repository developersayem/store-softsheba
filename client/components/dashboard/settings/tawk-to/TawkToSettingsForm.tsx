"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useStoreSettings } from "@/contexts/store-settings-context";
import { Hash, Layers, PanelLeft, PanelRight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function TawkToSettingsForm() {
  const { tawkTo, setTawkTo } = useStoreSettings();

  const handleChange = (key: string, value: string | boolean) => {
    setTawkTo((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Card className="dark:bg-accent border-none shadow-none bg-accent/50">
        <CardContent className="grid gap-6 pt-6">
          {/* Enabled Toggle */}
          <div className="flex items-center justify-between border-b border-border/50 pb-6">
            <div className="space-y-1">
              <Label className="text-lg font-semibold">Enable Tawk.to Chat</Label>
              <p className="text-sm text-muted-foreground">
                Turn on to show the live chat widget on your store
              </p>
            </div>
            <div className="flex items-center space-x-3 bg-background/50 p-2 rounded-lg border border-border/50">
              <Switch
                id="tawk-enabled"
                checked={tawkTo?.enabled}
                onCheckedChange={(checked) => handleChange("enabled", checked)}
              />
              <Label htmlFor="tawk-enabled" className="cursor-pointer font-medium min-w-[70px]">
                {tawkTo?.enabled ? "Enabled" : "Disabled"}
              </Label>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Property ID Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Property ID</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10 h-11"
                  value={tawkTo?.property_id}
                  placeholder="e.g. 6423..."
                  onChange={(e) => handleChange("property_id", e.target.value)}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Found in Tawk.to dashboard under Administration &gt; Chat Widget
              </p>
            </div>

            {/* Widget ID Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Widget ID</Label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10 h-11"
                  value={tawkTo?.widget_id}
                  placeholder="e.g. 1gs..."
                  onChange={(e) => handleChange("widget_id", e.target.value)}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Default is usually &quot;default&quot;
              </p>
            </div>
          </div>

          {/* Position Selection */}
          <div className="space-y-4 pt-4">
            <Label className="text-sm font-medium">Widget Position</Label>
            <RadioGroup
              value={tawkTo?.position}
              onValueChange={(value) => handleChange("position", value)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="bottom-right"
                  id="bottom-right"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="bottom-right"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <PanelRight className="mb-3 h-6 w-6" />
                  <span className="text-sm font-medium">Bottom Right</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="bottom-left"
                  id="bottom-left"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="bottom-left"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <PanelLeft className="mb-3 h-6 w-6" />
                  <span className="text-sm font-medium">Bottom Left</span>
                </Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              Choose which corner of the screen the chat widget should appear in.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
