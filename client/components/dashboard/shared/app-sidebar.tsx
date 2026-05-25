"use client";

import * as React from "react";
import { Icon } from "@iconify/react";

import { IMainNav, NavMain } from "@/components/dashboard/shared/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { NavUser } from "./nav-user";
import { FaFacebook, FaGoogle } from "react-icons/fa6";
import { IoAnalytics } from "react-icons/io5";
import { MessageCircleQuestion } from "lucide-react";
import { useStoreSettings } from "@/contexts/store-settings-context";
import Image from "next/image";
import { getStorefrontUrl } from "@/utils/url-utils";

const mainRoute = "/dashboard";

const data: { navMain: IMainNav[] } = {
  navMain: [
    {
      name: "platform",
      items: [
        {
          title: "Dashboard",
          url: `${mainRoute}`,
          icon: <Icon icon="humbleicons:dashboard" width="72" height="72" />,
          isActive: false,
          items: [],
        },
        {
          title: "Notifications",
          url: `${mainRoute}/notifications`,
          icon: <Icon icon="proicons:bell" width="72" height="72" />,
          isActive: false,
          permission: "notifications:view",
          items: [],
        },
        {
          title: "Orders",
          url: `${mainRoute}/order`,
          icon: <Icon icon="proicons:layers" width="72" height="72" />,
          isActive: false,
          permission: "orders:view",
          items: [],
        },
        {
          title: "Products Catalog",
          url: "#",
          icon: (
            <Icon icon="clarity:blocks-group-solid" width="72" height="72" />
          ),
          isActive: true,
          permission: "products:view",
          items: [
            {
              title: "Products",
              url: `${mainRoute}/products`,
            },
            {
              title: "Categories",
              url: `${mainRoute}/products/categories`,
              items: [
                {
                  title: "Featured",
                  url: `${mainRoute}/products/categories/featured`,
                },
              ],
            },
            {
              title: "Collections",
              url: `${mainRoute}/products/collections`,
            },
            {
              title: "Brands",
              url: `${mainRoute}/products/brands`,
            },
            {
              title: "Attributes",
              url: `${mainRoute}/products/attributes`,
            },
            {
              title: "Coupon",
              url: `${mainRoute}/products/coupon`,
            },
          ],
        },
        {
          title: "Reviews",
          url: `${mainRoute}/reviews`,
          icon: <Icon icon="iconoir:three-stars" width="72" height="72" />,
          isActive: false,
          permission: "reviews:view",
          items: [],
        },
        {
          title: "CRM",
          url: `${mainRoute}/customers`,
          icon: <Icon icon="mage:contact-book" width="72" height="72" />,
          isActive: false,
          permission: "customers:view",
          items: [],
        },
        {
          title: "Staff Management",
          url: `${mainRoute}/staff`,
          icon: <Icon icon="mdi:account-group" width="72" height="72" />,
          isActive: false,
          permission: "staff:manage",
          items: [],
        },
        {
          title: "Support Mails",
          url: `${mainRoute}/support`,
          icon: <MessageCircleQuestion width="72" height="72" />,
          isActive: false,
          permission: "support:view",
          items: [],
        },
      ],
    },
    {
      name: "courier",
      items: [
        {
          title: "Shipping Rules",
          url: `${mainRoute}/settings/courier/shipping-rules`,
          icon: <Icon icon="la:shipping-fast" width="72" height="72" />,
          isActive: false,
          permission: "courier:view",
          items: [],
        },
        {
          title: "API Integration",
          url: `${mainRoute}/settings/courier/api-integration`,
          icon: <Icon icon="mdi:api" width="72" height="72" />,
          isActive: false,
          permission: "courier:view",
          items: [],
        },
      ],
    },
    {
      name: "marketing",
      items: [
        {
          title: "Facebook",
          icon: <FaFacebook />,
          url: `${mainRoute}/marketing/facebook`,
          permission: "marketing:view",
        },
        {
          title: "Google",
          icon: <FaGoogle />,
          url: `${mainRoute}/marketing/google`,
          permission: "marketing:view",
        },
        {
          title: "SEO",
          icon: <IoAnalytics />,
          url: `${mainRoute}/marketing/seo`,
          permission: "marketing:view",
        },
        {
          title: "Landing Pages",
          icon: <Icon icon="mdi:web" width="72" height="72" />,
          url: `${mainRoute}/marketing/landing-pages`,
          permission: "marketing:view",
          badge: { type: "new" },
        },
      ],
    },
    {
      name: "settings",
      items: [
        {
          title: "Settings",
          url: "#",
          icon: <Icon icon="mingcute:settings-7-line" width="72" height="72" />,
          isActive: false,
          permission: "settings:view",
          items: [
            {
              title: "Account Settings",
              url: `${mainRoute}/account/profile`,
            },
            {
              title: "Store Customization",
              url: `${mainRoute}/settings/store-customization`,
            },
            {
              title: "Floating Contact",
              url: `${mainRoute}/settings/floating-contact`,
            },
            {
              title: "Tawk.to Integration",
              url: `${mainRoute}/settings/tawk-to`,
            },
            {
              title: "Legal Pages",
              url: `${mainRoute}/settings/legal-pages`,
            },
            {
              title: "FAQ Page",
              url: `${mainRoute}/settings/faq-page`,
            },
          ],
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { storeSettingsData, websiteLogoPreview } = useStoreSettings();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                href={(() => {
                  const store = storeSettingsData[0]?.storeId;
                  const slug =
                    typeof store === "object" ? store?.slug : undefined;
                  return getStorefrontUrl(slug);
                })()}
                target="_blank"
              >
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm leading-tight">
                  {storeSettingsData.length > 0 ? (
                    <div className="flex items-center gap-2">
                      {websiteLogoPreview ||
                      storeSettingsData[0]?.header?.site_logo ? (
                        <div className="relative h-10 w-40">
                          <Image
                            src={
                              (websiteLogoPreview ||
                                storeSettingsData[0]?.header
                                  ?.site_logo) as string
                            }
                            alt={storeSettingsData[0]?.site_name || "ShopXet"}
                            fill
                            className="object-contain object-left"
                            priority
                          />
                        </div>
                      ) : (
                        <span className="truncate font-bold font-sans text-2xl leading-none uppercase">
                          {storeSettingsData[0]?.site_name || "ShopXet"}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="truncate font-bold font-sans text-2xl leading-none">
                      ShopXet
                    </span>
                  )}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain NavData={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
