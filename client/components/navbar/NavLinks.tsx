import { Links } from "@/types/navbar/navbar";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";

type NavLinksProps = {
  desktopLinks: Links[];
  mobileLinks: Links[];
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void; // 🔥 add setter from parent
};

const NavLinks = ({
  desktopLinks,
  mobileLinks,
  isMobileOpen,
  setIsMobileOpen,
}: NavLinksProps) => {
  return (
    <div className="shadow-lg lg:shadow-none">
      {/* Desktop Links */}
      <DesktopNav desktopLinks={desktopLinks} />

      {/* Mobile Links */}
      <div className="lg:hidden mx-auto">
        <MobileNav
          mobileLinks={mobileLinks}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
      </div>
    </div>
  );
};

export default NavLinks;
