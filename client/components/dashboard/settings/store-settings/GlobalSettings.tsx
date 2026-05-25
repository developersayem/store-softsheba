"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  Phone,
  MapPin,
  Mail,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Instagram,
  Type,
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import NavbarSettings from "./NavbarSettings";
import FooterTopSettings from "./FooterTopSettings";
import FooterAboutSectionSettings from "./FooterAboutSectionSettings";
import FooterSectionsSettings from "./FooterSectionsSettings";
import { useStoreSettings } from "@/contexts/store-settings-context";
import HomepageSettings from "../store-customization/HompageSettings";

export default function GlobalSettings() {
  const {
    storeSettingsData,
    color,
    setColor,
    brandName,
    setBrandName,
    websiteLogo,
    setWebsiteLogo,
    websiteLogoPreview,
    setWebsiteLogoPreview,
    cartLogo,
    setCartLogo,
    cartLogoPreview,
    address,
    setAddress,
    phone,
    setPhone,
    conatctTitle,
    setContactTitle,
    email,
    setEmail,
    setCartLogoPreview,
    searchPlaceholder,
    setSearchPlaceholder,
    socials,
    setSocials,
    colorFooterBg,
    setColorFooterBg,
    colorNavItemsButtonActive,
    setColorNavItemsButtonActive,
    colorCategoriesDropdownBg,
    setColorCategoriesDropdownBg,
    favIcon,
    setFavIcon,
    favIconPreview,
    setFavIconPreview,
  } = useStoreSettings();

  //console.log(storeSettingsData);

  //const [font, setFont] = useState<string>("inter");

  // Handle Image Preview
  useEffect(() => {
    if (!websiteLogo || !storeSettingsData) return;
    const previewUrl = URL.createObjectURL(websiteLogo);
    setWebsiteLogoPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [websiteLogo, setWebsiteLogoPreview, storeSettingsData]);

  // Handle fav icon Preview
  useEffect(() => {
    if (!favIcon || !storeSettingsData) return;
    const previewUrl = URL.createObjectURL(favIcon);
    setFavIconPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [favIcon, setFavIconPreview, storeSettingsData]);

  useEffect(() => {
    if (!cartLogo || !storeSettingsData) return;
    const previewUrl = URL.createObjectURL(cartLogo);
    setCartLogoPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [cartLogo, setCartLogoPreview, storeSettingsData]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    setWebsiteLogo(file);
  };
  const handleFavIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    setFavIcon(file);
  };

  const handleCartLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    setCartLogo(file);
  };

  const removeWebsiteLogo = () => {
    setWebsiteLogo(null);
    setWebsiteLogoPreview(null);
  };
  const removeFavIcon = () => {
    setFavIcon(null);
    setFavIconPreview(null);
  };

  const removeCartLogo = () => {
    setCartLogo(null);
    setCartLogoPreview(null);
  };
  //console.log(storeSettingsData);
  return (
    <div>
      <div className="bg-white dark:bg-accent p-5 rounded-xl space-y-3 ">
        {/* theme color */}
        <div className="flex items-center gap-3">
          <h2 className="w-21.25 shrink-0 font-medium">Theme Color</h2>
          <div className="w-full flex items-center">
            <Input
              placeholder="Type Hex Value or Select Theme Color"
              onChange={(e) => setColor(e.target.value)}
              value={color || ""}
            />
            <Input
              type="color"
              value={color || ""}
              onChange={(e) => setColor(e.target.value)}
              className="w-16 h-10 p-0 border-0"
            />
          </div>
        </div>
        {/* font style */}
        <div className="flex items-center gap-3">
          <h2 className="w-21.25 shrink-0 font-medium">Font Style</h2>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Font" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Font</SelectLabel>
                <SelectItem value="apple">Inter</SelectItem>
                <SelectItem value="banana">Roboto</SelectItem>
                <SelectItem value="blueberry">Poppins</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* website logo */}
      <div className="bg-white dark:bg-accent p-5 rounded-xl space-y-3 mt-4">
        <div className="flex items-center max-lg:flex-wrap gap-3">
          <h2 className="shrink-0 font-medium">Website Logo (200 x 70)</h2>
          <div className="w-full p-2">
            <label className="w-full h-40 flex flex-col justify-center items-center border-2 border-dashed cursor-pointer rounded-xl p-4">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
              <Upload />
              <p className="text-sm/[36px] font-medium text-center">
                click or drag & drop your Image Here
              </p>
            </label>
          </div>
          <div className="w-full border h-40 flex items-center justify-center p-4 rounded-xl">
            {websiteLogoPreview ? (
              <div className="relative  p-3">
                {/* Remove Button */}
                <button
                  onClick={removeWebsiteLogo}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                >
                  <X size={14} />
                </button>
                <Image
                  src={websiteLogoPreview}
                  alt="Website logo preview"
                  width={200}
                  height={70}
                  className="object-contain"
                />
              </div>
            ) : (
              <div>preview</div>
            )}
          </div>
        </div>
      </div>
      {/* fav icon */}
      <div className="bg-white dark:bg-accent p-5 rounded-xl space-y-3 mt-4">
        <div className="flex items-center max-lg:flex-wrap gap-3">
          <h2 className="shrink-0 font-medium w-37.5">Fav Icon (512 x 512)</h2>
          <div className="w-full p-2">
            <label className="w-full h-40 flex flex-col justify-center items-center border-2 border-dashed cursor-pointer rounded-xl p-4">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFavIconChange}
              />
              <Upload />
              <p className="text-sm/[36px] font-medium text-center">
                click or drag & drop your Image Here
              </p>
            </label>
          </div>
          <div className="w-full border h-40 flex items-center justify-center p-4 rounded-xl">
            {favIconPreview ? (
              <div className="relative  p-3">
                {/* Remove Button */}
                <button
                  onClick={removeFavIcon}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                >
                  <X size={14} />
                </button>
                <Image
                  src={favIconPreview}
                  alt="fav icon logo preview"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
            ) : (
              <div>preview</div>
            )}
          </div>
        </div>
      </div>
      {/* brand name */}
      <div className="mt-4 bg-white dark:bg-accent p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <h2 className="w-21.25 shrink-0 font-medium">Brand Name</h2>
          <Input
            placeholder="Enter Brand Name"
            onChange={(e) => setBrandName(e.target.value)}
            value={brandName || ""}
          />
        </div>
      </div>
      <Separator className="my-4" />
      {/* header */}
      <Card className="dark:bg-accent">
        <CardHeader>
          <CardTitle>Header Content</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* search bar Text */}
          <div className="flex space-x-2">
            <Label>Search Bar Placeholder</Label>
            <Input
              value={searchPlaceholder || ""}
              onChange={(e) => setSearchPlaceholder(e.target.value)}
            />
          </div>
          {/* Nav item active and hover color */}
          <div className="flex items-center gap-3">
            <h2 className="w-30 shrink-0 font-medium">Nav Item Active Color</h2>
            <div className="w-full flex items-center">
              <Input
                placeholder="Type Hex Value or Select Theme Color"
                onChange={(e) => setColorNavItemsButtonActive(e.target.value)}
                value={colorNavItemsButtonActive}
              />
              <Input
                type="color"
                value={colorNavItemsButtonActive}
                onChange={(e) => setColorNavItemsButtonActive(e.target.value)}
                className="w-16 h-10 p-0 border-0"
              />
            </div>
          </div>
          {/* Categories bg color */}
          <div className="flex items-center gap-3">
            <h2 className="w-30 shrink-0 font-medium">Categories Bg Color</h2>
            <div className="w-full flex items-center">
              <Input
                placeholder="Type Hex Value or Select Theme Color"
                onChange={(e) => setColorCategoriesDropdownBg(e.target.value)}
                value={colorCategoriesDropdownBg}
              />
              <Input
                type="color"
                value={colorCategoriesDropdownBg}
                onChange={(e) => setColorCategoriesDropdownBg(e.target.value)}
                className="w-16 h-10 p-0 border-0"
              />
            </div>
          </div>
          <div className="flex items-center max-lg:flex-wrap gap-3">
            <h2 className="shrink-0 font-medium">Cart Icon (70 x 70)</h2>
            <div className="w-full p-2">
              <label className="w-full h-40 flex flex-col justify-center items-center border-2 border-dashed cursor-pointer rounded-xl p-4">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCartLogoChange}
                />
                <Upload />
                <p className="text-sm/[36px] font-medium text-center">
                  click or drag & drop your Image Here
                </p>
              </label>
            </div>
            <div className="w-full border h-40 flex items-center justify-center p-4 rounded-xl">
              {cartLogoPreview ? (
                <div className="relative  p-3">
                  {/* Remove Button */}
                  <button
                    onClick={removeCartLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                  >
                    <X size={14} />
                  </button>
                  <Image
                    src={cartLogoPreview}
                    alt="Cart logo preview"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
              ) : (
                <div>preview</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-4" />
      {/* navbar */}
      {/* <Card className="dark:bg-accent">
        <CardHeader>
          <CardTitle>Navbar Content</CardTitle>
        </CardHeader>

        <CardContent>
          <NavbarSettings />
        </CardContent>
      </Card> */}
      {/* home page settings  */}
      <HomepageSettings />
      {/* footer */}
      <Separator className="my-4" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Footer content
          </h2>
          <p className="text-muted-foreground">
            Manage your customizable footer.
          </p>
        </div>
      </div>
      <div className="bg-white dark:bg-accent p-5 rounded-xl space-y-3 mt-4">
        {/* footer bg color */}
        <div className="flex items-center gap-3">
          <h2 className="w-30 shrink-0 font-medium">Footer Background Color</h2>
          <div className="w-full flex items-center">
            <Input
              placeholder="Type Hex Value or Select Theme Color"
              onChange={(e) => setColorFooterBg(e.target.value)}
              value={colorFooterBg}
            />
            <Input
              type="color"
              value={colorFooterBg}
              onChange={(e) => setColorFooterBg(e.target.value)}
              className="w-16 h-10 p-0 border-0"
            />
          </div>
        </div>
      </div>
      {/* footer top */}
      <FooterTopSettings />
      {/* footer about section */}
      <FooterAboutSectionSettings />
      {/* footer sections */}
      <FooterSectionsSettings />
      {/* contact info + Social Media Links */}
      <div className=" space-y-6 mt-4">
        <Card className="dark:bg-accent">
          <CardHeader>
            <CardTitle>Footer Contact Info</CardTitle>
          </CardHeader>
          {/* Contact Info */}
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Section Title</Label>
              <div className="relative">
                <Type className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={conatctTitle}
                  onChange={(e) => setContactTitle(e.target.value)}
                  maxLength={40}
                />
              </div>
            </div>
            <div className="space-y-2 ">
              <Label>Address</Label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={address}
                  placeholder="write your business Location"
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={phone}
                  placeholder="+880....."
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Support Email</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={email}
                  placeholder="write your business email address"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card className="dark:bg-accent">
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>Link your social profiles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Facebook size={14} /> Facebook
                </Label>
                <Input
                  value={socials.facebook}
                  onChange={(e) =>
                    setSocials({ ...socials, facebook: e.target.value })
                  }
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Twitter size={14} /> X (Twitter)
                </Label>
                <Input
                  value={socials.x}
                  onChange={(e) =>
                    setSocials({ ...socials, x: e.target.value })
                  }
                  placeholder="https://x.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Instagram size={14} /> Instagram
                </Label>
                <Input
                  value={socials.instagram}
                  onChange={(e) =>
                    setSocials({ ...socials, instagram: e.target.value })
                  }
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Linkedin size={14} /> LinkedIn
                </Label>
                <Input
                  value={socials.linkedin}
                  onChange={(e) =>
                    setSocials({ ...socials, linkedin: e.target.value })
                  }
                  placeholder="https://linkedin.com/..."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2">
                  <Youtube size={14} /> YouTube
                </Label>
                <Input
                  value={socials.youtube}
                  onChange={(e) =>
                    setSocials({ ...socials, youtube: e.target.value })
                  }
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
