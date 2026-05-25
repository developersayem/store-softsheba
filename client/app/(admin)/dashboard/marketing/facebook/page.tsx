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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { IFacebook } from "@/types/marketing.type";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { HasPermission } from "@/components/shared/has-permission";

export default function FacebookConversionApi() {
  const [facebook, setFacebook] = useState<IFacebook>({
    pixelId: "",
    accessToken: "",
    catalogId: "",
    testEventCode: "",
    browserTrackingEnabled: false,
    serverTrackingEnabled: false,
  });

  const [initialFacebook, setInitialFacebook] = useState<IFacebook | null>(
    null
  );

  const { data, mutate } = useSWR("/marketing", fetcher);

  //console.log(facebookData);
  useEffect(() => {
    if (data?.data?.[0]?.facebook) {
      const facebookData: IFacebook = data?.data?.[0]?.facebook;
      setFacebook(facebookData);
      setInitialFacebook(facebookData);
    }
  }, [data]);
  const hasChanges = useMemo(() => {
    if (!initialFacebook) return true; // allow save if no DB data

    return Object.keys(initialFacebook).some(
      (key) =>
        facebook[key as keyof IFacebook] !==
        initialFacebook[key as keyof IFacebook]
    );
  }, [facebook, initialFacebook]);

  // ================= Handlers =================
  const handleFacebookChange = (
    field: keyof IFacebook,
    value: string | boolean
  ) => {
    setFacebook((prev) => ({ ...prev, [field]: value }));
  };

  const handleFacebookSave = async () => {
    try {
      const res = await api.patch("/marketing", { facebook: facebook });
      mutate();
      if (res.status === 200) {
        toast.success("Facebook Conversion Api Details updated successfully!");
      } else {
        toast.error("Failed to update Facebook Conversion Api Details.");
      }
      //   toast.success("Store settings updated successfully");
    } catch (err) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 403) {
        toast.error("You don't have permission to update Facebook Conversion Api Details.");
      } else {
        toast.error("Failed to update Facebook Conversion Api Details");
      }
      mutate();
    }
  };

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Facebook Conversion API</CardTitle>
        <CardDescription>
          Configure Meta Pixel and server-side tracking settings
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Pixel / Dataset */}
        <div className="space-y-2">
          <Label htmlFor="pixelId">Dataset ID (Pixel ID)</Label>
          <Input
            id="pixelId"
            placeholder="Enter Meta Pixel / Dataset ID"
            value={facebook?.pixelId ?? ""}
            onChange={(e) => handleFacebookChange("pixelId", e.target.value)}
          />
        </div>

        {/* Access Token */}
        <div className="space-y-2">
          <Label htmlFor="accessToken">Access Token</Label>
          <Input
            id="accessToken"
            type="password"
            placeholder="Enter Meta access token"
            value={facebook?.accessToken ?? ""}
            onChange={(e) =>
              handleFacebookChange("accessToken", e.target.value)
            }
          />
        </div>

        {/* Catalog */}
        <div className="space-y-2">
          <Label htmlFor="catalogId">Meta Catalog ID</Label>
          <Input
            id="catalogId"
            placeholder="Optional catalog ID"
            value={facebook?.catalogId ?? ""}
            onChange={(e) => handleFacebookChange("catalogId", e.target.value)}
          />
        </div>

        <Separator />

        {/* Test Event */}
        <div className="space-y-2">
          <Label htmlFor="testEventCode">
            Test Event Code{" "}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="testEventCode"
            placeholder="Example: TEST74434"
            value={facebook?.testEventCode ?? ""}
            onChange={(e) =>
              handleFacebookChange("testEventCode", e.target.value)
            }
          />
        </div>

        <Separator />

        {/* Tracking Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Browser Side Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Enable Meta Pixel tracking in the browser
              </p>
            </div>
            <Switch
              checked={facebook.browserTrackingEnabled}
              onCheckedChange={(val) =>
                handleFacebookChange("browserTrackingEnabled", val)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Server Side Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Enable Facebook Conversion API (recommended)
              </p>
            </div>
            <Switch
              checked={facebook.serverTrackingEnabled}
              onCheckedChange={(val) =>
                handleFacebookChange("serverTrackingEnabled", val)
              }
            />
          </div>
        </div>

        <Separator />

        <HasPermission permission="marketing:manage">
          <div className="flex justify-end gap-3">
            <Button onClick={handleFacebookSave} disabled={!hasChanges}>Update</Button>
          </div>
        </HasPermission>
      </CardContent>
    </Card>
  );
}
