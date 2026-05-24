"use client"

import * as React from "react"
import {
  Settings,
  ShoppingCart,
  Users,
  Package,
  Star,
  Mail,
  Megaphone,
  Briefcase,
  LayoutDashboard
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin",
    email: "admin@softsheba.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: ShoppingCart,
    },
    {
      title: "Products Catalog",
      url: "/dashboard/products",
      icon: Package,
    },
    {
      title: "Reviews",
      url: "/dashboard/reviews",
      icon: Star,
    },
    {
      title: "CRM",
      url: "/dashboard/crm",
      icon: Users,
    },
    {
      title: "Support Mails",
      url: "/dashboard/support",
      icon: Mail,
    },
    {
      title: "Staff Management",
      url: "/dashboard/staff",
      icon: Briefcase,
    },
    {
      title: "Marketing",
      url: "/dashboard/marketing",
      icon: Megaphone,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="#" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <LayoutDashboard className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-lg">Softsheba</span>
                <span className="truncate text-xs text-zinc-400">Admin Panel</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={item.isActive} render={<a href={item.url} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* User profile could go here */}
      </SidebarFooter>
    </Sidebar>
  )
}
