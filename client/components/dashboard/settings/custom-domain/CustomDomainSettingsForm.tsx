"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Globe, RefreshCw, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

const CustomDomainSettingsForm = () => {
  const [domain, setDomain] = useState("");
  const [currentDomain, setCurrentDomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchStoreDetails();
  }, []);

  const fetchStoreDetails = async () => {
    try {
      const res = await api.get("/stores/me");
      if (res.data.success) {
        setDomain(res.data.data.domain || "");
        setCurrentDomain(res.data.data.domain || null);
      }
    } catch (error) {
      console.error("Failed to fetch store details", error);
      toast.error("Failed to load domain settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await api.patch("/stores/custom-domain", { domain: domain || null });
      if (res.data.success) {
        toast.success("Domain settings updated. It may take up to 48 hours for DNS changes to propagate.");
        setCurrentDomain(domain || null);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || "Failed to update domain";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Globe className="h-5 w-5" />
            Connect Your Domain
          </CardTitle>
          <CardDescription>
            Configure a custom domain to give your shop a premium feel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Custom Domain</Label>
              <div className="flex gap-2">
                <Input
                  id="domain"
                  placeholder="e.g. www.mystore.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="max-w-md"
                />
                <Button type="submit" disabled={isSaving || domain === currentDomain}>
                  {isSaving ? "Saving..." : "Connect Domain"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground italic">
                Enter only the domain name (e.g., mystore.com or shop.mystore.com). Do not include http:// or https://
              </p>
            </div>
          </form>

          {currentDomain && (
            <div className="mt-6 p-4 bg-green-500/5 border border-green-500/20 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">System configured for: {currentDomain}</p>
                <p className="text-xs text-muted-foreground">Make sure your DNS settings match the instructions below.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5" />
            DNS Configuration Instructions
          </CardTitle>
          <CardDescription>
            To finish connecting your domain, log in to your domain provider (e.g. GoDaddy, Namecheap, Cloudflare) and set the following records:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Option 1: Subdomain (e.g. shop.mystore.com)</h4>
              <div className="overflow-x-auto rounded-lg border border-border bg-background">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Host/Name</th>
                      <th className="px-4 py-2 text-left">Value/Points To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-2 font-mono font-bold">CNAME</td>
                      <td className="px-4 py-2 font-mono">shop</td>
                      <td className="px-4 py-2 font-mono text-primary">app.shopxet.com</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Option 2: Apex Domain (e.g. mystore.com)</h4>
              <div className="overflow-x-auto rounded-lg border border-border bg-background">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Host/Name</th>
                      <th className="px-4 py-2 text-left">Value/Points To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-2 font-mono font-bold">A</td>
                      <td className="px-4 py-2 font-mono">@</td>
                      <td className="px-4 py-2 font-mono text-primary">{process.env.NEXT_PUBLIC_SERVER_IP || "47.130.213.48"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                <AlertCircle className="inline h-3 w-3 mr-1" />
                Note: {process.env.NEXT_PUBLIC_SERVER_IP || "47.130.213.48"} is your dedicated server IP. Point your A record here to connect your domain.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
            <div className="flex items-center gap-3 mb-1">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <h5 className="text-sm font-bold text-yellow-900">Important: Propagation Time</h5>
            </div>
            <p className="text-xs text-yellow-800 ml-7">
              Changes to DNS records can take anywhere from a few minutes to 48 hours to propagate worldwide. Most providers take about 1-2 hours.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomDomainSettingsForm;
