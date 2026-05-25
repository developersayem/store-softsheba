"use client";

import React, { useState } from "react";
import { useStoreSettings } from "@/contexts/store-settings-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, CheckCircle, Store, Palette, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const OnboardingWizard = () => {
  const {
    isOnboardingCompleted,
    setOnboardingCompleted,
    brandName,
    setBrandName,
    color,
    setColor,
    setWebsiteLogo,
    websiteLogoPreview,
    setWebsiteLogoPreview,
    handleStoreSettings,
    isLoading,
    isUpdating,
  } = useStoreSettings();

  const [step, setStep] = useState(1);
  const [localSaving, setLocalSaving] = useState(false);

  // If loading or already completed, do not render wizard
  if (isLoading || isOnboardingCompleted) {
    return null;
  }

  const handleNext = () => {
    if (step === 1 && !brandName.trim()) {
      toast.error("Please enter a brand name");
      return;
    }
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    setWebsiteLogo(file);
    const previewUrl = URL.createObjectURL(file);
    setWebsiteLogoPreview(previewUrl);
    toast.success("Logo ready for upload");
  };

  const removeWebsiteLogo = () => {
    setWebsiteLogo(null);
    setWebsiteLogoPreview(null);
  };

  const handleFinish = async () => {
    if (!brandName.trim()) {
      toast.error("Brand name is required.");
      setStep(1);
      return;
    }

    setLocalSaving(true);
    // Mark context as complete locally first so it sends `true` in the payload
    setOnboardingCompleted(true);
    
    // Slight delay to ensure state propagates to payload if needed,
    // though `handleStoreSettings` reads from current state,
    // we updated context directly so `isOnboardingCompleted` is true.
    setTimeout(async () => {
      try {
        await handleStoreSettings({ onboarding_completed: true });
        toast.success("Welcome to your dashboard!");
      } catch {
        // Revert on failure
        setOnboardingCompleted(false);
        toast.error("Failed to save settings. Please try again.");
      } finally {
        setLocalSaving(false);
      }
    }, 100);
  };

  const Step1 = (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="flex justify-center mb-6">
        <div className="bg-primary/10 p-4 rounded-full">
          <Store className="w-12 h-12 text-primary" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="brandName">What is your store&apos;s name?</Label>
        <Input
          id="brandName"
          placeholder="e.g. My Awesome Shop"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          className="text-lg py-6"
          autoFocus
        />
        <p className="text-sm text-muted-foreground">
          This is the name customers will see on your storefront.
        </p>
      </div>
    </motion.div>
  );

  const Step2 = (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-center mb-2">
        <div className="bg-primary/10 p-4 rounded-full">
          <Palette className="w-12 h-12 text-primary" />
        </div>
      </div>
      
      <div className="space-y-3">
        <Label>Store Theme Color</Label>
        <div className="flex items-center gap-4">
          <Input
            type="color"
            value={color || "#0F172A"}
            onChange={(e) => setColor(e.target.value)}
            className="w-16 h-12 p-1 cursor-pointer"
          />
          <Input
            placeholder="Hex color"
            value={color || "#0F172A"}
            onChange={(e) => setColor(e.target.value)}
            className="w-full flex-1"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Store Logo (Optional)</Label>
        {websiteLogoPreview ? (
          <div className="relative border rounded-xl h-32 flex items-center justify-center bg-white p-4">
            <button
              onClick={removeWebsiteLogo}
              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-destructive/90 transition shadow"
            >
              <X size={14} />
            </button>
            <Image
              src={websiteLogoPreview}
              alt="Logo Preview"
              width={200}
              height={70}
              className="object-contain max-h-full"
            />
          </div>
        ) : (
          <label className="w-full h-32 flex flex-col justify-center items-center border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition cursor-pointer rounded-xl p-4 bg-muted/20">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground text-center">
              Click to upload your logo
            </p>
          </label>
        )}
      </div>
    </motion.div>
  );

  const Step3 = (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 text-center"
    >
      <div className="flex justify-center mb-6">
        <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
          <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
        </div>
      </div>
      <h3 className="text-2xl font-bold">You&apos;re all set!</h3>
      <p className="text-muted-foreground">
        Your store &quot;{brandName}&quot; is ready. You can always change these settings later from the dashboard.
      </p>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-lg shadow-2xl border-primary/20">
        <CardHeader className="text-center pt-8 pb-2">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Welcome to ShopXet!
          </CardTitle>
          <CardDescription className="text-base pt-2">
            Let&apos;s get your store set up in just a few steps.
          </CardDescription>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-3/4 mx-auto mt-6">
            <div className={`h-2 rounded-full flex-1 ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 rounded-full flex-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 rounded-full flex-1 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-2 min-h-[280px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 1 && <div key="step1">{Step1}</div>}
            {step === 2 && <div key="step2">{Step2}</div>}
            {step === 3 && <div key="step3">{Step3}</div>}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-between pb-8 pt-4 px-6 border-t mt-4">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={step === 1 || localSaving || isUpdating}
            className={step === 1 ? 'opacity-0' : 'opacity-100'}
          >
            Back
          </Button>
          
          {step < 3 ? (
            <Button onClick={handleNext} size="lg" className="px-8">
              Continue
            </Button>
          ) : (
            <Button 
              onClick={handleFinish} 
              size="lg" 
              className="px-8"
              disabled={localSaving || isUpdating}
            >
              {(localSaving || isUpdating) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Go to Dashboard"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
