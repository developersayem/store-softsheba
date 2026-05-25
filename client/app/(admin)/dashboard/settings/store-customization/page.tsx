"use client";

import CategoryToggleSettings from "@/components/dashboard/settings/store-customization/categoryToggle";
import CheckoutPageSettings from "@/components/dashboard/settings/store-customization/CheckoutPageSettings";
import ContactUsPageSettings from "@/components/dashboard/settings/store-customization/ContactUsPageSettings";
import ProductDetailsPageSettings from "@/components/dashboard/settings/store-customization/ProductDetailsPageSettings";

import UnderMaintenanceToggle from "@/components/dashboard/settings/store-customization/underMantainanceToggle";
import GlobalSettings from "@/components/dashboard/settings/store-settings/GlobalSettings";
import { useStoreSettings } from "@/contexts/store-settings-context";
import { Loader2 } from "lucide-react";

import { HasPermission } from "@/components/shared/has-permission";
import { AccessDenied } from "@/components/shared/access-denied";

const StoreCustomizationPage = () => {
  const { isUpdating } = useStoreSettings();
  return (
    <HasPermission 
      permission="settings:view" 
      fallback={<AccessDenied title="Store Customization Restricted" />}
    >
      <div>
        {isUpdating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="flex items-center gap-3 rounded-lg  px-6 py-4 shadow-lg">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Updating settings...</span>
            </div>
          </div>
        )}
        <h1 className="text-2xl/[32px] font-bold mb-4">Store Customization</h1>
        <UnderMaintenanceToggle />
        <GlobalSettings />
        <ProductDetailsPageSettings />
        <ContactUsPageSettings />
        <CheckoutPageSettings />
        <CategoryToggleSettings />
      </div>
    </HasPermission>
  );
};

export default StoreCustomizationPage;
