"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useStoreSettings } from "@/contexts/store-settings-context";
import { ProductDetailsSettings } from "@/types/store.settings.type";

export default function ProductDetailsPageSettings() {
  const { productDetailsSettings, setProductDetailsSettings } =
    useStoreSettings();

  // Handle Input Change
  const handleChange = (key: keyof ProductDetailsSettings, value: string) => {
    setProductDetailsSettings((prev) => ({ ...prev, [key]: value }));
  };
  const handleToggle = (checked: boolean) => {
    setProductDetailsSettings((prev) => ({
      ...prev,
      enableWhatsApp: checked,
    }));
  };
  const handleReviewToggle = (checked: boolean) => {
    setProductDetailsSettings((prev) => ({
      ...prev,
      review_enabled: checked,
    }));
  };

  return (
    <div className="py-6 ">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Product Details Settings</h1>
          </div>
        </div>

        <Card className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 rounded-xl">
          {/* Section 1: Add to Cart Button */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <h2 className="text-lg font-semibold ">Add to Cart Button</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="atc-text">Button Text</Label>
              <Input
                id="atc-text"
                value={productDetailsSettings?.add_to_cart_btn_text || "Add to Cart"}
                onChange={(e) => handleChange("add_to_cart_btn_text", e.target.value)}
                placeholder="Add to Cart"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorPicker
                label="Background Color"
                value={productDetailsSettings?.add_to_cart_btn_color || productDetailsSettings?.button_bg_color}
                onChange={(val) => handleChange("add_to_cart_btn_color", val)}
              />
              <ColorPicker
                label="Text Color"
                value={productDetailsSettings?.add_to_cart_btn_text_color || productDetailsSettings?.button_text_color}
                onChange={(val) => handleChange("add_to_cart_btn_text_color", val)}
              />
              <ColorPicker
                label="Hover Background"
                value={productDetailsSettings?.add_to_cart_btn_hover_color || productDetailsSettings?.button_hover_bg_color}
                onChange={(val) => handleChange("add_to_cart_btn_hover_color", val)}
              />
              <ColorPicker
                label="Hover Text Color"
                value={productDetailsSettings?.add_to_cart_btn_text_hover_color || productDetailsSettings?.button_hover_text_color}
                onChange={(val) => handleChange("add_to_cart_btn_text_hover_color", val)}
              />
            </div>
          </div>

          {/* Section 2: Buy Now Button */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <h2 className="text-lg font-semibold ">Buy Now Button</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bn-text">Button Text</Label>
              <Input
                id="bn-text"
                value={productDetailsSettings?.buy_now_btn_text || "Buy Now"}
                onChange={(e) => handleChange("buy_now_btn_text", e.target.value)}
                placeholder="Buy Now"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorPicker
                label="Background Color"
                value={productDetailsSettings?.buy_now_btn_color || productDetailsSettings?.button_bg_color}
                onChange={(val) => handleChange("buy_now_btn_color", val)}
              />
              <ColorPicker
                label="Text Color"
                value={productDetailsSettings?.buy_now_btn_text_color || productDetailsSettings?.button_text_color}
                onChange={(val) => handleChange("buy_now_btn_text_color", val)}
              />
              <ColorPicker
                label="Hover Background"
                value={productDetailsSettings?.buy_now_btn_hover_color || productDetailsSettings?.button_hover_bg_color}
                onChange={(val) => handleChange("buy_now_btn_hover_color", val)}
              />
              <ColorPicker
                label="Hover Text Color"
                value={productDetailsSettings?.buy_now_btn_text_hover_color || productDetailsSettings?.button_hover_text_color}
                onChange={(val) => handleChange("buy_now_btn_text_hover_color", val)}
              />
            </div>
          </div>

          {/* Section 3: WhatsApp & Review Toggles */}
          <div className="space-y-6 border-t pt-6 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold ">Review section Toggle</h2>
                <div className="flex items-center space-x-2 pt-1">
                  <Switch
                    id="review-mode"
                    checked={productDetailsSettings?.review_enabled ?? true}
                    onCheckedChange={handleReviewToggle}
                  />
                  <Label htmlFor="review-mode" className="cursor-pointer">
                    {productDetailsSettings?.review_enabled ? "On" : "Off"}
                  </Label>
                </div>
              </div>

              <div className="flex justify-between items-end gap-3 pt-4 border-t">
                <div className="">
                  <h2 className="text-lg font-semibold ">
                    WhatsApp Order Button
                  </h2>
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <Switch
                    id="whatsapp-toggle"
                    checked={productDetailsSettings?.enableWhatsApp ?? true}
                    onCheckedChange={handleToggle}
                  />
                  <Label htmlFor="whatsapp-toggle" className="cursor-pointer">
                    {productDetailsSettings?.enableWhatsApp ? "On" : "Off"}
                  </Label>
                </div>
              </div>

                <div className="w-full space-y-2">
                  <Label htmlFor="whatsapp-text">Button Text</Label>
                  <Input
                    id="whatsapp-text"
                    value={productDetailsSettings?.whats_app_btn_text || "হোয়াটসঅ্যাপ অর্ডার"}
                    onChange={(e) =>
                      handleChange("whats_app_btn_text", e.target.value)
                    }
                    placeholder="হোয়াটসঅ্যাপ অর্ডার"
                  />
                </div>

                <div className="w-full space-y-2">
                  <Label htmlFor="whatsapp-number" className="cursor-pointer">
                    WhatsApp Number
                  </Label>
                <Input
                  id="whatsapp-number"
                  type="tel"
                  value={productDetailsSettings?.whats_app_number || ""}
                  onChange={(e) =>
                    handleChange("whats_app_number", e.target.value)
                  }
                  placeholder="01234567890"
                  maxLength={11}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">WhatsApp Button Styling</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorPicker
                  label="Background Color"
                  value={productDetailsSettings?.whats_app_btn_bg_color}
                  onChange={(val) => handleChange("whats_app_btn_bg_color", val)}
                />
                <ColorPicker
                  label="Text Color"
                  value={productDetailsSettings?.whats_app_btn_text_color}
                  onChange={(val) =>
                    handleChange("whats_app_btn_text_color", val)
                  }
                />
                <ColorPicker
                  label="Hover Background"
                  value={productDetailsSettings?.whats_app_btn_hover_bg_color}
                  onChange={(val) =>
                    handleChange("whats_app_btn_hover_bg_color", val)
                  }
                />
                <ColorPicker
                  label="Hover Text Color"
                  value={productDetailsSettings?.whats_app_btn_hover_text_color}
                  onChange={(val) =>
                    handleChange("whats_app_btn_hover_text_color", val)
                  }
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// --- Reusable Color Picker Component ---
const ColorPicker = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) => {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex gap-2 items-center">
        <div className="h-9 w-9 rounded-md border shadow-sm shrink-0 overflow-hidden relative ring-offset-background transition-shadow focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer p-0 border-0"
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs uppercase bg-background"
          maxLength={7}
        />
      </div>
    </div>
  );
};
