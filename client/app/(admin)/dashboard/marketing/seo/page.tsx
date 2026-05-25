"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { ISeo } from "@/types/marketing.type";
import { HasPermission } from "@/components/shared/has-permission";

export default function SeoTechnicalAndOnPage() {
  const [seo, setSeo] = useState<ISeo>({
    homePageTitle: "",
    metaDescription: "",
    metaKeywords: "",
    domain: "",
  });

  const [initialSeo, setInitialSeo] = useState<ISeo | null>(null);

  const { data, mutate } = useSWR("/marketing", fetcher);

  useEffect(() => {
    if (data?.data?.[0]?.seo) {
      const seoData: ISeo = data.data[0].seo;
      setSeo(seoData);
      setInitialSeo(seoData);
    }
  }, [data]);

  const hasChanges = useMemo(() => {
    if (!initialSeo) return true;

    return Object.keys(initialSeo).some(
      (key) => seo[key as keyof ISeo] !== initialSeo[key as keyof ISeo],
    );
  }, [seo, initialSeo]);

  // ================= Handlers =================
  const handleSeoChange = (field: keyof ISeo, value: string) => {
    setSeo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSeoSave = async () => {
    try {
      const res = await api.patch("/marketing", { seo: seo });
      mutate();

      if (res.status === 200) {
        toast.success("SEO settings updated successfully!");
      } else {
        toast.error("Failed to update SEO settings.");
      }
    } catch (err) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 403) {
        toast.error("You don't have permission to update SEO settings.");
      } else {
        toast.error("Failed to update SEO settings.");
      }
      mutate();
    }
  };

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>SEO Settings</CardTitle>
        <CardDescription>
          Manage website SEO, meta information, and technical SEO files
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Website SEO Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Website SEO Settings
          </h3>

          <div className="space-y-2">
            <Label htmlFor="homePageTitle">Home Page Title</Label>
            <Input
              id="homePageTitle"
              placeholder="Example: Welcome to MySite"
              value={seo.homePageTitle}
              onChange={(e) => handleSeoChange("homePageTitle", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              placeholder="Example: Welcome to MySite – your trusted platform for..."
              rows={3}
              value={seo.metaDescription}
              onChange={(e) =>
                handleSeoChange("metaDescription", e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaKeywords">Meta Keywords</Label>
            <Textarea
              id="metaKeywords"
              placeholder="Example: mysite, ecommerce, seo, online store"
              rows={3}
              value={seo.metaKeywords}
              onChange={(e) => handleSeoChange("metaKeywords", e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* One Page / Technical SEO */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">
            One Page & Technical SEO
          </h3>

          <div className="space-y-2">
            <Label htmlFor="domain">
              Base Url / Domain{" "}
              <span className="text-muted-foreground">(Mendatory)</span>{" "}
            </Label>
            <Input
              id="domain"
              placeholder="https://example.com/"
              value={seo?.domain}
              onChange={(e) => handleSeoChange("domain", e.target.value)}
            />
          </div>
        </div>

        <Separator />

        <HasPermission permission="marketing:manage">
          <div className="flex justify-end gap-3">
            <Button onClick={handleSeoSave} disabled={!hasChanges}>
              Update
            </Button>
          </div>
        </HasPermission>
      </CardContent>
    </Card>
  );
}
