"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

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
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import { ICarrybee, IPathao, ISteadfast } from "@/types/courier.types";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function CourierApiIntegration() {
  const { data, mutate } = useSWR("/courier-api", fetcher);

  // ================= State =================
  const [pathao, setPathao] = useState<IPathao>({
    enabled: false,
    clientId: "",
    clientSecret: "",
    clientEmail: "",
    clientPassword: "",
    storeId: "",
    storeName: "",
    storeContactNumber: "",
    webhookCallbackUrl: "",
    webhookSecret: "",
  });

  const [steadfast, setSteadfast] = useState<ISteadfast>({
    enabled: false,
    apiKey: "",
    secretKey: "",
  });
  const [carrybee, setCarrybee] = useState<ICarrybee>({
    enabled: false,
    clientId: "",
    clientSecret: "",
    clientContext: "",
    isSandbox: false,
    storeId: "",
  });

  const [initialPathao, setInitialPathao] = useState<IPathao | null>(null);
  const [initialSteadfast, setInitialSteadfast] = useState<ISteadfast | null>(
    null
  );
  const [initialCarrybee, setInitialCarrybee] = useState<ICarrybee | null>(null);

  // ================= Prefill state when SWR loads =================
  useEffect(() => {
    if (data?.data?.[0]) {
      const pathaoData = data.data[0].pathao;
      const steadfastData = data.data[0].steadfast;
      const carrybeeData = data.data[0].carrybee;

      setPathao(pathaoData);
      setSteadfast(steadfastData);
      setCarrybee(carrybeeData || {
        enabled: false,
        clientId: "",
        clientSecret: "",
        clientContext: "",
        isSandbox: false,
        storeId: "",
      });

      // Save initial state for comparison
      setInitialPathao(pathaoData);
      setInitialSteadfast(steadfastData);
      setInitialCarrybee(carrybeeData);
    }
  }, [data]);

  // ================= Handlers =================
  const handlePathaoChange = (
    field: keyof IPathao,
    value: string | boolean
  ) => {
    setPathao((prev) => ({ ...prev, [field]: value }));
  };

  const handleSteadfastChange = (
    field: keyof ISteadfast,
    value: string | boolean
  ) => {
    setSteadfast((prev) => ({ ...prev, [field]: value }));
  };

  const handleCarrybeeChange = (
    field: keyof ICarrybee,
    value: string | boolean
  ) => {
    setCarrybee((prev) => ({ ...prev, [field]: value }));
  };
  const hasChanges = useMemo(() => {
    if (!initialPathao) {
      return Object.values(pathao).some((val) => val !== "" && val !== false);
    }

    return Object.keys(pathao).some(
      (key) =>
        pathao[key as keyof IPathao] !== initialPathao[key as keyof IPathao]
    );
  }, [pathao, initialPathao]);

  const hasSteadfastChanges = useMemo(() => {
    if (!initialSteadfast) {
      return Object.values(steadfast).some(
        (val) => val !== "" && val !== false
      );
    }

    return Object.keys(steadfast).some(
      (key) =>
        steadfast[key as keyof ISteadfast] !==
        initialSteadfast[key as keyof ISteadfast]
    );
  }, [steadfast, initialSteadfast]);

  const hasCarrybeeChanges = useMemo(() => {
    if (!initialCarrybee) {
      return Object.values(carrybee).some(
        (val) => val !== "" && val !== false
      );
    }

    return Object.keys(carrybee).some(
      (key) =>
        carrybee[key as keyof ICarrybee] !==
        initialCarrybee[key as keyof ICarrybee]
    );
  }, [carrybee, initialCarrybee]);

  const handlePathaoSave = async () => {
    try {
      const res = await api.patch("/courier-api", { pathao: pathao });
      mutate();
      if (res.status === 200) {
        toast.success("Courier Api Details updated successfully!");
      } else {
        toast.error("Failed to update Courier Api Details.");
      }
      //   toast.success("Store settings updated successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to update Courier Api Details");
      mutate();
    }
    console.log("Saving Pathao:", { pathao: pathao });
  };

  const handleSteadFastSave = async () => {
    try {
      const res = await api.patch("/courier-api", { steadfast: steadfast });
      mutate();
      if (res.status === 200) {
        toast.success("Courier Api Details updated successfully!");
      } else {
        toast.error("Failed to update Courier Api Details.");
      }
      //   toast.success("Store settings updated successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to update Courier Api Details");
      mutate();
    }
    console.log("Saving SteadFast:", steadfast);
  };

  const handleCarrybeeSave = async () => {
    try {
      const res = await api.patch("/courier-api", { carrybee: carrybee });
      mutate();
      if (res.status === 200) {
        toast.success("Carrybee settings updated successfully!");
      } else {
        toast.error("Failed to update Carrybee settings.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update Carrybee settings");
      mutate();
    }
  };

  return (
    <div className="space-y-8">
      {/* ================= Pathao ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Pathao Courier</CardTitle>
          <CardDescription>
            Pathao authentication & webhook configuration
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <Label>Integration Status</Label>
            <Switch
              checked={pathao.enabled}
              onCheckedChange={(val) => handlePathaoChange("enabled", val)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                { label: "Client ID", field: "clientId", type: "text" },
                {
                  label: "Client Secret",
                  field: "clientSecret",
                  type: "password",
                },
                { label: "Client Email", field: "clientEmail", type: "text" },
                {
                  label: "Client Password",
                  field: "clientPassword",
                  type: "password",
                },
                { label: "Store ID", field: "storeId", type: "text" },
                { label: "Store Name", field: "storeName", type: "text" },
                {
                  label: "Store Contact Number",
                  field: "storeContactNumber",
                  type: "text",
                },
              ] as const
            ).map(({ label, field, type }) => (
              <div className="space-y-3" key={field}>
                <Label>{label}</Label>
                <Input
                  type={type ?? "text"}
                  placeholder={`Type Pathao ${label.toLowerCase()}`}
                  value={pathao[field] || ""}
                  onChange={(e) => handlePathaoChange(field, e.target.value)}
                />
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Webhook Callback URL</Label>
            <Input
              placeholder="https://www.app.storex.com.bd/courier-service/update-status"
              value={pathao.webhookCallbackUrl || ""}
              onChange={(e) =>
                handlePathaoChange("webhookCallbackUrl", e.target.value)
              }
            />
            <p className="text-sm text-muted-foreground">
              Pathao webhook endpoint
            </p>
          </div>

          <div className="space-y-3">
            <Label>Webhook Secret</Label>
            <Input
              type="password"
              placeholder="Webhook integration secret"
              value={pathao.webhookSecret || ""}
              onChange={(e) =>
                handlePathaoChange("webhookSecret", e.target.value)
              }
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handlePathaoSave} disabled={!hasChanges}>
              Save Pathao Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ================= SteadFast ================= */}
      <Card>
        <CardHeader>
          <CardTitle>SteadFast Courier</CardTitle>
          <CardDescription>SteadFast API authentication</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Integration Status</Label>
            <Switch
              checked={steadfast.enabled}
              onCheckedChange={(val) => handleSteadfastChange("enabled", val)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label>API Key</Label>
              <Input
                placeholder="SteadFast api_key"
                value={steadfast?.apiKey ?? ""}
                onChange={(e) =>
                  handleSteadfastChange("apiKey", e.target.value)
                }
              />
            </div>

            <div className="space-y-3">
              <Label>Secret Key</Label>
              <Input
                type="password"
                placeholder="SteadFast secret_key"
                value={steadfast?.secretKey ?? ""}
                onChange={(e) =>
                  handleSteadfastChange("secretKey", e.target.value)
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSteadFastSave}
              disabled={!hasSteadfastChanges}
            >
              Save SteadFast Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ================= Carrybee ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Carrybee Courier</CardTitle>
          <CardDescription>Carrybee API v2.0 configuration</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Integration Status</Label>
            <Switch
              checked={carrybee.enabled}
              onCheckedChange={(val) => handleCarrybeeChange("enabled", val)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label>Client ID</Label>
              <Input
                placeholder="Carrybee client_id"
                value={carrybee.clientId || ""}
                onChange={(e) => handleCarrybeeChange("clientId", e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Client Secret</Label>
              <Input
                type="password"
                placeholder="Carrybee client_secret"
                value={carrybee.clientSecret || ""}
                onChange={(e) => handleCarrybeeChange("clientSecret", e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Client Context</Label>
              <Input
                placeholder="Carrybee client_context"
                value={carrybee.clientContext || ""}
                onChange={(e) => handleCarrybeeChange("clientContext", e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Default Store ID</Label>
              <Input
                placeholder="Carrybee store_id"
                value={carrybee.storeId || ""}
                onChange={(e) => handleCarrybeeChange("storeId", e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 py-4">
              <Switch
                checked={carrybee.isSandbox}
                onCheckedChange={(val) => handleCarrybeeChange("isSandbox", val)}
              />
              <Label>Use Sandbox Mode</Label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleCarrybeeSave}
              disabled={!hasCarrybeeChanges}
            >
              Save Carrybee Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
