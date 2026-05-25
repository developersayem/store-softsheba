"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, type LucideIcon } from "lucide-react";
import React, { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export type NavBadgeType = "coming-soon" | "new" | "beta" | "custom";

export interface INavBadge {
  type: NavBadgeType;
  label?: string; // override default label
}

export interface INavSubItem {
  title: string;
  url: string;
  permission?: string;
  badge?: INavBadge;
  items?: INavSubItem[];
}

export interface INavItem {
  title: string;
  url: string;
  icon: ReactNode | LucideIcon;
  isActive?: boolean;
  permission?: string;
  badge?: INavBadge;
  items?: INavSubItem[];
}

export interface IMainNav {
  name: string;
  items: INavItem[];
}

// ── Badge config ────────────────────────────────────────────────
const BADGE_CONFIG: Record<
  NavBadgeType,
  { defaultLabel: string; className: string }
> = {
  "coming-soon": {
    defaultLabel: "Soon",
    className: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
  },
  new: {
    defaultLabel: "New",
    className: "bg-green-500/15 text-green-400 border border-green-500/30",
  },
  beta: {
    defaultLabel: "Beta",
    className: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  },
  custom: {
    defaultLabel: "·",
    className: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  },
};

function NavBadgePill({ badge }: { badge: INavBadge }) {
  const config = BADGE_CONFIG[badge.type];
  return (
    <span
      className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none ${config.className}`}
    >
      {badge.label || config.defaultLabel}
    </span>
  );
}
// ────────────────────────────────────────────────────────────────

interface NavMainProps {
  NavData: IMainNav[];
}

export function NavMain({ NavData }: NavMainProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    if (!user) return false;
    if (user.role === "owner") return true;
    return user.permissions?.includes(permission);
  };

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  // Open menus based on isActive or current pathname
  useEffect(() => {
    const initialOpen: Record<string, boolean> = {};
    NavData.forEach((group) => {
      group.items.forEach((item) => {
        if (item.isActive || item.items?.some((sub) => sub.url === pathname)) {
          initialOpen[item.title] = true;
        }
      });
    });
    setOpenMenus(initialOpen);
  }, [NavData, pathname]);

  if (!mounted) return null;

  return (
    <>
      {NavData.map((group) => {
        // Filter items in the group based on permissions
        const permittedItems = group.items.filter((item) => hasPermission(item.permission));
        
        // If no items are permitted in this group, don't render the group at all
        if (permittedItems.length === 0) return null;

        return (
          <SidebarGroup key={group.name}>
            {group.name === "platform" && <hr className="my-2" />}
            {group.name !== "platform" && (
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                {group.name}
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {permittedItems.map((item) => {
                const isParentActive = pathname === item.url;
                const isSubItemActive = item.items?.some(
                  (sub) => pathname === sub.url,
                );
                const isOpen =
                  openMenus[item.title] ?? (isParentActive || isSubItemActive);

                return (
                  <Collapsible key={item.title} asChild open={isOpen}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        onClick={() => {
                          if (item.items?.length) toggleMenu(item.title);
                        }}
                      >
                        <Link
                          href={item.url}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-all w-full ${
                            isParentActive
                              ? "bg-muted text-primary font-medium"
                              : "hover:bg-accent hover:text-primary"
                          }`}
                        >
                          <div className="h-4 w-4 flex items-center justify-center">
                            {React.isValidElement(item.icon)
                              ? item.icon
                              : typeof item.icon === "function"
                                ? React.createElement(item.icon, {
                                    className: "h-4 w-4",
                                  })
                                : null}
                          </div>

                          <span className="flex-1">{item.title}</span>
                          {item.badge && <NavBadgePill badge={item.badge} />}
                        </Link>
                      </SidebarMenuButton>

                      {item.items?.length ? (
                        <>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuAction
                              className={`transition-transform ${
                                isOpen ? "rotate-90" : ""
                              }`}
                              aria-label="Toggle Submenu"
                            >
                              <ChevronRight />
                            </SidebarMenuAction>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <SidebarMenuSub className="ml-2 mt-1 space-y-0.5">
                              {item.items
                                ?.filter((sub) => hasPermission(sub.permission))
                                .map((subItem) => {
                                  const isSubActive = pathname === subItem.url;
                                  return (
                                    <SidebarMenuSubItem key={subItem.title}>
                                      <SidebarMenuSubButton asChild>
                                        <Link
                                          href={subItem.url}
                                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
                                            isSubActive
                                              ? "bg-muted text-primary font-medium"
                                              : "text-zinc-400 hover:bg-accent hover:text-primary"
                                          }`}
                                        >
                                          <span className="flex-1">{subItem.title}</span>
                                          {subItem.badge && <NavBadgePill badge={subItem.badge} />}
                                        </Link>
                                      </SidebarMenuSubButton>

                                      {subItem?.items?.map((nestedItem) => {
                                        const isSubActive =
                                          pathname === nestedItem.url;
                                        return (
                                          <SidebarMenuSub
                                            className="ml-2 mt-1 space-y-0.5"
                                            key={nestedItem.title}
                                          >
                                            <SidebarMenuSubItem
                                              key={nestedItem.title}
                                            >
                                              <SidebarMenuSubButton asChild>
                                                <Link
                                                  href={nestedItem.url}
                                                  className={`block px-3 py-1.5 rounded-md text-sm transition-all ${
                                                    isSubActive
                                                      ? "bg-muted text-primary font-medium"
                                                      : "text-zinc-400 hover:bg-accent hover:text-primary"
                                                  }`}
                                                >
                                                  {nestedItem.title}
                                                </Link>
                                              </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                          </SidebarMenuSub>
                                        );
                                      })}
                                    </SidebarMenuSubItem>
                                  );
                                })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </>
                      ) : null}
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        );
      })}
    </>
  );
}
