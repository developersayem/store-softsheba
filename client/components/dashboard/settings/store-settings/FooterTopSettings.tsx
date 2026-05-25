"use client";

import { Upload, X, Type, Phone } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useStoreSettings } from "@/contexts/store-settings-context";

export default function FooterTopSettings() {
  const {
    data,
    setData,
    setFooterLeftIcon,
    setFooterRightIcon,
  } = useStoreSettings();

  // Handle Text Changes
  const handleChange = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  // Handle File Upload (Generates a preview URL)
  const handleUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (SVG, PNG, JPG)");
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      if (key === "left_icon") {
        setFooterLeftIcon(file);
      } else if (key === "right_icon") {
        setFooterRightIcon(file);
      }
      setData((prev) => ({ ...prev, [key]: previewUrl }));
      toast.success("Icon uploaded");
    }
  };

  // Remove Icon
  const handleRemoveIcon = (key: string) => {
    if (key === "left_icon") {
      setFooterLeftIcon(null);
    } else if (key === "right_icon") {
      setFooterRightIcon(null);
    }
    setData((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <Card className="w-full mx-auto mt-4 dark:bg-accent">
      <CardHeader>
        <CardTitle>Footer Top </CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* --- LEFT SECTION --- */}
          <div className="space-y-4 border rounded-xl p-5 bg-card/50 relative">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">Left Side</h3>
            </div>

            <Separator className="my-4" />

            <div className="flex gap-4">
              {/* Icon Uploader */}
              <div className="shrink-0 space-y-2">
                <Label>Icon</Label>
                <IconUploader
                  imageSrc={data?.left_icon || ""}
                  onUpload={(e) => handleUpload(e, "left_icon")}
                  onRemove={() => handleRemoveIcon("left_icon")}
                />
              </div>

              {/* Text Fields */}
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label>Title Text</Label>
                  <div className="relative">
                    <Type className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={data?.left_title}
                      placeholder="left text"
                      onChange={(e) =>
                        handleChange("left_title", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subtitle Text</Label>
                  <Input
                    value={data?.left_subtitle}
                    placeholder="left subtitle text"
                    onChange={(e) =>
                      handleChange("left_subtitle", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT SECTION --- */}
          <div className="space-y-4 border rounded-xl p-5 bg-card/50">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">Right Side</h3>
            </div>

            <Separator className="my-4" />

            <div className="flex gap-4">
              {/* Icon Uploader */}
              <div className="shrink-0 space-y-2">
                <Label>Icon</Label>
                <IconUploader
                  imageSrc={data?.right_icon || ""}
                  onUpload={(e) => handleUpload(e, "right_icon")}
                  onRemove={() => handleRemoveIcon("right_icon")}
                />
              </div>

              {/* Text Fields */}
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label>Label Text</Label>
                  <div className="relative">
                    <Type className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={data?.right_text}
                      placeholder="right text"
                      onChange={(e) =>
                        handleChange("right_text", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={data?.right_phone}
                      placeholder="right phone"
                      onChange={(e) =>
                        handleChange("right_phone", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- HELPER COMPONENT: ICON UPLOADER ---
function IconUploader({
  imageSrc,
  onUpload,
  onRemove,
}: {
  imageSrc: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="group relative w-24 h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center bg-accent/20 hover:bg-accent/40 transition-colors overflow-hidden">
      {imageSrc ? (
        <>
          <Image
            fill
            src={imageSrc}
            alt="Icon"
            className="w-10 h-10 object-contain z-10"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
            <button
              onClick={onRemove}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-sm"
            >
              <X size={14} />
            </button>
          </div>
        </>
      ) : (
        <>
          <Upload className="w-6 h-6 text-muted-foreground mb-1" />
          <span className="text-[10px] text-muted-foreground">Upload</span>
        </>
      )}

      {/* Hidden File Input covering the area */}
      {!imageSrc && (
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
          onChange={onUpload}
        />
      )}
    </div>
  );
}
