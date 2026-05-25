"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useStoreSettings } from "@/contexts/store-settings-context";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  PanelLeft, 
  PanelRight, 
  LucideIcon
} from "lucide-react";

interface PositionItem {
  id: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  label: string;
  icon: LucideIcon;
}

export default function FloatingContactSettingsForm() {
  const { floatingContact, setFloatingContact } = useStoreSettings();

  const handlePositionChange = (value: string) => {
    setFloatingContact({ 
      ...floatingContact, 
      position: value as "bottom-right" | "bottom-left" | "top-right" | "top-left"
    });
  };

  const positions: PositionItem[] = [
    { id: "bottom-right", label: "Bottom Right", icon: PanelRight },
    { id: "bottom-left", label: "Bottom Left", icon: PanelLeft },
    { id: "top-right", label: "Top Right", icon: PanelRight },
    { id: "top-left", label: "Top Left", icon: PanelLeft },
  ];

  return (
    <Card className="dark:bg-accent border-none shadow-none bg-accent/50">
      <CardContent className="grid gap-6 pt-6">
        {/* Enabled Toggle */}
        <div className="flex items-center justify-between border-b border-border/50 pb-6">
          <div className="space-y-1">
            <Label className="text-lg font-bold">Floating Contact Widget</Label>
            <p className="text-sm text-muted-foreground">
              Enable a floating widget on your storefront for quick access to support channels.
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-background/50 p-2 rounded-lg border border-border/50">
            <Switch
              id="widget-enabled"
              checked={floatingContact.enabled}
              onCheckedChange={(checked: boolean) =>
                setFloatingContact({ ...floatingContact, enabled: checked })
              }
            />
            <Label htmlFor="widget-enabled" className="cursor-pointer font-medium min-w-[70px]">
              {floatingContact.enabled ? "Enabled" : "Disabled"}
            </Label>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Phone Number (direct call)</Label>
            <Input
              value={floatingContact.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFloatingContact({
                  ...floatingContact,
                  phone: e.target.value,
                })
              }
              placeholder="+8801..."
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">WhatsApp Number</Label>
            <Input
              value={floatingContact.whatsapp}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFloatingContact({
                  ...floatingContact,
                  whatsapp: e.target.value,
                })
              }
              placeholder="8801..."
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Messenger Username/ID</Label>
            <Input
              value={floatingContact.messenger}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFloatingContact({
                  ...floatingContact,
                  messenger: e.target.value,
                })
              }
              placeholder="store.name"
              className="h-11"
            />
          </div>
        </div>

        {/* Position Selection */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Widget Position</Label>
            <p className="text-xs text-muted-foreground">
              Choose which corner of the screen the contact widget should appear in.
            </p>
          </div>
          
          <RadioGroup
            value={floatingContact.position}
            onValueChange={handlePositionChange}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            {positions.map((item) => (
              <div key={item.id}>
                <RadioGroupItem
                  value={item.id}
                  id={item.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={item.id}
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover/50 p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all cursor-pointer group h-full"
                >
                  <item.icon className={`h-6 w-6 mb-3 transition-colors ${floatingContact.position === item.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
