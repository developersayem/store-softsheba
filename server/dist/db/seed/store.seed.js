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
exports.storeSettingsRules = void 0;
const store_settings_model_1 = require("../../models/store_settings.model");
const storeSettingsRules = async () => {
    console.log("➤ Synchronizing store settings rules...");
    const site_name = "ShopXet Store";
    const defaultSettings = {
        site_name,
        theme_color: "#FF5733",
        fav_icon: null,
        under_maintenance: false,
        icon_toggle: true,
        onboarding_completed: true,
        header: {
            site_logo: null,
            search_bar_placeholder: "Search products here...",
            cart_icon: null,
            nav_items_button_active_color: "#822917",
            categories_dropdown_bg_color: "#d12300",
        },
        footer: {
            top: {
                left_icon: null,
                left_title: "কল দিয়ে অর্ডার করতে চাচ্ছেন?",
                left_subtitle: "সরাসরি কল দিয়ে অর্ডার করুন!",
                right_icon: null,
                right_text: "এখনই কল করুন",
                right_phone: "+880 1969-888555",
            },
            background_color: "#222222",
            about: {
                title: "আমাদের সম্পর্কে",
                description: "ShopXet একটি বিশ্বস্ত অনলাইন প্ল্যাটফর্ম, যেখানে আপনার ব্যবসায়ের প্রয়োজনীয় সকল পণ্য পাওয়া যায়। আমরা মূলত উন্নত মানের ই-কমার্স সমাধান প্রদান করে থাকি। আপনার ব্যবসাকে রাখুন ঝকঝকে ও আধুনিক — ShopXet-এর সাথে।",
                button_text: "CONTACT US",
                button_link: "contact",
            },
            sections: [
                {
                    title: "প্রোডাক্টস",
                    items: [
                        {
                            label: "Product 1",
                            href: "#",
                        },
                        {
                            label: "Product 2",
                            href: "#",
                        },
                        {
                            label: "Product 3",
                            href: "#",
                        },
                        {
                            label: "Product 4",
                            href: "#",
                        },
                        {
                            label: "Product 5",
                            href: "#",
                        },
                        {
                            label: "Product 6",
                            href: "#",
                        },
                        {
                            label: "Product 7",
                            href: "#",
                        },
                    ],
                },
                {
                    title: "সাহায্য ও তথ্য",
                    items: [
                        {
                            label: "সব প্রোডাক্টস",
                            href: "products",
                        },
                        {
                            label: "ইউজার লগিন",
                            href: "login",
                        },
                        {
                            label: "প্রায় জিজ্ঞাসিত প্রশ্ন",
                            href: "faq",
                        },
                        {
                            label: "ব্যাবহার নির্দেশিকা",
                            href: "user-guide",
                        },
                        {
                            label: "গোপনীয়তা নীতিমালা",
                            href: "privacy-policy",
                        },
                        {
                            label: "শর্তাবলী ও নিয়মাবলী",
                            href: "terms-and-conditions",
                        },
                        {
                            label: "রিটার্ন ও রিফান্ড নীতি",
                            href: "refund-returns",
                        },
                    ],
                },
            ],
            contact: {
                title: "যোগাযোগ",
                address: "Choto bazar, Mymensingh-2200",
                phone: "+880 1969-888555",
                email: "shoxet.com@gmail.com",
                location_icon: null,
                phone_icon: null,
                email_icon: null,
                social_links: {
                    facebook: "https://facebook.com/",
                    x: "https://x.com/",
                    youtube: "https://youtube.com/",
                    instagram: "https://instagram.com/",
                    linkedin: "https://linkedin.com/",
                },
            },
        },
        pages: {
            home: {
                hero_section: {
                    hero_images: [null],
                    carousel_duration: 3000,
                },
                flash_sale_section: {
                    banner: {
                        banner_image: null,
                        flash_sale_start: "2025-01-01T00:00:00.000Z",
                        flash_sale_end: "2027-01-07T23:59:59.000Z",
                        count_down_image: "store-settings/flash_countdown_image/sale.gif",
                        description: "For a limited time only in Flash Sale",
                    },
                },
                collections: {
                    product_card: {
                        add_to_cart_btn_color: "#EEEEEE",
                        add_to_cart_btn_hover_color: "#ff8266",
                        add_to_cart_btn_text: "Add To Cart",
                        add_to_cart_btn_text_color: "#333333",
                        add_to_cart_btn_text_hover_color: "#ffffff",
                        buy_now_btn_text: "Buy Now",
                        buy_now_btn_color: "#FF5733",
                        buy_now_btn_hover_color: "#C70039",
                        buy_now_btn_text_color: "#FFFFFF",
                        buy_now_btn_text_hover_color: "#F0F0F0",
                    },
                },
            },
            product_details: {
                button_bg_color: "#FF5733",
                button_text_color: "#ffffff",
                button_hover_bg_color: "#C70039",
                button_hover_text_color: "#ffffff",
                whats_app_btn_text_color: "#ffffff",
                whats_app_btn_bg_color: "#228B22",
                whats_app_btn_hover_text_color: "#ffffff",
                whats_app_btn_hover_bg_color: "#C70039",
                enableWhatsApp: true,
                whats_app_number: "+880 1969-888555",
                review_enabled: true,
            },
            contact_page: {
                title: "Contact us",
                description: "We're here to help! Whether you have a question about your order, need assistance with a product, or just want to share feedback, our team is ready to assist you.",
                address: "Choto bazar, Mymensingh-2200",
                phone: "+880 1969-888555",
                email: "shoxet.com@gmail.com",
            },
            checkout_page: {
                coupon: true,
            },
            faq_page: {
                title: "Frequently Inquired Queries",
                subtitle: "Find answers to common questions about our services and policies.",
                faqs: [
                    {
                        question: "What services do you provide?",
                        answer: "We offer a range of cleaning products and tools suitable for households and commercial spaces.",
                    },
                    {
                        question: "How do I place an order?",
                        answer: "Placing an order with us is easy! You can browse our catalog, add items to your cart, and proceed to checkout online.",
                    },
                    {
                        question: "What are your payment options?",
                        answer: "We offer several payment options for your convenience, including mobile banking, credit/debit card payments, and cash on delivery.",
                    },
                    {
                        question: "What is your return policy?",
                        answer: "Please review our Refund and Return policy page for detailed information on returns.",
                    },
                ],
            },
        },
        legal_pages: {
            privacy_policy: `
        <h1>Privacy Policy</h1>
        <p><strong>Last Updated:</strong> {{current_date}}</p>
        <p>Welcome to <strong>{{website_name}}</strong>. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, services, or make a purchase.</p>
        <p>By accessing our platform, you agree to this policy.</p>
        <hr />
        <h2>1. Information We Collect</h2>
        <h3>1.1 Personal Information</h3>
        <p>We may collect:</p>
        <ul>
          <li>Full Name</li>
          <li>Phone Number</li>
          <li>Email Address</li>
          <li>Billing & Shipping Address</li>
          <li>Account Login Details (if applicable)</li>
          <li>Payment Information (processed securely via third-party providers)</li>
        </ul>
        <h3>1.2 Non-Personal Information</h3>
        <ul>
          <li>IP Address</li>
          <li>Browser & Device Type</li>
          <li>Operating System</li>
          <li>Pages visited, time spent, and interactions</li>
        </ul>
        <h3>1.3 Transaction Information</h3>
        <ul>
          <li>Order details</li>
          <li>Purchase history</li>
          <li>Payment status</li>
        </ul>
        <hr />
        <h2>2. How We Use Your Information</h2>
        <p>We use your data to:</p>
        <ul>
          <li>Process and manage orders</li>
          <li>Deliver products or services</li>
          <li>Communicate order updates, offers, and support</li>
          <li>Improve website performance and user experience</li>
          <li>Personalize content and recommendations</li>
          <li>Detect and prevent fraud or unauthorized activity</li>
          <li>Comply with legal obligations</li>
        </ul>
        <hr />
        <h2>3. Cookies & Tracking Technologies</h2>
        <p>We use cookies and similar tools to:</p>
        <ul>
          <li>Maintain login sessions</li>
          <li>Save cart and user preferences</li>
          <li>Analyze traffic and behavior</li>
          <li>Provide targeted marketing</li>
        </ul>
        <p>You can control cookies via browser settings.</p>
        <hr />
        <h2>4. How We Share Information</h2>
        <p>We may share your data with:</p>
        <ul>
          <li>Payment gateway providers</li>
          <li>Delivery and logistics partners</li>
          <li>Marketing & analytics services</li>
          <li>IT and hosting providers</li>
        </ul>
        <p>We <strong>never sell your personal information</strong>.</p>
        <hr />
        <h2>5. Data Security</h2>
        <p>We implement security measures such as:</p>
        <ul>
          <li>SSL encryption</li>
          <li>Secure servers</li>
          <li>Access control and authentication</li>
        </ul>
        <p>However, no system is completely secure.</p>
        <hr />
        <h2>6. Data Retention</h2>
        <p>We retain your information:</p>
        <ul>
          <li>As long as necessary for business purposes</li>
          <li>To comply with legal requirements</li>
          <li>To resolve disputes and enforce agreements</li>
        </ul>
        <hr />
        <h2>7. Your Rights</h2>
        <p>You may:</p>
        <ul>
          <li>Request access to your data</li>
          <li>Request correction or deletion</li>
          <li>Withdraw consent</li>
          <li>Opt-out of marketing communications</li>
        </ul>
        <hr />
        <h2>8. Third-Party Services</h2>
        <p>We may link to or integrate third-party services. Their privacy policies apply separately.</p>
        <hr />
        <h2>9. Children's Privacy</h2>
        <p>Our services are not intended for users under <strong>{{min_age}}</strong>.</p>
        <hr />
        <h2>10. Changes to This Policy</h2>
        <p>We may update this policy at any time. Changes will be posted here.</p>
        <hr />
        <h2>11. Contact Us</h2>
        <ul>
          <li>Email: {{store_email}}</li>
          <li>Phone: {{store_phone}}</li>
          <li>Address: {{store_address}}</li>
        </ul>
      `,
            terms_conditions: `
        <h1>Terms and Conditions</h1>
        <p><strong>Last Updated:</strong> {{current_date}}</p>
        <p>These Terms govern your use of <strong>{{website_name}}</strong>.</p>
        <hr />
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing this website, you agree to comply with these Terms.</p>
        <hr />
        <h2>2. Eligibility</h2>
        <ul>
          <li>Users must be at least <strong>{{min_age}}</strong></li>
          <li>Must provide accurate information</li>
        </ul>
        <hr />
        <h2>3. Products & Services</h2>
        <ul>
          <li>Subject to availability</li>
          <li>We may modify/discontinue anytime</li>
          <li>Product/service descriptions may vary slightly</li>
        </ul>
        <hr />
        <h2>4. Pricing & Errors</h2>
        <ul>
          <li>Prices can change without notice</li>
          <li>We reserve the right to correct errors</li>
          <li>Orders may be canceled due to pricing mistakes</li>
        </ul>
        <hr />
        <h2>5. Orders</h2>
        <ul>
          <li>Order confirmation does not guarantee acceptance</li>
          <li>We may cancel suspicious or fraudulent orders</li>
        </ul>
        <hr />
        <h2>6. Payments</h2>
        <p>Accepted methods:</p>
        <ul>
          <li>Online payment</li>
          <li>Mobile banking</li>
          <li>Cash on Delivery (if available)</li>
        </ul>
        <p>All transactions are processed securely.</p>
        <hr />
        <h2>7. Shipping & Delivery</h2>
        <ul>
          <li>Delivery time depends on location</li>
          <li>Delays may occur due to external factors</li>
          <li>Customers must provide accurate details</li>
        </ul>
        <hr />
        <h2>8. Returns & Refunds</h2>
        <ul>
          <li>Governed by our Refund Policy</li>
          <li>Conditions may vary by product/service</li>
        </ul>
        <hr />
        <h2>9. User Accounts</h2>
        <ul>
          <li>Maintain confidentiality</li>
          <li>Notify us of unauthorized access</li>
        </ul>
        <hr />
        <h2>10. Prohibited Use</h2>
        <p>Users must not:</p>
        <ul>
          <li>Violate laws</li>
          <li>Hack or disrupt system</li>
          <li>Submit false information</li>
          <li>Abuse services</li>
        </ul>
        <hr />
        <h2>11. Intellectual Property</h2>
        <p>All content belongs to <strong>{{website_name}}</strong> and cannot be reused without permission.</p>
        <hr />
        <h2>12. Limitation of Liability</h2>
        <p>We are not liable for:</p>
        <ul>
          <li>Indirect damages</li>
          <li>Loss due to misuse</li>
          <li>Third-party issues</li>
        </ul>
        <hr />
        <h2>13. Termination</h2>
        <p>We may suspend or terminate access for violations.</p>
        <hr />
        <h2>14. Governing Law</h2>
        <p>Applicable laws: <strong>{{store_country}}</strong></p>
        <hr />
        <h2>15. Contact</h2>
        <ul>
          <li>Email: {{store_email}}</li>
          <li>Phone: {{store_phone}}</li>
        </ul>
      `,
            refund_returns: `
        <h1>Refund & Return Policy</h1>
        <p><strong>Last Updated:</strong> {{current_date}}</p>
        <hr />
        <h2>1. Overview</h2>
        <p>We aim to ensure customer satisfaction. This policy explains when and how returns, exchanges, and refunds are processed.</p>
        <hr />
        <h2>2. Return Eligibility</h2>
        <p>You may qualify if:</p>
        <ul>
          <li>Item/service is damaged, defective, or incorrect</li>
          <li>Request is made within <strong>[X Days]</strong></li>
          <li>Product is unused (if applicable)</li>
        </ul>
        <hr />
        <h2>3. Non-Eligible Cases</h2>
        <ul>
          <li>Used/consumed items</li>
          <li>Digital products after delivery</li>
          <li>Services already completed</li>
          <li>Discounted/promotional items (unless defective)</li>
        </ul>
        <hr />
        <h2>4. Return Process</h2>
        <ol>
          <li>Contact support</li>
          <li>Provide order details</li>
          <li>Submit proof (images/video if needed)</li>
          <li>Wait for approval</li>
          <li>Return item (if applicable)</li>
        </ol>
        <hr />
        <h2>5. Refund Processing</h2>
        <ul>
          <li>After inspection</li>
          <li>Via original method or store credit</li>
          <li>Processing time: <strong>[X–X Days]</strong></li>
        </ul>
        <hr />
        <h2>6. Exchange Policy</h2>
        <ul>
          <li>Only for defective/wrong items</li>
          <li>Based on availability</li>
        </ul>
        <hr />
        <h2>7. Shipping Responsibility</h2>
        <ul>
          <li>Customer pays return cost</li>
          <li>If our fault → we cover</li>
        </ul>
        <hr />
        <h2>8. Order Cancellation</h2>
        <ul>
          <li>Before shipment → allowed</li>
          <li>After shipment → return policy applies</li>
        </ul>
        <hr />
        <h2>9. Special Conditions</h2>
        <ul>
          <li>Slight variation in product/service may occur</li>
          <li>Users must follow usage instructions</li>
        </ul>
        <hr />
        <h2>10. Contact</h2>
        <ul>
          <li>Email: {{store_email}}</li>
          <li>Phone: {{store_phone}}</li>
        </ul>
      `,
            user_guide: `
        <h1>User Guide</h1>
        <p>Welcome to <strong>{{website_name}}</strong>. This guide will help you use our platform efficiently.</p>
        <hr />
        <h2>1. Browsing</h2>
        <ul>
          <li>Use categories or search</li>
          <li>Filter/sort products/services</li>
          <li>View detailed descriptions</li>
        </ul>
        <hr />
        <h2>2. Ordering Process</h2>
        <ol>
          <li>Select item/service</li>
          <li>Add to cart</li>
          <li>Review cart</li>
          <li>Proceed to checkout</li>
          <li>Enter personal details</li>
          <li>Choose payment method</li>
          <li>Confirm order</li>
        </ol>
        <hr />
        <h2>3. Account (Optional)</h2>
        <ul>
          <li>Register/login for faster checkout</li>
          <li>Track order history</li>
          <li>Save information</li>
        </ul>
        <hr />
        <h2>4. Payment Options</h2>
        <p>Available methods:</p>
        <ul>
          <li>Online Payment</li>
          <li>Mobile Banking</li>
          <li>Cash on Delivery</li>
        </ul>
        <hr />
        <h2>5. Order Tracking</h2>
        <ul>
          <li>Confirmation via SMS/email</li>
          <li>Tracking may be available</li>
          <li>Contact support for updates</li>
        </ul>
        <hr />
        <h2>6. Delivery</h2>
        <ul>
          <li>Time depends on location</li>
          <li>Delays possible</li>
          <li>Ensure correct address</li>
        </ul>
        <hr />
        <h2>7. Returns & Support</h2>
        <ul>
          <li>Follow Refund Policy</li>
          <li>Contact support for issues</li>
        </ul>
        <hr />
        <h2>8. Safety & Usage Tips</h2>
        <ul>
          <li>Read product/service details carefully</li>
          <li>Follow instructions</li>
          <li>Verify information before ordering</li>
        </ul>
        <hr />
        <h2>9. Customer Support</h2>
        <ul>
          <li>Email: {{store_email}}</li>
          <li>Phone: {{store_phone}}</li>
          <li>Address: {{store_address}}</li>
        </ul>
        <hr />
        <h2>10. Best Practices</h2>
        <ul>
          <li>Use correct contact info</li>
          <li>Track orders regularly</li>
          <li>Report issues quickly</li>
        </ul>
      `,
        },
        key: "global",
    };
    // 1. Cleanup Phase: Ensure only ONE global document exists PER store
    const allSettings = await store_settings_model_1.storeSettings.find({ key: "global" }).lean();
    const settingsByStore = new Map();
    allSettings.forEach((s) => {
        const sId = s.storeId?.toString() || "legacy";
        if (!settingsByStore.has(sId))
            settingsByStore.set(sId, []);
        settingsByStore.get(sId)?.push(s);
    });
    for (const [sId, list] of settingsByStore.entries()) {
        if (list.length > 1) {
            console.log(`➤ Found ${list.length} duplicates for store [${sId}]. Cleaning up...`);
            const toKeep = list.find((s) => s.site_name !== "ShopXet Store") || list[0];
            await store_settings_model_1.storeSettings.deleteMany({
                _id: { $ne: toKeep._id },
                key: "global",
                storeId: sId === "legacy" ? null : sId,
            });
            console.log(`✔ Redundant settings removed for store [${sId}]. Preserved: ${toKeep.site_name}`);
        }
    }
    // 2. Fetch the remaining (single) document
    const settings = await store_settings_model_1.storeSettings.findOne({ key: "global" });
    if (!settings) {
        console.log("➤ No settings found. Creating initial store settings...");
        // Inject required storeId from default store
        const { Store } = await Promise.resolve().then(() => __importStar(require("../../models/store.model")));
        const defaultStore = await Store.findOne().sort({ createdAt: 1 });
        if (defaultStore) {
            defaultSettings.storeId = defaultStore._id;
        }
        else {
            console.error("❌ Failed to create StoreSettings: No default store found to link!");
            return;
        }
        await store_settings_model_1.storeSettings.create(defaultSettings);
        console.log("✔ Store settings created successfully.");
        return;
    }
    const update = {};
    // Legal Pages: Only update if missing or empty string
    const legalKeys = [
        "privacy_policy",
        "terms_conditions",
        "refund_returns",
        "user_guide",
    ];
    for (const key of legalKeys) {
        const existingPages = settings.legal_pages;
        const defaultPages = defaultSettings.legal_pages;
        if (!existingPages?.[key] || existingPages[key].trim() === "") {
            update[`legal_pages.${key}`] = defaultPages[key];
        }
        else {
            // --- Placeholder Migration for existing deployments ---
            // If the page exists but contains old-style placeholders, migrate them
            let content = existingPages[key];
            const legacyReplacements = [
                { old: /\[Website Name\]/g, new: "{{website_name}}" },
                { old: /\[Email\]/g, new: "{{store_email}}" },
                { old: /\[Phone\]/g, new: "{{store_phone}}" },
                { old: /\[Address\]/g, new: "{{store_address}}" },
                { old: /\[Insert Date\]/g, new: "{{current_date}}" },
                { old: /\[Minimum Age\]/g, new: "{{min_age}}" },
                { old: /\[Age Limit\]/g, new: "{{min_age}}" },
                { old: /\[Company Name\]/g, new: "{{website_name}}" },
                { old: /\[Country Name\]/g, new: "{{store_country}}" },
            ];
            let migrated = content;
            legacyReplacements.forEach((r) => {
                if (r.old.test(migrated)) {
                    migrated = migrated.replace(r.old, r.new);
                }
            });
            if (migrated !== content) {
                update[`legal_pages.${key}`] = migrated;
            }
        }
    }
    // FAQ Page: Only update if no FAQs exist
    if (!settings.pages?.faq_page?.faqs ||
        settings.pages.faq_page.faqs.length === 0) {
        update["pages.faq_page"] = defaultSettings.pages.faq_page;
    }
    // Flash Sale: Update countdown graphic if missing
    if (!settings.pages?.home?.flash_sale_section?.banner?.count_down_image) {
        update["pages.home.flash_sale_section.banner.count_down_image"] =
            defaultSettings.pages.home.flash_sale_section.banner.count_down_image;
    }
    if (Object.keys(update).length > 0) {
        console.log(`➤ Synchronizing missing store content: ${Object.keys(update).join(", ")}`);
        await store_settings_model_1.storeSettings.updateOne({ key: "global" }, { $set: update });
        console.log("✔ Store settings synchronized successfully.");
    }
    else {
        console.log("✔ Store settings are already up to date.");
    }
};
exports.storeSettingsRules = storeSettingsRules;
