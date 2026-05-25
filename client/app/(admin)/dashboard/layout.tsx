"use client";

import { AppSidebar } from "@/components/dashboard/shared/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { generateBreadcrumbs } from "@/utils/breadcrumb";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Button } from "@/components/ui/button";
import { Upload, Eye } from "lucide-react";
import { getStorefrontUrl } from "@/utils/url-utils";
import { useProductForm } from "@/contexts/product-form-context";
import { useStoreSettings } from "@/contexts/store-settings-context";
import Link from "next/link";
import NotificationsPreview from "@/components/dashboard/notifications/NotificationsPreview";
import { LicenseStatus } from "@/components/dashboard/shared/LicenseStatus";
import { PaymentPendingPopup } from "@/components/shared/PaymentPendingPopup";
import { useLicense } from "@/hooks/use-license";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumbs = generateBreadcrumbs(pathname);
  const { handleSubmit, handleUpdate, loading } = useProductForm();
  const { handleStoreSettings, isUpdating, storeSettingsData } =
    useStoreSettings();
  const { isBlocked, isLoading } = useLicense();

  useEffect(() => {
    if (!isLoading && isBlocked) {
      router.push("/license-expired");
    }
  }, [isBlocked, isLoading, router]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="theme"
    >
      <SidebarProvider>
        <PaymentPendingPopup />
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 flex justify-between z-50 bg-neutral-50 dark:bg-[#0A0A0A] h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.href}>
                      <BreadcrumbItem>
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={crumb.href}>
                            {crumb.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator />
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-4 px-4">
              <LicenseStatus />
              <NotificationsPreview />
              {pathname === "/dashboard/products/add" && (
                <Button onClick={handleSubmit} type="submit" loading={loading}>
                  <Upload /> Publish Product
                </Button>
              )}
              {pathname.startsWith("/dashboard/products/update") && (
                <Button onClick={handleUpdate} type="submit" loading={loading}>
                  <Upload /> Update Product
                </Button>
              )}
              {/* store settings update */}
              {(pathname === "/dashboard/settings/store-settings" ||
                pathname === "/dashboard/settings/tawk-to" ||
                pathname === "/dashboard/settings/store-customization" ||
                pathname === "/dashboard/settings/floating-contact" ||
                pathname === "/dashboard/settings/faq-page" ||
                pathname === "/dashboard/settings/legal-pages") && (
                <Button onClick={() => handleStoreSettings()} loading={isUpdating}>
                  Update <Upload />
                </Button>
              )}
              <Link
                href={(() => {
                  const store = storeSettingsData[0]?.storeId;
                  const slug =
                    typeof store === "object" ? store?.slug : undefined;
                  return getStorefrontUrl(slug);
                })()}
                target="_blank"
                className="hover:bg-accent h-9 w-9 flex items-center justify-center border border-neutral-200 dark:border-neutral-500 rounded-md transition-all duration-200"
              >
                <Eye className="h-[1.2rem] w-[1.2rem]" />
              </Link>

              <ThemeToggle />
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-neutral-50 dark:dark:bg-[#0A0A0A] ">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
