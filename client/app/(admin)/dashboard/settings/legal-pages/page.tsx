"use client";

import { useStoreSettings } from "@/contexts/store-settings-context";
import { Loader2, FileText, ShieldCheck, RotateCcw, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () => import("@/components/dashboard/shared/RichTextEditor"),
  { ssr: false },
);

const TABS = [
  {
    key: "privacy_policy" as const,
    label: "Privacy Policy",
    icon: ShieldCheck,
    description: "Define how you collect, use, and protect customer data.",
  },
  {
    key: "terms_conditions" as const,
    label: "Terms & Conditions",
    icon: FileText,
    description: "Set the rules and guidelines for using your store.",
  },
  {
    key: "refund_returns" as const,
    label: "Refund & Returns",
    icon: RotateCcw,
    description: "Explain your return, refund, and exchange policy.",
  },
  {
    key: "user_guide" as const,
    label: "User Guide",
    icon: BookOpen,
    description: "Provide instructions and tips for customers using your store.",
  },
];

export default function LegalPagesSettingsPage() {
  const { isUpdating, legalPages, setLegalPages, handleStoreSettings } = useStoreSettings();

  const handleChange = (key: keyof typeof legalPages, value: string) => {
    setLegalPages((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="py-8 px-4">
      {isUpdating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-lg bg-background px-6 py-4 shadow-lg border border-border">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Updating settings...</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Legal Pages</h1>
          <p className="text-muted-foreground mt-1">
            Edit the content of your store&apos;s legal and information pages.
          </p>
        </div>
      </div>

      <Tabs defaultValue="privacy_policy">
        <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <TabsTrigger key={key} value={key} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
          <h3 className="text-sm font-semibold mb-2">Available Variables</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { label: "Website Name", var: "{{website_name}}" },
              { label: "Store Email", var: "{{store_email}}" },
              { label: "Store Phone", var: "{{store_phone}}" },
              { label: "Store Address", var: "{{store_address}}" },
              { label: "Store Country", var: "{{store_country}}" },
              { label: "Minimum Age", var: "{{min_age}}" },
              { label: "Current Date", var: "{{current_date}}" },
            ].map((v) => (
              <div key={v.var} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{v.label}:</span>
                <code 
                  className="text-xs font-mono bg-background px-1.5 py-0.5 rounded border border-border text-primary cursor-copy hover:bg-accent transition-colors" 
                  title="Click to copy" 
                  onClick={() => {
                    navigator.clipboard.writeText(v.var);
                    toast.success(`Copied ${v.var}`);
                  }}
                >
                  {v.var}
                </code>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-3 italic">
            * Tip: Use these variables in the editor. They will be replaced with actual values on the public site.
          </p>
        </div>

        {TABS.map(({ key, label, icon: Icon, description }) => (
          <TabsContent key={key} value={key}>
            <Card className="border-none shadow-none bg-accent/50 dark:bg-accent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle>{label}</CardTitle>
                </div>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  value={legalPages[key]}
                  onChange={(val) => handleChange(key, val)}
                  placeholder={`Write your ${label} content here...`}
                  height="70vh"
                  onSave={() => handleStoreSettings()}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
