"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useStoreSettings } from "@/contexts/store-settings-context";

export default function CheckoutPageSettings() {
  const { checkoutPageSettings, setCheckoutPageSettings } = useStoreSettings();
  return (
    <div className="space-y-6 ">
      <div>
        <h1 className="text-2xl font-bold mt-6">Checkout Page Settings</h1>
      </div>
      <Card className="bg-accent">
        <CardContent className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Add Coupon Field</h1>
          <div className="flex items-center space-x-2 pt-1">
            <Switch
              id="coupon-mode"
              checked={checkoutPageSettings?.coupon}
              onCheckedChange={(checked) =>
                setCheckoutPageSettings((prev: typeof checkoutPageSettings) => ({
                  ...prev,
                  coupon: checked,
                }))
              }
            />
            <Label htmlFor="coupon-mode" className="cursor-pointer">
             {checkoutPageSettings?.coupon ? "On" : "Off"}
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
