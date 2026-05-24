import { ReactNode } from "react";

// Links will be used for defining navbar links
export type Links = {
  icon?: ReactNode;
  href?: string;
  label: string;
  desc?: string;
  extraLabel?: string;
  dropDown?: ReactNode;
  subMenuLinks?: SubMenu[];
  image?: string;
  target?: string;
};

export type NavLinksProps = {
  desktopLinks: Links[];
  mobileLinks: Links[];
  isMobileOpen: boolean;
};

export type SubMenu = {
  icon?: ReactNode;
  href?: string;
  label: string;
  dropDown?: ReactNode;
  subSubMenu?: SubMenu[];
};

export type DetailsNavProps = {
  onHover: string;
}