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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { IGoogle } from "@/types/marketing.type";
import { HasPermission } from "@/components/shared/has-permission";

export default function GoogleTagManagerAndAnalytics() {
  const [google, setGoogle] = useState<IGoogle>({
    measurementId: "",
    tagId: "",
    merchant: "",
    testEventCode: "",
    analyticsIntegration: "",
  });

  const [initialGoogle, setInitialGoogle] = useState<IGoogle | null>(null);

  const { data, mutate } = useSWR("/marketing", fetcher);

  useEffect(() => {
    if (data?.data?.[0]?.google) {
      const googleData: IGoogle = data.data[0].google;
      setGoogle(googleData);
      setInitialGoogle(googleData);
    }
  }, [data]);

  const hasChanges = useMemo(() => {
    if (!initialGoogle) return true;

    return Object.keys(initialGoogle).some(
      (key) =>
        google[key as keyof IGoogle] !== initialGoogle[key as keyof IGoogle]
    );
  }, [google, initialGoogle]);

  // ================= Handlers =================
  const handleGoogleChange = (field: keyof IGoogle, value: string) => {
    setGoogle((prev) => ({ ...prev, [field]: value }));
  };

  const handleGoogleSave = async () => {
    try {
      const res = await api.patch("/marketing", { google: google });
      mutate();

      if (res.status === 200) {
        toast.success("Google Tag Manager & Analytics updated successfully!");
      } else {
        toast.error("Failed to update Google settings.");
      }
    } catch (err) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 403) {
        toast.error("You don't have permission to update Google settings.");
      } else {
        toast.error("Failed to update Google settings.");
      }
      mutate();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Tag Manager & Analytics</CardTitle>
        <CardDescription>
          Configure Google Tag ID, Analytics tracking, and test events
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Measurement ID */}
        <div className="space-y-2">
          <Label htmlFor="measurementId">Measurement ID</Label>
          <Input
            id="measurementId"
            placeholder="Example: G-XXXXXXXXXX"
            value={google.measurementId}
            onChange={(e) =>
              handleGoogleChange("measurementId", e.target.value)
            }
          />
        </div>

        {/* Tag ID */}
        <div className="space-y-2">
          <Label htmlFor="tagId">
            TAG ID <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tagId"
            placeholder="Example: GTM-XXXXXXX"
            value={google.tagId}
            onChange={(e) => handleGoogleChange("tagId", e.target.value)}
          />
        </div>

        <Separator />

        {/* Merchant Info */}
        <div className="space-y-2">
          <Label htmlFor="merchant">Merchant Info</Label>
          <Input
            id="merchant"
            placeholder="Optional merchant identifier"
            value={google.merchant}
            onChange={(e) => handleGoogleChange("merchant", e.target.value)}
          />
        </div>

        <Separator />

        {/* Test Event */}
        <div className="space-y-2">
          <Label htmlFor="testEvent">
            Test Event Code{" "}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="testEvent"
            placeholder="Example: TEST74434"
            value={google.testEventCode}
            onChange={(e) =>
              handleGoogleChange("testEventCode", e.target.value)
            }
          />
        </div>

        <Separator />

        {/* Analytics Integration */}
        <div className="space-y-2">
          <Label htmlFor="analyticsIntegration">
            Google Analytics Integration
          </Label>
          <Input
            id="analyticsIntegration"
            placeholder="Example: GA4 Property ID or Integration Key"
            value={google.analyticsIntegration}
            onChange={(e) =>
              handleGoogleChange("analyticsIntegration", e.target.value)
            }
          />
          <p className="text-sm text-muted-foreground">
            Enter your Google Analytics integration or property identifier
          </p>
        </div>

        <Separator />

        <HasPermission permission="marketing:manage">
          <div className="flex justify-end gap-3">
            <Button onClick={handleGoogleSave} disabled={!hasChanges}>
              Update
            </Button>
          </div>
        </HasPermission>
      </CardContent>
    </Card>
  );
}
