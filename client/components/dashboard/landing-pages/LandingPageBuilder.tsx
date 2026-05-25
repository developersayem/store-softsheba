"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  X,
  Wand2,
} from "lucide-react";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  variants?: Variant[];
  hasVariants?: boolean;
}

interface Variant {
  _id: string;
  name: string;
  regular_price: number;
  sale_price?: number;
  attributes?: { name: string; value: string }[];
}

interface LandingPageForm {
  name: string;
  slug: string;
  productId: string;
  productSlug: string;
  whatsappNumber: string;
  isActive: boolean;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
  hero: {
    title: string;
    subtitle: string;
    badgeText: string;
    heroImage: string;
    ctaButtonText: string;
    whatsappButtonText: string;
    trustBadges: string[];
    stats: { icon: string; title: string; subtitle: string }[];
  };
  problemSolution: {
    sectionTitle: string;
    problem: {
      title: string;
      image: string;
      items: string[];
    };
    solution: {
      title: string;
      image: string;
      items: string[];
    };
  };
  whyUsTitle: string;
  features: {
    image: string;
    icon: string;
    title: string;
    description: string;
  }[];
  variantsSectionTitle: string;
  reviewsSectionTitle: string;
  deliveryGuarantee: {
    sectionTitle: string;
    items: { image: string; icon: string; title: string }[];
  };
  customReviews: {
    name: string;
    location: string;
    rating: number;
    review: string;
    avatar: string;
  }[];
  countdown: {
    enabled: boolean;
    mode: "looping" | "fixed";
    loopHours: number;
    label: string;
    targetDate?: string;
  };
  popularVariantId: string;
  popularBadgeText: string;
  packageBenefits: { image: string; icon: string; title: string }[];
  logo?: string;
  navLabels: {
    hero: string;
    features: string;
    variants: string;
    delivery: string;
    reviews: string;
    contact: string;
  };
  navAnchors: {
    hero: string;
    features: string;
    variants: string;
    delivery: string;
    reviews: string;
    contact: string;
  };
  footerImage?: string;
}

const DEFAULT_FORM: LandingPageForm = {
  name: "",
  slug: "",
  productId: "",
  productSlug: "",
  whatsappNumber: "01700000000",
  isActive: true,
  theme: {
    primaryColor: "#16a34a",
    secondaryColor: "#ea580c",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
  },
  hero: {
    title: "গাছ-পাকা সেরা গোবিন্দভোগ আম",
    subtitle: "সরাসরি বাগান থেকে আপনার ঘরে",
    badgeText: "",
    heroImage: "/demo/hero-mango.png",
    ctaButtonText: "এখনই অর্ডার করুন",
    whatsappButtonText: "হোয়াটসঅ্যাপ অর্ডার",
    trustBadges: [
      "১০০% কার্বাইডমুক্ত",
      "সরাসরি বাগান থেকে",
      "ফ্রেশ ও সুস্বাদু",
      "বড় ফল রিপ্লেসমেন্ট",
    ],
    stats: [
      { icon: "users", title: "5000+", subtitle: "সন্তুষ্ট গ্রাহক" },
      { icon: "clock", title: "24-48 ঘণ্টার", subtitle: "ডেলিভারি" },
      { icon: "banknote", title: "টাকা পরিশোধ করুন", subtitle: "হাতে পেয়ে" },
    ],
  },
  problemSolution: {
    sectionTitle: "সমস্যা নয়, সমাধান দিন",
    problem: {
      title: "বাজারে যেসব সমস্যা",
      image: "/demo/problem-mango.png",
      items: [
        "কার্বাইড বা কেমিক্যাল দিয়ে পাকানো আম",
        "বাসি ও পঁচা আম",
        "অস্বাস্থ্যকর প্রক্রিয়ায় ও ভেজাল পণ্য",
        "স্বাদ ও সুঘ্রাণ মিলছে না",
      ],
    },
    solution: {
      title: "আমাদের সমাধান",
      image: "/demo/solution-mango.png",
      items: [
        "গাছপাকা আম সরাসরি বাগান থেকে",
        "১০০% প্রাকৃতিক ও কার্বাইডমুক্ত",
        "অর্ডার অনুযায়ী প্যাকিং ও ডেলিভারি",
        "সেরা স্বাদ ও মানের নিশ্চয়তা",
      ],
    },
  },
  whyUsTitle: "কেন আমাদের আম সেরা?",
  features: [
    {
      image: "/demo/mango-selection.png",
      icon: "leaf",
      title: "প্রাকৃতিকভাবে পাকা",
      description:
        "প্রাকৃতিকভাবে গাছে পাকানো আম, কোন কেমিক্যাল ব্যবহার করা হয় না",
    },
    {
      image: "/demo/mango-selection.png",
      icon: "star",
      title: "সেরা মানের নিশ্চয়তা",
      description: "সাবধানে নির্বাচন করা সেরা মানের আম পাঠানো হয়",
    },
    {
      image: "/demo/mango-packaging.png",
      icon: "package",
      title: "প্রিমিয়াম প্যাকেজিং",
      description: "আম সুরক্ষিত রাখার বিশেষ প্যাকেজিং করা হয়",
    },
    {
      image: "/demo/delivery-truck.png",
      icon: "truck",
      title: "দ্রুত ডেলিভারি",
      description: "২৪-৪৮ ঘণ্টার মধ্যে সারা দেশে ডেলিভারি",
    },
  ],
  variantsSectionTitle: "আমাদের প্যাকেজ সমূহ",
  reviewsSectionTitle: "সন্তুষ্ট গ্রাহকদের মতামত",
  deliveryGuarantee: {
    sectionTitle: "ডেলিভারি ও গ্যারান্টি",
    items: [
      { image: "/demo/delivery-truck.png", icon: "truck", title: "ঢাকা শহরে হোম ডেলিভারি" },
      { image: "/demo/mango-selection.png", icon: "clock", title: "২৪-৪৮ ঘণ্টার মধ্যে ডেলিভারি" },
      { image: "/demo/mango-footer.png", icon: "shield", title: "নষ্ট হলে রিপ্লেসমেন্ট গ্যারান্টি" },
      { image: "/demo/mango-basket.png", icon: "banknote", title: "Cash on Delivery" },
    ],
  },
  customReviews: [
    {
      name: "জামিল উদ্দিন",
      location: "বনানী, ঢাকা",
      rating: 5,
      review: "আম এর মিষ্টি এবং ঘ্রাণে সবাই খুভই খুশি। প্যাকিং অনেক ভালো ছিলো।",
      avatar: "/demo/avatar-male.png",
    },
    {
      name: "কানিজ ফাতেমা",
      location: "উত্তরা, ঢাকা",
      rating: 5,
      review:
        "অনেক স্বাদ একদম ফ্রেশ আম পেয়েছি। অনেক ধন্যবাদ ভালো পণ্য দেওয়ার জন্য।",
      avatar: "/demo/avatar-female.png",
    },
  ],
  countdown: {
    enabled: true,
    mode: "looping",
    loopHours: 24,
    label: "সীমিত স্টক! আজই অর্ডার করুন",
  },
  footerImage: "/demo/mango-footer.png",
  popularVariantId: "",
  popularBadgeText: "সবচেয়ে জনপ্রিয়",
  packageBenefits: [
    { image: "/demo/delivery-truck.png", icon: "truck", title: "ঢাকা শহরে হোম ডেলিভারি" },
    { image: "/demo/mango-selection.png", icon: "clock", title: "২৪-৪৮ ঘণ্টার মধ্যে ডেলিভারি" },
    { image: "/demo/mango-footer.png", icon: "shield", title: "নষ্ট হলে রিপ্লেসমেন্ট গ্যারান্টি" },
    { image: "/demo/mango-basket.png", icon: "banknote", title: "Cash on Delivery" },
  ],
  logo: "/demo/logo.png",
  navLabels: {
    hero: "হোম",
    features: "আমাদের পণ্য",
    variants: "মূল্য তালিকা",
    delivery: "ডেলিভারি",
    reviews: "রিভিউ",
    contact: "যোগাযোগ",
  },
  navAnchors: {
    hero: "hero",
    features: "features",
    variants: "variants",
    delivery: "delivery",
    reviews: "reviews",
    contact: "contact",
  },
};

// Collapsible section component
function Section({
  title,
  children,
  defaultOpen = true,
  anchorId,
  onAnchorIdChange,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  anchorId?: string;
  onAnchorIdChange?: (val: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between bg-muted/30 px-4 py-3 border-b">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex-1 flex items-center gap-2 font-semibold text-left text-sm"
        >
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          {title}
        </button>
        {onAnchorIdChange && (
          <div className="flex items-center gap-2 ml-4">
            <Label className="text-[10px] uppercase tracking-wider font-bold whitespace-nowrap text-muted-foreground">
              Section ID:
            </Label>
            <div className="flex items-center">
              <span className="text-muted-foreground text-xs mr-0.5">#</span>
              <Input
                value={anchorId}
                onChange={(e) =>
                  onAnchorIdChange(e.target.value.replace(/[^a-z0-9-]/gi, ""))
                }
                className="h-7 w-28 text-xs bg-background border-muted-foreground/20 focus-visible:ring-[#1E8896]"
                placeholder="e.g. home"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </div>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

interface RawLandingPageData extends Omit<LandingPageForm, "productId"> {
  _id?: string;
  productId: string | { _id: string; [key: string]: unknown };
  // Legacy fields for mapping
  problemTitle?: string;
  problems?: string[];
  solutionTitle?: string;
  solutions?: string[];
}

interface Props {
  initialData?: RawLandingPageData;
  isEditing?: boolean;
}

export default function LandingPageBuilder({ initialData, isEditing }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<LandingPageForm>(() => {
    if (!initialData) return DEFAULT_FORM;
    const rawProductId = initialData.productId;
    const productId =
      typeof rawProductId === "object" && rawProductId !== null
        ? rawProductId._id
        : rawProductId;

    const isPlaceholder = (url?: string | null) =>
      !url ||
      url.includes("placeholder.png") ||
      url.includes("placeholder.jpg");

    const getMergedArray = <T extends { image?: string; avatar?: string }>(
      arr: T[] | undefined,
      defaultArr: T[],
    ) => {
      if (!arr || arr.length === 0) return defaultArr;
      // If the array has items but they all use placeholders, fallback to default
      const hasRealImages = arr.some(
        (item) => !isPlaceholder(item.image || item.avatar),
      );
      if (!hasRealImages) return defaultArr;
      return arr;
    };

    return {
      ...DEFAULT_FORM,
      ...initialData,
      productId: productId as string,
      theme: { 
        ...DEFAULT_FORM.theme, 
        ...initialData.theme,
        primaryColor: (initialData.theme?.primaryColor && initialData.theme.primaryColor !== "#16a34a") 
          ? initialData.theme.primaryColor 
          : DEFAULT_FORM.theme.primaryColor 
      },
      hero: { 
        ...DEFAULT_FORM.hero, 
        ...initialData.hero,
        heroImage: isPlaceholder(initialData.hero?.heroImage) 
          ? DEFAULT_FORM.hero.heroImage 
          : initialData.hero.heroImage 
      },
      problemSolution: {
        ...DEFAULT_FORM.problemSolution,
        ...initialData.problemSolution,
        problem: {
          ...DEFAULT_FORM.problemSolution.problem,
          ...(initialData.problemSolution?.problem || {}),
          image: isPlaceholder(initialData.problemSolution?.problem?.image)
            ? DEFAULT_FORM.problemSolution.problem.image
            : initialData.problemSolution.problem.image,
        },
        solution: {
          ...DEFAULT_FORM.problemSolution.solution,
          ...(initialData.problemSolution?.solution || {}),
          image: isPlaceholder(initialData.problemSolution?.solution?.image)
            ? DEFAULT_FORM.problemSolution.solution.image
            : initialData.problemSolution.solution.image,
        },
      },
      whyUsTitle: initialData.whyUsTitle || DEFAULT_FORM.whyUsTitle,
      features: getMergedArray(initialData.features, DEFAULT_FORM.features),
      deliveryGuarantee: {
        ...DEFAULT_FORM.deliveryGuarantee,
        ...initialData.deliveryGuarantee,
        items: getMergedArray(initialData.deliveryGuarantee?.items, DEFAULT_FORM.deliveryGuarantee.items),
      },
      customReviews: getMergedArray(initialData.customReviews, DEFAULT_FORM.customReviews),
      countdown: { ...DEFAULT_FORM.countdown, ...initialData.countdown },
      popularVariantId: initialData.popularVariantId || DEFAULT_FORM.popularVariantId,
      popularBadgeText: initialData.popularBadgeText || DEFAULT_FORM.popularBadgeText,
      packageBenefits: getMergedArray(initialData.packageBenefits, DEFAULT_FORM.packageBenefits),
      navLabels: {
        ...DEFAULT_FORM.navLabels,
        ...(typeof initialData.navLabels === "object" ? initialData.navLabels : {}),
      },
      navAnchors: {
        ...DEFAULT_FORM.navAnchors,
        ...(typeof initialData.navAnchors === "object" ? initialData.navAnchors : {}),
      },
      footerImage: isPlaceholder(initialData.footerImage) ? DEFAULT_FORM.footerImage : initialData.footerImage,
      logo: isPlaceholder(initialData.logo) ? DEFAULT_FORM.logo : initialData.logo,
    };
  });
  const [saving, setSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // File states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [problemFile, setProblemFile] = useState<File | null>(null);
  const [solutionFile, setSolutionFile] = useState<File | null>(null);
  const [reviewFiles, setReviewFiles] = useState<{
    [key: number]: File | null;
  }>({});
  const [featureFiles, setFeatureFiles] = useState<{
    [key: number]: File | null;
  }>({});
  const [deliveryFiles, setDeliveryFiles] = useState<{
    [key: number]: File | null;
  }>({});
  const [packageFiles, setPackageFiles] = useState<{
    [key: number]: File | null;
  }>({});

  // Fetch all products for the selector
  const { data: productsData } = useSWR("/products/all", fetcher);
  const products: Product[] = productsData?.data || [];

  // When a product is selected, fetch its full data (with variants)
  const fetchProductDetails = useCallback(async (slug: string) => {
    try {
      const res = await api.get(`/products/slug/${slug}`);
      const p: Product = res.data?.data;
      setSelectedProduct(p);
      // Pre-fill hero title/subtitle from product name if empty
      setForm((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          title: prev.hero.title || p.name,
          heroImage: prev.hero.heroImage || p.thumbnail || "",
        },
      }));
    } catch {
      toast.error("Failed to load product details");
    }
  }, []);

  useEffect(() => {
    if (form.productSlug) {
      fetchProductDetails(form.productSlug);
    }
  }, [form.productSlug, fetchProductDetails]);

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;
    setForm((prev) => ({
      ...prev,
      productId,
      productSlug: product.slug,
    }));
  };

  const setField = <K extends keyof LandingPageForm>(
    key: K,
    value: LandingPageForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setNestedField = (
    section:
      | "hero"
      | "problemSolution"
      | "countdown"
      | "deliveryGuarantee"
      | "theme",
    key: string,
    value: unknown,
  ) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as object), [key]: value },
    }));
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setField("name", name);
    if (!isEditing) {
      setField(
        "slug",
        name
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim(),
      );
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.productId || !form.slug) {
      toast.error("Please fill in Name, Product, and Slug");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      // Add all form fields as JSON except files
      formData.append("name", form.name);
      formData.append("slug", form.slug);
      formData.append("productId", form.productId);
      formData.append("productSlug", form.productSlug);
      formData.append("whatsappNumber", form.whatsappNumber);
      formData.append("isActive", String(form.isActive));
      formData.append("theme", JSON.stringify(form.theme));
      formData.append("hero", JSON.stringify(form.hero));
      formData.append("problemSolution", JSON.stringify(form.problemSolution));
      formData.append("whyUsTitle", form.whyUsTitle);
      formData.append("features", JSON.stringify(form.features));
      formData.append("variantsSectionTitle", form.variantsSectionTitle);
      formData.append("reviewsSectionTitle", form.reviewsSectionTitle);
      formData.append("customReviews", JSON.stringify(form.customReviews));
      formData.append(
        "deliveryGuarantee",
        JSON.stringify(form.deliveryGuarantee),
      );
      formData.append("countdown", JSON.stringify(form.countdown));
      formData.append("packageBenefits", JSON.stringify(form.packageBenefits));
      formData.append("navLabels", JSON.stringify(form.navLabels));
      formData.append("navAnchors", JSON.stringify(form.navAnchors));
      formData.append("popularVariantId", form.popularVariantId);
      formData.append("popularBadgeText", form.popularBadgeText);

      if (logoFile) formData.append("logo", logoFile);
      if (heroFile) formData.append("heroImage", heroFile);
      if (problemFile) formData.append("problemImage", problemFile);
      if (solutionFile) formData.append("solutionImage", solutionFile);

      // Add review avatars
      Object.entries(reviewFiles).forEach(([index, file]) => {
        if (file) {
          formData.append(`reviewAvatar_${index}`, file);
        }
      });

      // Add feature images
      Object.entries(featureFiles).forEach(([index, file]) => {
        if (file) {
          formData.append(`featureImage_${index}`, file);
        }
      });

      // Add delivery images
      Object.entries(deliveryFiles).forEach(([index, file]) => {
        if (file) {
          formData.append(`deliveryImage_${index}`, file);
        }
      });
      // Add package benefits images
      Object.entries(packageFiles).forEach(([index, file]) => {
        if (file) {
          formData.append(`packageBenefitImage_${index}`, file);
        }
      });
      if (isEditing && initialData?._id) {
        await api.patch(`/landing-pages/${initialData._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Landing page updated!");
        mutate(`/landing-pages/${initialData._id}`);
        setReviewFiles({}); // Clear temporary file state
        setFeatureFiles({});
        setDeliveryFiles({});
        setPackageFiles({});
        return; // Don't redirect on update
      } else {
        await api.post("/landing-pages", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Landing page created!");
      }
      router.push("/dashboard/marketing/landing-pages");
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : "Failed to save";
      toast.error(msg || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const updateListItem = (
    section: "problem" | "solution",
    index: number,
    value: string,
  ) => {
    const items = [...form.problemSolution[section].items];
    items[index] = value;
    setNestedField("problemSolution", section, {
      ...form.problemSolution[section],
      items,
    });
  };

  const addListItem = (section: "problem" | "solution") => {
    setNestedField("problemSolution", section, {
      ...form.problemSolution[section],
      items: [...form.problemSolution[section].items, ""],
    });
  };

  const removeListItem = (section: "problem" | "solution", index: number) => {
    setNestedField("problemSolution", section, {
      ...form.problemSolution[section],
      items: form.problemSolution[section].items.filter((_, i) => i !== index),
    });
  };

  const updateFeature = (
    index: number,
    key: "icon" | "title" | "description" | "image",
    value: string,
  ) => {
    const features = [...form.features];
    features[index] = { ...features[index], [key]: value };
    setField("features", features);
  };

  const addFeature = () => {
    setField("features", [
      ...form.features,
      { image: "", icon: "leaf", title: "", description: "" },
    ]);
  };

  const removeFeature = (index: number) => {
    setField(
      "features",
      form.features.filter((_, i) => i !== index),
    );
    setFeatureFiles((prev) => {
      const next: { [key: number]: File | null } = {};
      Object.entries(prev).forEach(([key, file]) => {
        const k = parseInt(key);
        if (k < index) next[k] = file;
        else if (k > index) next[k - 1] = file;
      });
      return next;
    });
  };

  const updatePackageBenefit = (
    index: number,
    key: "icon" | "title" | "image",
    value: string,
  ) => {
    const benefits = [...form.packageBenefits];
    benefits[index] = { ...benefits[index], [key]: value };
    setField("packageBenefits", benefits);
  };

  const addPackageBenefitAction = () => {
    setField("packageBenefits", [
      ...form.packageBenefits,
      { image: "", icon: "star", title: "" },
    ]);
  };

  const removePackageBenefitAction = (index: number) => {
    setField(
      "packageBenefits",
      form.packageBenefits.filter((_, i) => i !== index),
    );
    setPackageFiles((prev) => {
      const next: { [key: number]: File | null } = {};
      Object.entries(prev).forEach(([key, file]) => {
        const k = parseInt(key);
        if (k < index) next[k] = file;
        else if (k > index) next[k - 1] = file;
      });
      return next;
    });
  };

  const updateTrustBadge = (index: number, value: string) => {
    const badges = [...form.hero.trustBadges];
    badges[index] = value;
    setNestedField("hero", "trustBadges", badges);
  };

  const updateHeroStat = (
    index: number,
    field: "icon" | "title" | "subtitle",
    value: string,
  ) => {
    const stats = [...form.hero.stats];
    stats[index] = { ...stats[index], [field]: value };
    setNestedField("hero", "stats", stats);
  };

  const updateDeliveryItem = (
    index: number,
    key: "icon" | "title" | "image",
    value: string,
  ) => {
    const items = [...form.deliveryGuarantee.items];
    items[index] = { ...items[index], [key]: value };
    setNestedField("deliveryGuarantee", "items", items);
  };

  const addDeliveryItemAction = () => {
    setNestedField("deliveryGuarantee", "items", [
      ...form.deliveryGuarantee.items,
      { image: "", icon: "truck", title: "" },
    ]);
  };

  const removeDeliveryItemAction = (index: number) => {
    setNestedField(
      "deliveryGuarantee",
      "items",
      form.deliveryGuarantee.items.filter((_, i) => i !== index),
    );
    setDeliveryFiles((prev) => {
      const next: { [key: number]: File | null } = {};
      Object.entries(prev).forEach(([key, file]) => {
        const k = parseInt(key);
        if (k < index) next[k] = file;
        if (k > index) next[k - 1] = file;
      });
      return next;
    });
  };

  const addReview = () => {
    setField("customReviews", [
      ...form.customReviews,
      { name: "", location: "", rating: 5, review: "", avatar: "" },
    ]);
  };

  const removeReview = (index: number) => {
    setField(
      "customReviews",
      form.customReviews.filter((_, i) => i !== index),
    );
  };

  const updateReview = (index: number, key: string, value: string | number) => {
    const reviews = [...form.customReviews];
    reviews[index] = { ...reviews[index], [key]: value };
    setField("customReviews", reviews);
  };

  return (
    <div className="w-full p-6 space-y-6">
      {/* Top bar */}
      <div className="sticky top-14 z-100 bg-background/80 backdrop-blur-md py-4 border-b -mx-6 px-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">
            {isEditing ? "Edit Landing Page" : "Create Landing Page"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure? This will replace all your current content with professional demo data.")) {
                setForm(DEFAULT_FORM);
                toast.success("Professional demo data seeded!");
              }
            }}
            className="hidden sm:flex gap-2 border-[#1E8896]/20 hover:bg-[#1E8896]/5 text-[#1E8896]"
          >
            <Wand2 className="h-4 w-4" />
            Seed Demo Data
          </Button>

          {isEditing && initialData && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/lp/${form.slug}`, "_blank")}
              className="gap-2"
            >
              <Eye className="h-4 w-4" /> Preview
            </Button>
          )}
          <Button
            onClick={handleSave}
            loading={saving}
            className="bg-[#1E8896] hover:bg-[#166d78] gap-2"
          >
            <Save className="h-4 w-4" />
            {isEditing ? "Update" : "Publish"}
          </Button>
        </div>
      </div>

      {/* Basic Settings */}
      <Section title="📝 Basic Settings">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Landing Page Name *</Label>
            <Input
              placeholder="e.g. Gobindabhog Mango 2026"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>URL Slug *</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/lp/</span>
              <Input
                placeholder="gobindabhog-mango"
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Label>Select Product *</Label>
          <Select value={form.productId} onValueChange={handleProductChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a product..." />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p._id} value={p._id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedProduct?.variants && selectedProduct.variants.length > 0 && (
            <p className="text-xs text-[#1E8896] mt-1">
              ✓ {selectedProduct.variants.length} variants detected — will
              auto-show as package cards
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>WhatsApp Number</Label>
            <Input
              placeholder="+8801700000000"
              value={form.whatsappNumber}
              onChange={(e) => setField("whatsappNumber", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => setField("isActive", v)}
              className="data-[state=checked]:bg-[#1E8896]"
            />
            <Label>Active (publicly visible)</Label>
          </div>
        </div>
      </Section>

      {/* Theme & Colors */}
      <Section title="🎨 Theme & Colors">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <Label>Primary Color (Buttons, Highlights)</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                className="w-12 h-10 p-1 cursor-pointer"
                value={form.theme.primaryColor}
                onChange={(e) =>
                  setNestedField("theme", "primaryColor", e.target.value)
                }
              />
              <Input
                value={form.theme.primaryColor}
                onChange={(e) =>
                  setNestedField("theme", "primaryColor", e.target.value)
                }
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Accent Color (Badges, Secondary)</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                className="w-12 h-10 p-1 cursor-pointer"
                value={form.theme.secondaryColor}
                onChange={(e) =>
                  setNestedField("theme", "secondaryColor", e.target.value)
                }
              />
              <Input
                value={form.theme.secondaryColor}
                onChange={(e) =>
                  setNestedField("theme", "secondaryColor", e.target.value)
                }
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                className="w-12 h-10 p-1 cursor-pointer"
                value={form.theme.backgroundColor}
                onChange={(e) =>
                  setNestedField("theme", "backgroundColor", e.target.value)
                }
              />
              <Input
                value={form.theme.backgroundColor}
                onChange={(e) =>
                  setNestedField("theme", "backgroundColor", e.target.value)
                }
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Text Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                className="w-12 h-10 p-1 cursor-pointer"
                value={form.theme.textColor}
                onChange={(e) =>
                  setNestedField("theme", "textColor", e.target.value)
                }
              />
              <Input
                value={form.theme.textColor}
                onChange={(e) =>
                  setNestedField("theme", "textColor", e.target.value)
                }
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Navigation Settings */}
      <Section title="🧭 Navigation" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Custom Logo (Fallback: Store Logo)</Label>
              <div className="flex flex-col gap-2">
                {(logoFile || form.logo) && (
                  <div className="relative w-32 h-16 border rounded bg-muted/50 flex items-center justify-center overflow-hidden">
                    <Image
                      src={
                        logoFile
                          ? URL.createObjectURL(logoFile)
                          : (form.logo as string)
                      }
                      alt="Logo Preview"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setLogoFile(file);
                  }}
                  className="max-w-sm"
                />
                <p className="text-xs text-muted-foreground">
                  If you don&apos;t upload a logo, the default store logo will
                  be used.
                </p>
              </div>
            </div>

            {/* Nav Labels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {(
                Object.keys(form.navLabels) as Array<
                  keyof typeof form.navLabels
                >
              ).map((key) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="capitalize">
                      {key.replace(/([A-Z])/g, " $1")} Nav Label
                    </Label>
                    <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Section ID
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <Input
                        value={form.navLabels[key]}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            navLabels: {
                              ...prev.navLabels,
                              [key]: e.target.value,
                            },
                          }))
                        }
                        placeholder={`e.g. ${key}`}
                      />
                    </div>
                    <div className="w-32 space-y-1">
                      <Input
                        value={form.navAnchors[key]}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            navAnchors: {
                              ...prev.navAnchors,
                              [key]: e.target.value.replace(/[^a-z0-9-]/gi, ""),
                            },
                          }))
                        }
                        placeholder="id"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    This link will scroll users to the section with ID:{" "}
                    <strong>#{form.navAnchors[key]}</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tip Card */}
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 border border-dashed rounded-lg">
              <p className="text-xs italic text-muted-foreground leading-relaxed">
                Tip: You can customize individual section labels in the headers
                of each section above (see the &quot;Nav Label&quot; input).
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Hero Section */}
      <Section
        title="🎯 Hero Section"
        anchorId={form.navAnchors.hero}
        onAnchorIdChange={(val: string) =>
          setForm((prev) => ({
            ...prev,
            navAnchors: { ...prev.navAnchors, hero: val },
          }))
        }
      >
        <div className="space-y-6">
          {/* Hero Image at the Top */}
          <div className="space-y-2">
            <Label>Hero Image (Banner)</Label>
            <div className="flex flex-col gap-2">
              {(heroFile || form.hero.heroImage) && (
                <div className="relative w-full aspect-21/9 border rounded bg-muted/50 flex items-center justify-center overflow-hidden group">
                  <Image
                    src={
                      heroFile
                        ? URL.createObjectURL(heroFile)
                        : form.hero.heroImage
                    }
                    alt="Hero Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setHeroFile(null);
                      setNestedField("hero", "heroImage", "");
                    }}
                    className="absolute top-2 right-2 p-1 bg-destructive/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setHeroFile(file);
                }}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Main Title (large text)</Label>
              <Textarea
                placeholder="গাছ-পাকা সেরা গোবিন্দভোগ আম"
                value={form.hero.title}
                onChange={(e) =>
                  setNestedField("hero", "title", e.target.value)
                }
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <Label>Subtitle</Label>
              <Textarea
                placeholder="সরাসরি বাগান থেকে আপনার ঘরে"
                value={form.hero.subtitle}
                onChange={(e) =>
                  setNestedField("hero", "subtitle", e.target.value)
                }
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>CTA Button Text</Label>
              <Input
                value={form.hero.ctaButtonText}
                onChange={(e) =>
                  setNestedField("hero", "ctaButtonText", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <Label>WhatsApp Button Text</Label>
              <Input
                value={form.hero.whatsappButtonText}
                onChange={(e) =>
                  setNestedField("hero", "whatsappButtonText", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Trust Badges (4 items)</Label>
          <div className="grid grid-cols-2 gap-2">
            {form.hero.trustBadges.map((badge, i) => (
              <Input
                key={i}
                value={badge}
                onChange={(e) => updateTrustBadge(i, e.target.value)}
                placeholder={`Badge ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="flex items-center justify-between">
            Hero Stats (3 items)
            <span className="text-[10px] text-muted-foreground uppercase font-bold">
              Social Proof Band
            </span>
          </Label>
          <div className="space-y-3">
            {form.hero.stats.map((stat, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-6 space-y-1">
                  <Label className="text-[10px]">Title</Label>
                  <Input
                    value={stat.title}
                    onChange={(e) => updateHeroStat(i, "title", e.target.value)}
                    placeholder="e.g. 5000+"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="col-span-6 space-y-1">
                  <Label className="text-[10px]">Subtitle</Label>
                  <Input
                    value={stat.subtitle}
                    onChange={(e) =>
                      updateHeroStat(i, "subtitle", e.target.value)
                    }
                    placeholder="e.g. Happy Customers"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Problem / Solution */}
      <Section
        title="⚖️ Problem / Solution Section"
        defaultOpen={false}
        anchorId={form.navAnchors.features}
        onAnchorIdChange={(val: string) =>
          setForm((prev) => ({
            ...prev,
            navAnchors: { ...prev.navAnchors, features: val },
          }))
        }
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Section Title</Label>
            <Input
              value={form.problemSolution.sectionTitle}
              onChange={(e) =>
                setNestedField(
                  "problemSolution",
                  "sectionTitle",
                  e.target.value,
                )
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {(["problem", "solution"] as const).map((section) => (
              <div
                key={section}
                className="border rounded-lg p-4 space-y-4 bg-muted/20"
              >
                <div className="space-y-1">
                  <Label className="capitalize font-bold text-base">
                    {section} Card
                  </Label>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Card Title</Label>
                  <Input
                    value={form.problemSolution[section].title}
                    onChange={(e) => {
                      const updated = {
                        ...form.problemSolution[section],
                        title: e.target.value,
                      };
                      setNestedField("problemSolution", section, updated);
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Card Image</Label>
                  {form.problemSolution[section].image && (
                    <div className="relative w-20 h-20 mb-2 border rounded overflow-hidden bg-white">
                      <Image
                        src={form.problemSolution[section].image}
                        alt={section}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (section === "problem") setProblemFile(file);
                      else setSolutionFile(file);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">List Items</Label>
                  {form.problemSolution[section].items.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) =>
                          updateListItem(section, i, e.target.value)
                        }
                        placeholder={`Item ${i + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeListItem(section, i)}
                        className="shrink-0 h-10 w-10"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addListItem(section)}
                    className="gap-1 w-full"
                  >
                    <Plus className="h-3 w-3" /> Add Item
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Why Us / Features */}
      <Section
        title={`✨ Why Us Features (${form.features.length} cards)`}
        defaultOpen={false}
        anchorId={form.navAnchors.features}
        onAnchorIdChange={(val: string) =>
          setForm((prev) => ({
            ...prev,
            navAnchors: { ...prev.navAnchors, features: val },
          }))
        }
      >
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1 flex-1 mr-4">
            <Label>Section Title</Label>
            <Input
              value={form.whyUsTitle}
              onChange={(e) => setField("whyUsTitle", e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addFeature}
            className="mt-6"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Card
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {form.features.map((feature, i) => (
            <div
              key={i}
              className="border rounded-lg p-3 space-y-2 relative group"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                onClick={() => removeFeature(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Badge variant="secondary" className="text-xs">
                Card {i + 1}
              </Badge>

              <div className="space-y-1">
                <Label className="text-xs">Card Image</Label>
                {feature.image && (
                  <div className="relative w-16 h-16 mb-2 border rounded overflow-hidden">
                    <Image
                      src={feature.image}
                      alt="feature"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFeatureFiles((prev) => ({ ...prev, [i]: file }));
                  }}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input
                  value={feature.title}
                  onChange={(e) => updateFeature(i, "title", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Input
                  value={feature.description}
                  onChange={(e) =>
                    updateFeature(i, "description", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Variants Section Title */}
      <Section
        title="📦 Variants / Packages Section"
        defaultOpen={false}
        anchorId={form.navAnchors.variants}
        onAnchorIdChange={(val: string) =>
          setForm((prev) => ({
            ...prev,
            navAnchors: { ...prev.navAnchors, variants: val },
          }))
        }
      >
        <div className="space-y-1">
          <Label>Section Title</Label>
          <Input
            value={form.variantsSectionTitle}
            onChange={(e) => setField("variantsSectionTitle", e.target.value)}
          />
        </div>
        {selectedProduct?.variants && selectedProduct.variants.length > 0 ? (
          <div className="mt-3 space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {selectedProduct.variants.map((v) => {
                const vName =
                  v.attributes && v.attributes.length > 0
                    ? v.attributes.map((a) => a.value).join(" ")
                    : v.name || "Unnamed Variant";
                return (
                  <div
                    key={v._id}
                    className={`border rounded p-3 text-sm flex justify-between items-center ${
                      form.popularVariantId === v._id
                        ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500"
                        : "bg-muted/30"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-base">{vName}</p>
                      <p className="text-muted-foreground">
                        ৳{v.sale_price || v.regular_price}
                      </p>
                    </div>
                    {form.popularVariantId === v._id && (
                      <Badge
                        variant="secondary"
                        className="bg-amber-500 text-white hover:bg-amber-600 border-none"
                      >
                        Highlighted
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Most Popular Badge Text</Label>
                  <Input
                    value={form.popularBadgeText}
                    onChange={(e) =>
                      setField("popularBadgeText", e.target.value)
                    }
                    placeholder="e.g. সবচেয়ে জনপ্রিয়"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Highlight Variant</Label>
                  <Select
                    value={form.popularVariantId || "none"}
                    onValueChange={(val) =>
                      setField("popularVariantId", val === "none" ? "" : val)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a variant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No highlight</SelectItem>
                      {selectedProduct.variants.map((v) => {
                        const vName =
                          v.attributes && v.attributes.length > 0
                            ? v.attributes.map((a) => a.value).join(" ")
                            : v.name || "Unnamed Variant";
                        return (
                          <SelectItem key={v._id} value={v._id}>
                            {vName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Package Benefits Sub-section */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">
                  Package Benefits (Bottom Icons)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPackageBenefitAction}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Benefit
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {form.packageBenefits.map((item, i) => (
                  <div
                    key={i}
                    className="border rounded-lg p-3 space-y-2 relative group bg-muted/20"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePackageBenefitAction(i)}
                    >
                      <X className="h-3 w-3" />
                    </Button>

                    <div className="space-y-1">
                      <Label className="text-xs">Benefit Icon/Image</Label>
                      {item.image && (
                        <div className="relative w-12 h-12 mb-2 border rounded overflow-hidden bg-white">
                          <Image
                            src={item.image}
                            alt="benefit"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setPackageFiles((prev) => ({ ...prev, [i]: file }));
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Benefit Title</Label>
                      <Input
                        value={item.title}
                        onChange={(e) =>
                          updatePackageBenefit(i, "title", e.target.value)
                        }
                        placeholder="e.g. ২-৩ দিনে ডেলিভারি"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-2">
            Select a product with variants to see them here. They will
            auto-populate on the landing page.
          </p>
        )}
      </Section>

      {/* Delivery & Guarantee */}
      <Section
        title={`🚚 Delivery & Guarantee Section (${form.deliveryGuarantee.items.length} items)`}
        defaultOpen={false}
        anchorId={form.navAnchors.delivery}
        onAnchorIdChange={(val: string) =>
          setForm((prev) => ({
            ...prev,
            navAnchors: { ...prev.navAnchors, delivery: val },
          }))
        }
      >
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1 flex-1 mr-4">
            <Label>Section Title</Label>
            <Input
              value={form.deliveryGuarantee.sectionTitle}
              onChange={(e) =>
                setNestedField(
                  "deliveryGuarantee",
                  "sectionTitle",
                  e.target.value,
                )
              }
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDeliveryItemAction}
            className="mt-6"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {form.deliveryGuarantee.items.map((item, i) => (
            <div
              key={i}
              className="border rounded-lg p-3 space-y-2 relative group"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                onClick={() => removeDeliveryItemAction(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Badge variant="secondary" className="text-xs">
                Item {i + 1}
              </Badge>

              <div className="space-y-1">
                <Label className="text-xs">Card Image</Label>
                {item.image && (
                  <div className="relative w-16 h-16 mb-2 border rounded overflow-hidden">
                    <Image
                      src={item.image}
                      alt="delivery"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setDeliveryFiles((prev) => ({ ...prev, [i]: file }));
                  }}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input
                  value={item.title}
                  onChange={(e) =>
                    updateDeliveryItem(i, "title", e.target.value)
                  }
                  placeholder="Label text"
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Reviews */}
      <Section
        title="⭐ Reviews Section"
        defaultOpen={false}
        anchorId={form.navAnchors.reviews}
        onAnchorIdChange={(val: string) =>
          setForm((prev) => ({
            ...prev,
            navAnchors: { ...prev.navAnchors, reviews: val },
          }))
        }
      >
        <div className="space-y-1">
          <Label>Section Title</Label>
          <Input
            value={form.reviewsSectionTitle}
            onChange={(e) => setField("reviewsSectionTitle", e.target.value)}
          />
        </div>

        <div className="space-y-4 pt-4 border-t mt-4">
          <Label className="text-sm font-bold flex items-center gap-2">
            <Plus className="h-4 w-4" /> Custom Testimonials
          </Label>
          <div className="grid grid-cols-1 gap-4">
            {form.customReviews?.map((review, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 space-y-3 bg-muted/20 relative"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => removeReview(i)}
                  className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Customer Name</Label>
                    <Input
                      value={review.name}
                      onChange={(e) => updateReview(i, "name", e.target.value)}
                      placeholder="e.g. Rakib Uddin"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Location</Label>
                    <Input
                      value={review.location}
                      onChange={(e) =>
                        updateReview(i, "location", e.target.value)
                      }
                      placeholder="e.g. Dhanmondi, Dhaka"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Rating (1-5)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={review.rating}
                      onChange={(e) =>
                        updateReview(i, "rating", Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Customer Avatar</Label>
                    <div className="flex items-center gap-3">
                      {(reviewFiles[i] || review.avatar) && (
                        <div className="relative w-10 h-10 shrink-0 border rounded-full overflow-hidden">
                          <Image
                            src={
                              reviewFiles[i]
                                ? URL.createObjectURL(reviewFiles[i]!)
                                : review.avatar
                            }
                            alt="Preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setReviewFiles((prev) => ({
                                ...prev,
                                [i]: null,
                              }));
                              updateReview(i, "avatar", "");
                            }}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file)
                            setReviewFiles((prev) => ({ ...prev, [i]: file }));
                        }}
                        className="h-10 cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#1E8896] file:text-white hover:file:bg-[#166d78]"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Select a picture to upload.
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Review Text</Label>
                  <Textarea
                    value={review.review}
                    onChange={(e) => updateReview(i, "review", e.target.value)}
                    placeholder="Write the review here..."
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed gap-2"
            onClick={addReview}
          >
            <Plus className="h-4 w-4" /> Add Custom Review
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4 italic">
          Tip: These reviews will be merged with the automatically fetched
          product reviews on the landing page.
        </p>
      </Section>

      {/* Countdown Timer */}
      <Section title="⏱️ Countdown Timer" defaultOpen={false}>
        <div className="flex items-center gap-3">
          <Switch
            checked={form.countdown.enabled}
            onCheckedChange={(v) => setNestedField("countdown", "enabled", v)}
            className="data-[state=checked]:bg-[#1E8896]"
          />
          <Label>Enable Countdown Timer</Label>
        </div>

        {form.countdown.enabled && (
          <div className="space-y-3 mt-3">
            <div className="space-y-1">
              <Label>Countdown Label</Label>
              <Input
                value={form.countdown.label}
                onChange={(e) =>
                  setNestedField("countdown", "label", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Mode</Label>
              <Select
                value={form.countdown.mode}
                onValueChange={(v) =>
                  setNestedField("countdown", "mode", v as "looping" | "fixed")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="looping">
                    Looping (resets every N hours — urgency)
                  </SelectItem>
                  <SelectItem value="fixed">
                    Fixed (counts to a specific date/time)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.countdown.mode === "looping" ? (
              <div className="space-y-1">
                <Label>Reset every (hours)</Label>
                <Input
                  type="number"
                  min={1}
                  max={168}
                  value={form.countdown.loopHours}
                  onChange={(e) =>
                    setNestedField(
                      "countdown",
                      "loopHours",
                      Number(e.target.value),
                    )
                  }
                />
              </div>
            ) : (
              <div className="space-y-1">
                <Label>Target Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={form.countdown.targetDate || ""}
                  onChange={(e) =>
                    setNestedField("countdown", "targetDate", e.target.value)
                  }
                />
              </div>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}
