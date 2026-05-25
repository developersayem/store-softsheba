"use client";

import { Card, CardContent,} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStoreSettings } from "@/contexts/store-settings-context";
import { IContactUsPage } from "@/types/store.settings.type";
import { FileText, Mail, MapPin, Phone, Type } from "lucide-react";

export default function ContactUsPageSettings() {
  const { contactPageSettings, setContactPageSettings } = useStoreSettings();
  const handleChange = (key: keyof IContactUsPage, value: string) => {
    setContactPageSettings((prev) => ({ ...prev, [key]: value }));
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Contact Us Page Settings</h1>
        </div>
      </div>
      <Card className="dark:bg-accent">
        {/* Contact Info */}
        <CardContent className="grid gap-4 md:grid-cols-2">
          {/* Title Input */}
          <div className="space-y-2 md:col-span-2">
            <Label>Section Title</Label>
            <div className="relative">
              <Type className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={contactPageSettings?.title}
                onChange={(e) => handleChange("title", e.target.value)}
                maxLength={40}
              />
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex justify-between items-center">
              <Label>Description</Label>
              <span className="text-xs text-muted-foreground">
                {contactPageSettings?.description?.length} chars
              </span>
            </div>
            <div className="relative">
              <FileText className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                className="pl-9 min-h-[100px] resize-none"
                value={contactPageSettings?.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Write a short summary about your brand..."
              />
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Address</Label>
            <div className="relative">
              <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={contactPageSettings?.address}
                placeholder="write your business Location"
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={contactPageSettings?.phone}
                placeholder="+880....."
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Support Email</Label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={contactPageSettings?.email}
                placeholder="write your business email address"
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
