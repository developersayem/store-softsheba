"use client";

import { Type, Link as LinkIcon, FileText } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useStoreSettings } from "@/contexts/store-settings-context";

export default function FooterAboutSectionSettings() {
  const { aboutData, setAboutData } =
    useStoreSettings();
  // State matching JSON: pages.home.footer.about


  const handleChange = (key: string, value: string) => {
    setAboutData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="h-fit dark:bg-accent mt-4">
      <CardHeader>
        <CardTitle>Footer About Section Content </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 ">
        {/* Title Input */}
        <div className="space-y-2">
          <Label>Section Title</Label>
          <div className="relative">
            <Type className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              value={aboutData?.title}
              onChange={(e) => handleChange("title", e.target.value)}
              maxLength={40}
            />
          </div>
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Description</Label>
            <span className="text-xs text-muted-foreground">
              {aboutData?.description?.length} chars
            </span>
          </div>
          <div className="relative">
            <FileText className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea
              className="pl-9 min-h-[120px] resize-none"
              value={aboutData?.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Write a short summary about your brand..."
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Keep this short (under 160 characters) for better visual balance in
            the footer.
          </p>
        </div>

        <Separator />

        {/* Button Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Button Text</Label>
            <Input
              value={aboutData?.button_text}
              onChange={(e) => handleChange("button_text", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Button Link EndPoint</Label>
            <div className="relative">
              <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={aboutData?.button_link}
                onChange={(e) => handleChange("button_link", e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
