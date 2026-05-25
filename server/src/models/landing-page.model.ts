import { Schema, model, Types } from "mongoose";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";

const FeatureSchema = new Schema(
  {
    image: { type: String, default: "" },
    icon: { type: String, default: "leaf" }, // icon name key
    title: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const HeroSchema = new Schema(
  {
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    badgeText: { type: String, default: "" },
    heroImage: { type: String, default: "" }, // custom hero image URL
    ctaButtonText: { type: String, default: "এখনই অর্ডার করুন" },
    whatsappButtonText: { type: String, default: "হোয়াটসঅ্যাপ অর্ডার" },
    trustBadges: { type: [String], default: ["১০০% অর্গানিক", "দ্রুত ডেলিভারি", "নিরাপদ পেমেন্ট", "নই হলে ১০০% রিফান্ড"] },
    stats: {
      type: [
        {
          icon: { type: String, default: "users" },
          title: { type: String, default: "" },
          subtitle: { type: String, default: "" },
          _id: false,
        },
      ],
      default: [
        { icon: "users", title: "5000+", subtitle: "সন্তুষ্ট গ্রাহক" },
        { icon: "clock", title: "24-48 ঘণ্টার", subtitle: "ডেলিভারি" },
        { icon: "banknote", title: "টাকা পরিশোধ করুন", subtitle: "হাতে পেয়ে" },
      ],
    },
  },
  { _id: false }
);

const ProblemSolutionSchema = new Schema(
  {
    sectionTitle: { type: String, default: "সমস্যা নয়, সমাধান দিন" },
    problem: {
      title: { type: String, default: "বাজারের যেসব সমস্যা" },
      image: { type: String, default: "" },
      items: { type: [String], default: [] },
    },
    solution: {
      title: { type: String, default: "আমাদের সমাধান" },
      image: { type: String, default: "" },
      items: { type: [String], default: [] },
    },
  },
  { _id: false }
);

const DeliveryGuaranteeSchema = new Schema(
  {
    sectionTitle: { type: String, default: "ডেলিভারি ও গ্যারান্টি" },
    items: {
      type: [
        {
          image: { type: String, default: "" },
          icon: String,
          title: String,
          _id: false,
        },
      ],
      default: [
        { icon: "truck", title: "ঢাকার বাইরে হোম ডেলিভারি" },
        { icon: "clock", title: "২৪-৪৮ ঘণ্টায় ডেলিভারি" },
        { icon: "shield", title: "নই হলে ফ্রিতে ফেরত" },
        { icon: "banknote", title: "Cash on Delivery" },
      ],
    },
  },
  { _id: false }
);

const CountdownSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    mode: { type: String, enum: ["looping", "fixed"], default: "looping" },
    targetDate: { type: Date, default: null },
    loopHours: { type: Number, default: 24 },
    label: { type: String, default: "সীমিত স্টক! আজই অর্ডার করুন" },
  },
  { _id: false }
);

const CustomReviewSchema = new Schema(
  {
    name: { type: String, default: "" },
    location: { type: String, default: "" },
    rating: { type: Number, default: 5 },
    review: { type: String, default: "" },
    avatar: { type: String, default: "" },
  },
  { _id: false }
);

export interface ILandingPage {
  storeId: Types.ObjectId;
  productId: Types.ObjectId;
  productSlug: string;
  name: string;
  slug: string;
  isActive: boolean;
  whatsappNumber: string;
  logo?: string;
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
  features: { image: string; icon: string; title: string; description: string }[];
  variantsSectionTitle: string;
  deliveryGuarantee: {
    sectionTitle: string;
    items: { image: string; icon: string; title: string }[];
  };
  reviewsSectionTitle: string;
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
    targetDate?: Date | null;
    loopHours: number;
    label: string;
  };
  popularVariantId: string;
  popularBadgeText: string;
  packageBenefits: { image: string; icon: string; title: string }[];
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
}

const LandingPageSchema = new Schema<ILandingPage>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productSlug: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    isActive: { type: Boolean, default: true },
    whatsappNumber: { type: String, default: "" },
    logo: { type: String, default: "" },
    theme: {
      primaryColor: { type: String, default: "#16a34a" }, // green-600
      secondaryColor: { type: String, default: "#ea580c" }, // orange-600
      backgroundColor: { type: String, default: "#ffffff" },
      textColor: { type: String, default: "#1f2937" }, // gray-800
    },
    hero: { type: HeroSchema, default: () => ({}) },
    problemSolution: { type: ProblemSolutionSchema, default: () => ({}) },
    whyUsTitle: { type: String, default: "কেন আমাদের পণ্য সেরা?" },
    features: { type: [FeatureSchema], default: () => [] },
    variantsSectionTitle: { type: String, default: "আমাদের প্যাকেজ সমূহ" },
    deliveryGuarantee: { type: DeliveryGuaranteeSchema, default: () => ({}) },
    reviewsSectionTitle: { type: String, default: "সন্তুষ্ট গ্রাহকদের মতামত" },
    customReviews: { type: [CustomReviewSchema], default: () => [] },
    countdown: { type: CountdownSchema, default: () => ({}) },
    popularVariantId: { type: String, default: "" },
    popularBadgeText: { type: String, default: "সবচেয়ে জনপ্রিয়" },
    packageBenefits: {
      type: [
        {
          image: { type: String, default: "" },
          icon: { type: String, default: "" },
          title: { type: String, default: "" },
          _id: false,
        },
      ] as any,
      default: [
        { icon: "truck", title: "ঢাকার বাইরে হোম ডেলিভারি" },
        { icon: "clock", title: "২৪-৪৮ ঘণ্টায় ডেলিভারি" },
        { icon: "shield", title: "নই হলে ফ্রিতে ফেরত" },
        { icon: "banknote", title: "Cash on Delivery" },
      ],
    },
    navLabels: {
      hero: { type: String, default: "হোম" },
      features: { type: String, default: "আমাদের পণ্য" },
      variants: { type: String, default: "মূল্য তালিকা" },
      delivery: { type: String, default: "ডেলিভারি" },
      reviews: { type: String, default: "রিভিউ" },
      contact: { type: String, default: "যোগাযোগ" },
    },
    navAnchors: {
      hero: { type: String, default: "hero" },
      features: { type: String, default: "features" },
      variants: { type: String, default: "variants" },
      delivery: { type: String, default: "delivery" },
      reviews: { type: String, default: "reviews" },
      contact: { type: String, default: "contact" },
    },
  },
  { timestamps: true }
);

LandingPageSchema.plugin(storeIsolationPlugin);

export const LandingPage = model<ILandingPage>("LandingPage", LandingPageSchema);
