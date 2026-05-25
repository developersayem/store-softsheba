"use client";

import { useEffect } from "react";
import {
  Plus,
  Trash2,
  Link as LinkIcon,
  ArrowUp,
  ArrowDown,
  Type,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { NavItem } from "@/types/store.settings.type";
import { useStoreSettings } from "@/contexts/store-settings-context";

export default function NavbarSettings() {
  const { navItems, setNavItems, storeSettingsData, isLoading } =
    useStoreSettings();

  useEffect(() => {
    if (!isLoading && storeSettingsData.length > 0) {
      setNavItems(storeSettingsData[0].nav_bar);
    }
  }, [isLoading, storeSettingsData, setNavItems]);

  const handleAdd = () => {
    setNavItems([...navItems, { name: "", href: "" }]);
  };

  const handleRemove = (index: number) => {
    const updated = navItems.filter((_, i) => i !== index);
    setNavItems(updated);
  };

  const handleChange = (index: number, field: keyof NavItem, value: string) => {
    const updated = [...navItems];
    updated[index][field] = value;
    setNavItems(updated);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === navItems.length - 1) return;

    const updated = [...navItems];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    // Swap elements
    [updated[index], updated[targetIndex]] = [
      updated[targetIndex],
      updated[index],
    ];
    setNavItems(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header Row for Labels (Hidden on mobile) */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 px-2 text-sm font-medium text-muted-foreground">
        <div className="col-span-4">Display Name</div>
        <div className="col-span-5">Destination URL</div>
        <div className="col-span-3 text-right">Actions</div>
      </div>

      <Separator className="hidden md:block" />

      {/* Dynamic Input Rows */}
      <div className="space-y-4">
        {navItems.map((item, index) => (
          <div
            key={index}
            className="group flex flex-col md:grid md:grid-cols-12 gap-4 items-center bg-accent/20 p-3 rounded-lg border border-transparent hover:border-accent transition-all"
          >
            {/* Name Input */}
            <div className="w-full md:col-span-4 space-y-1">
              <Label className="md:hidden text-xs text-muted-foreground">
                Name
              </Label>
              <div className="relative">
                <Type className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
                <Input
                  value={item.name}
                  onChange={(e) => handleChange(index, "name", e.target.value)}
                  placeholder="e.g. Home"
                  className="pl-9 "
                />
              </div>
            </div>

            {/* Href Input */}
            <div className="w-full md:col-span-5 space-y-1">
              <Label className="md:hidden text-xs text-muted-foreground">
                URL
              </Label>
              <div className="relative">
                <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
                <Input
                  value={item.href}
                  onChange={(e) => handleChange(index, "href", e.target.value)}
                  placeholder="e.g. /shop"
                  className="pl-9  font-mono text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="w-full md:col-span-3 flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                disabled={index === 0}
                onClick={() => handleMove(index, "up")}
                title="Move Up"
              >
                <ArrowUp className="h-4 w-4 text-muted-foreground" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                disabled={index === navItems.length - 1}
                onClick={() => handleMove(index, "down")}
                title="Move Down"
              >
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
              </Button>

              <div className="h-4 w-px bg-border mx-1" />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(index)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                title="Remove Link"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State / Add Button */}
      {navItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>No menu items found.</p>
        </div>
      )}

      <Button
        variant="outline"
        className="w-full border-dashed py-6 text-muted-foreground hover:text-primary"
        onClick={handleAdd}
      >
        <Plus className="mr-2 h-4 w-4" /> Add New Menu Item
      </Button>
    </div>
  );
}
