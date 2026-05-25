"use client";

import { X, Clock, Calendar, LayoutTemplate, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useStoreSettings } from "@/contexts/store-settings-context";
import Image from "next/image";

export default function HomepageSettings() {
  const {
    hero,
    setHero,
    setHeroFiles,
    flashSale,
    setFlashSale,
    setFlashBannerFile,
    setFlashCountdownFile,
    cardStyle,
    setCardStyle,
    setDeletedHeroIndices,
  } = useStoreSettings();

  const handleAddHeroSlide = () => {
    setHero((prev) => ({
      ...prev,
      hero_images: [...prev.hero_images, null],
    }));
  };
  // --- HANDLERS ---
  const handleHeroUpload = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Update Visual Preview (Strings)
      const url = URL.createObjectURL(file);
      const newImages = [...hero.hero_images];
      newImages[index] = url;
      setHero({ ...hero, hero_images: newImages });

      // 2. Update Actual File for Upload (The missing part)
      setHeroFiles((prev) => ({
        ...prev,
        [index]: file,
      }));
    }
  };

  const removeHeroImage = (index: number) => {
    //console.log(index);
    setDeletedHeroIndices((prev) => [...prev, index]);

    setHero((prev) => ({
      ...prev,
      hero_images: prev.hero_images.filter((_, i) => i !== index),
    }));

    setHeroFiles((prev) => {
      const newFiles: { [key: number]: File | null } = {};
      Object.keys(prev).forEach((key) => {
        const keyNum = Number(key);
        if (keyNum < index) newFiles[keyNum] = prev[keyNum];
        else if (keyNum > index) newFiles[keyNum - 1] = prev[keyNum];
      });
      return newFiles;
    });
  };

  const handleFlashUpload = (
    key: "banner_image" | "count_down_image",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);

      // 1. Update Visual Preview
      setFlashSale((prev) => ({
        ...prev,
        banner: { ...prev.banner, [key]: url },
      }));

      // 2. Update Actual File (The missing part)
      if (key === "banner_image") {
        setFlashBannerFile(file);
      } else {
        setFlashCountdownFile(file);
      }
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* --- PAGE HEADER --- */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-end">
          Homepage Design
        </h1>
      </div>

      {/* =========================================================
          SECTION 1: HERO SLIDER
      ========================================================= */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Hero Slider</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Carousel Configuration</CardTitle>
            <CardDescription>
              Manage the main sliding banners at the top of the home page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Duration Slider */}
            <div className="space-y-4 ">
              <div className="flex justify-between items-center">
                <Label>Slide Duration</Label>
                <Badge variant="outline" className="font-mono">
                  {hero.carousel_duration}ms
                </Badge>
              </div>
              <Slider
                defaultValue={[hero.carousel_duration]}
                max={10000}
                step={250}
                min={1000}
                onValueChange={(val) =>
                  setHero({ ...hero, carousel_duration: val[0] })
                }
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Hero Slides (2550 x 1442) : ({hero.hero_images.length})</Label>
                <span className="text-xs text-muted-foreground">
                  Upload images for your homepage carousel.
                </span>
              </div>

              {/* DYNAMIC GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Map through existing images */}
                {hero.hero_images.map((img, index) => (
                  <div key={index} className="space-y-3 relative group">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs uppercase text-muted-foreground font-semibold">
                        Slide {index + 1}
                      </Label>
                      {img && (
                        <Badge variant="secondary" className="text-[10px] h-5">
                          Active
                        </Badge>
                      )}
                    </div>

                    <ImageUploader
                      imageSrc={img}
                      onUpload={(e) => handleHeroUpload(index, e)}
                      onRemove={() => removeHeroImage(index)}
                      aspect="video"
                    />
                  </div>
                ))}

                {/* "Add New Slide" Button - Always appears as the last item */}
                <button
                  onClick={handleAddHeroSlide}
                  className="flex flex-col items-center justify-center min-h-40 h-full gap-2  border-2 border-dashed rounded-lg border-muted-foreground/25 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary transition-colors">
                    <Plus size={24} />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">
                    Add New Slide
                  </span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* =========================================================
          SECTION 2: FLASH SALE
      ========================================================= */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Flash Sale Campaign</h2>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Start Date & Time</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="datetime-local"
                    className="pl-9"
                    value={flashSale?.banner?.flash_sale_start?.slice(0, 16) || ""}
                    onChange={(e) =>
                      setFlashSale({
                        ...flashSale,
                        banner: {
                          ...flashSale.banner,
                          flash_sale_start: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>End Date & Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="datetime-local"
                    className="pl-9"
                    value={flashSale?.banner?.flash_sale_end?.slice(0, 16) || ""}
                    onChange={(e) =>
                      setFlashSale({
                        ...flashSale,
                        banner: {
                          ...flashSale.banner,
                          flash_sale_end: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Campaign Description</Label>
              <Textarea
                className="resize-none"
                value={flashSale?.banner?.description || ""}
                onChange={(e) =>
                  setFlashSale({
                    ...flashSale,
                    banner: {
                      ...flashSale.banner,
                      description: e.target.value,
                    },
                  })
                }
              />
            </div>

            <Separator />

            {/* Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Main Banner Image <span className="text-muted-foreground text-xs">(Auto)</span></Label>
                <ImageUploader
                  imageSrc={flashSale?.banner?.banner_image}
                  onUpload={(e) => handleFlashUpload("banner_image", e)}
                  onRemove={() => {
                    setFlashSale((prev) => ({
                      ...prev,
                      banner: { ...prev.banner, banner_image: null },
                    }));
                    setFlashBannerFile(null);
                  }}
                  aspect="video"
                />
              </div>
              <div className="space-y-2">
                <Label>Countdown Graphic <span className="text-muted-foreground text-xs">(Auto)</span></Label>
                <ImageUploader
                  imageSrc={flashSale?.banner?.count_down_image}
                  onUpload={(e) => handleFlashUpload("count_down_image", e)}
                  onRemove={() => {
                    setFlashSale((prev) => ({
                      ...prev,
                      banner: { ...prev.banner, count_down_image: null },
                    }));
                    setFlashCountdownFile(null);
                  }}
                  aspect="video"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* =========================================================
          SECTION 3: PRODUCT CARD STYLING
      ========================================================= */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Product Card Design</h2>
        </div>
        <Card className="xl:col-span-7">
          <CardContent className="space-y-8">
            {/* Add To Cart Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
                <LayoutTemplate size={16} /> &quot;Add to Cart&rdquo; Button
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 bg-accent/20 p-4 rounded-lg">
                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <Label>Button Text</Label>
                  <Input
                    className="bg-background"
                    value={cardStyle?.add_to_cart_btn_text || ""}
                    onChange={(e) =>
                      setCardStyle({
                        ...cardStyle,
                        add_to_cart_btn_text: e.target.value,
                      })
                    }
                  />
                </div>
                <ColorPicker
                  label="Background"
                  value={cardStyle?.add_to_cart_btn_color || ""}
                  onChange={(v) =>
                    setCardStyle({ ...cardStyle, add_to_cart_btn_color: v })
                  }
                />
                <ColorPicker
                  label="Hover Background"
                  value={cardStyle?.add_to_cart_btn_hover_color || ""}
                  onChange={(v) =>
                    setCardStyle({
                      ...cardStyle,
                      add_to_cart_btn_hover_color: v,
                    })
                  }
                />
                <ColorPicker
                  label="Text Color"
                  value={cardStyle?.add_to_cart_btn_text_color || ""}
                  onChange={(v) =>
                    setCardStyle({
                      ...cardStyle,
                      add_to_cart_btn_text_color: v,
                    })
                  }
                />
                <ColorPicker
                  label="Hover Text Color"
                  value={cardStyle?.add_to_cart_btn_text_hover_color || ""}
                  onChange={(v) =>
                    setCardStyle({
                      ...cardStyle,
                      add_to_cart_btn_text_hover_color: v,
                    })
                  }
                />
              </div>
            </div>

            {/* Buy Now Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
                <LayoutTemplate size={16} /> &quot;Buy Now&rdquo; Button
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 bg-accent/20 p-4 rounded-lg">
                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <Label>Button Text</Label>
                  <Input
                    className="bg-background"
                    value={cardStyle?.buy_now_btn_text || ""}
                    onChange={(e) =>
                      setCardStyle({
                        ...cardStyle,
                        buy_now_btn_text: e.target.value,
                      })
                    }
                  />
                </div>
                <ColorPicker
                  label="Background"
                  value={cardStyle?.buy_now_btn_color || ""}
                  onChange={(v) =>
                    setCardStyle({ ...cardStyle, buy_now_btn_color: v })
                  }
                />
                <ColorPicker
                  label="Hover Background"
                  value={cardStyle?.buy_now_btn_hover_color || ""}
                  onChange={(v) =>
                    setCardStyle({ ...cardStyle, buy_now_btn_hover_color: v })
                  }
                />
                <ColorPicker
                  label="Text Color"
                  value={cardStyle?.buy_now_btn_text_color || ""}
                  onChange={(v) =>
                    setCardStyle({ ...cardStyle, buy_now_btn_text_color: v })
                  }
                />
                <ColorPicker
                  label="Hover Text Color"
                  value={cardStyle?.buy_now_btn_text_hover_color || ""}
                  onChange={(v) =>
                    setCardStyle({
                      ...cardStyle,
                      buy_now_btn_text_hover_color: v,
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// =================================================================
// HELPER COMPONENTS
// =================================================================

function ImageUploader({
  imageSrc,
  onUpload,
  onRemove,
  aspect = "square",
}: {
  imageSrc: string | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  aspect?: "square" | "video";
}) {
  return (
    <div
      className={`group relative w-full ${
        aspect === "video" ? "aspect-video" : "aspect-square"
      } border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-accent/10 hover:bg-accent/20 transition-colors overflow-hidden`}
    >
      {imageSrc && typeof imageSrc === "string" && imageSrc.length > 5 ? (
        <>
          <Image
            src={imageSrc}
            alt="Preview"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
            <Button
              variant="destructive"
              size="icon"
              onClick={onRemove}
              className="rounded-full h-8 w-8 shadow-md"
            >
              <X size={14} />
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center opacity-20">
          <LayoutTemplate className="w-8 h-8 mb-2" />
        </div>
      )}
      {!imageSrc && (
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          onChange={onUpload}
        />
      )}
    </div>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex gap-2 items-center">
        <div className="h-9 w-9 rounded-md border shadow-sm shrink-0 overflow-hidden relative ring-offset-background transition-shadow focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer p-0 border-0"
          />
        </div>
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs uppercase bg-background"
          maxLength={7}
        />
      </div>
    </div>
  );
}
