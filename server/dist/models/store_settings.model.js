"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeSettings = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const image_resolver_plugin_1 = require("../utils/image-resolver.plugin");
const store_isolation_plugin_1 = require("../utils/store-isolation.plugin");
const SocialLinksSchema = new mongoose_1.Schema({
    facebook: String,
    x: String,
    youtube: String,
    instagram: String,
    linkedin: String,
}, { _id: false });
const NavLinkSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    href: { type: String, required: true },
});
const HeaderSchema = new mongoose_1.Schema({
    site_logo: { type: String },
    search_bar_placeholder: String,
    cart_icon: String,
    nav_items_button_active_color: String,
    categories_dropdown_bg_color: String,
});
const HeroSectionSchema = new mongoose_1.Schema({
    hero_images: [String],
    carousel_duration: Number,
}, { _id: false });
const FlashSaleBannerSchema = new mongoose_1.Schema({
    banner_image: String,
    flash_sale_start: Date,
    flash_sale_end: Date,
    count_down_image: String,
    description: String,
});
const FlashSaleSectionSchema = new mongoose_1.Schema({
    banner: FlashSaleBannerSchema,
}, { _id: false });
const ProductCardSchema = new mongoose_1.Schema({
    add_to_cart_btn_color: String,
    add_to_cart_btn_hover_color: String,
    add_to_cart_btn_text: String,
    add_to_cart_btn_text_color: String,
    add_to_cart_btn_text_hover_color: String,
    buy_now_btn_text: String,
    buy_now_btn_color: String,
    buy_now_btn_hover_color: String,
    buy_now_btn_text_color: String,
    buy_now_btn_text_hover_color: String,
});
const CollectionsSchema = new mongoose_1.Schema({
    product_card: ProductCardSchema,
}, { _id: false });
const FooterTopSchema = new mongoose_1.Schema({
    left_icon: String,
    left_title: String,
    left_subtitle: String,
    right_icon: String,
    right_text: String,
    right_phone: String,
}, { _id: false });
const FooterAboutSchema = new mongoose_1.Schema({
    title: String,
    description: String,
    button_text: String,
    button_link: String,
}, { _id: false });
const FooterItemSchema = new mongoose_1.Schema({
    label: String,
    href: String,
});
const FooterSectionSchema = new mongoose_1.Schema({
    title: String,
    items: [FooterItemSchema],
}, { _id: false });
const FooterContactSchema = new mongoose_1.Schema({
    title: String,
    address: String,
    phone: String,
    email: String,
    location_icon: String,
    phone_icon: String,
    email_icon: String,
    social_links: SocialLinksSchema,
}, { _id: false });
const FooterSchema = new mongoose_1.Schema({
    top: FooterTopSchema,
    background_color: String,
    about: FooterAboutSchema,
    sections: [FooterSectionSchema],
    contact: FooterContactSchema,
}, { _id: false });
const HomeSchema = new mongoose_1.Schema({
    hero_section: HeroSectionSchema,
    flash_sale_section: FlashSaleSectionSchema,
    collections: CollectionsSchema,
}, { _id: false });
const ProductDetailsPageSchema = new mongoose_1.Schema({
    button_bg_color: String,
    button_text_color: String,
    button_hover_bg_color: String,
    button_hover_text_color: String,
    add_to_cart_btn_text: String,
    add_to_cart_btn_color: String,
    add_to_cart_btn_hover_color: String,
    add_to_cart_btn_text_color: String,
    add_to_cart_btn_text_hover_color: String,
    buy_now_btn_text: String,
    buy_now_btn_color: String,
    buy_now_btn_hover_color: String,
    buy_now_btn_text_color: String,
    buy_now_btn_text_hover_color: String,
    whats_app_btn_text: String,
    whats_app_btn_text_color: String,
    whats_app_btn_bg_color: String,
    whats_app_btn_hover_text_color: String,
    whats_app_btn_hover_bg_color: String,
    enableWhatsApp: Boolean,
    whats_app_number: String,
    review_enabled: Boolean,
}, { _id: false });
const CheckoutPageSchema = new mongoose_1.Schema({
    coupon: { type: Boolean },
}, { _id: false });
const ContactPageSchema = new mongoose_1.Schema({
    title: String,
    description: String,
    address: String,
    phone: String,
    email: String,
}, { _id: false });
const LegalPagesSchema = new mongoose_1.Schema({
    privacy_policy: { type: String, default: "" },
    terms_conditions: { type: String, default: "" },
    refund_returns: { type: String, default: "" },
    user_guide: { type: String, default: "" },
}, { _id: false });
const TawkToSchema = new mongoose_1.Schema({
    property_id: { type: String, default: "" },
    widget_id: { type: String, default: "" },
    enabled: { type: Boolean, default: false },
    position: {
        type: String,
        enum: ["bottom-right", "bottom-left"],
        default: "bottom-right",
    },
}, { _id: false });
const FaqItemSchema = new mongoose_1.Schema({
    question: String,
    answer: String,
});
const FaqPageSchema = new mongoose_1.Schema({
    title: { type: String, default: "Frequently Inquired Queries" },
    subtitle: {
        type: String,
        default: "Find answers to common questions about our services.",
    },
    faqs: [FaqItemSchema],
}, { _id: false });
const PagesSchema = new mongoose_1.Schema({
    home: HomeSchema,
    product_details: ProductDetailsPageSchema,
    contact_page: ContactPageSchema,
    checkout_page: CheckoutPageSchema,
    faq_page: FaqPageSchema,
}, { _id: false });
const FloatingContactSchema = new mongoose_1.Schema({
    enabled: { type: Boolean, default: false },
    phone: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    messenger: { type: String, default: "" },
    position: {
        type: String,
        enum: ["bottom-right", "bottom-left", "top-right", "top-left"],
        default: "bottom-right",
    },
}, { _id: false });
const StoreSettingsSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
    },
    site_name: { type: String, required: true },
    fav_icon: String,
    theme_color: { type: String, required: true },
    pages: PagesSchema,
    header: HeaderSchema,
    nav_bar: [NavLinkSchema],
    footer: FooterSchema,
    tawk_to: {
        type: TawkToSchema,
        default: () => ({
            property_id: "",
            widget_id: "",
            enabled: false,
            position: "bottom-right",
        }),
    },
    floating_contact: {
        type: FloatingContactSchema,
        default: () => ({
            enabled: false,
            phone: "",
            whatsapp: "",
            messenger: "",
        }),
    },
    legal_pages: {
        type: LegalPagesSchema,
        default: () => ({
            privacy_policy: "",
            terms_conditions: "",
            refund_returns: "",
            user_guide: "",
        }),
    },
    under_maintenance: { type: Boolean, default: false },
    icon_toggle: { type: Boolean, default: true },
    onboarding_completed: { type: Boolean, default: false },
}, { timestamps: true });
StoreSettingsSchema.plugin(image_resolver_plugin_1.imageResolver, {
    fields: [
        "fav_icon",
        "header.site_logo",
        "pages.home.hero_section.hero_images",
        "pages.home.flash_sale_section.banner.banner_image",
        "pages.home.flash_sale_section.banner.count_down_image",
        "footer.top.left_icon",
        "footer.top.right_icon",
        "footer.contact.location_icon",
        "footer.contact.phone_icon",
        "footer.contact.email_icon",
    ],
    excludePlaceholderFields: [
        "header.site_logo",
        "footer.top.left_icon",
        "footer.top.right_icon",
        "footer.contact.location_icon",
        "footer.contact.phone_icon",
        "footer.contact.email_icon",
    ],
});
StoreSettingsSchema.plugin(store_isolation_plugin_1.storeIsolationPlugin);
exports.storeSettings = mongoose_1.default.model("StoreSettings", StoreSettingsSchema);
