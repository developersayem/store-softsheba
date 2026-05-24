import React, { ReactNode } from "react";

export type AdditionalInfo = {
  name: string;
  description: string;
};

export type DetailsLink = {
  title: string;
  link: string;
};

export interface ProductDetails {
  id: string; // The URL slug
  image: string;
  name: string;
  price: string;
  cutPrice?: string;
  licenseType?: string;
  category: string;
  link: string;
  tagName1?: string;
  tagLink1?: string;
  tagName2?: string;
  tagLink2?: string;
  reviews: number;
  licenseOption?: string[];
  description?: string[];
  sectionToShow: string[];
  sale: boolean;
  
  // Custom arrays/strings
  shortDesc?: string;
  feat?: string;
  asterBenefit?: string[];
  howToUse?: string[];
  productDetail?: string[];
  
  // Custom objects
  additionalInfo?: AdditionalInfo[];
  detailsLinks?: DetailsLink[];
  
  // Component specific rendering flags
  businessPro?: boolean;
  asterMultiseatDesc?: boolean;
  emailBroadcastDesc?: boolean;
  whatsappCrmDesc?: boolean;
  bulksmsDesc?: boolean;
  businessSender?: boolean;
  invoiceDesc?: boolean;
  linkedinDesc?: boolean;
  marketingSoftDesc?: boolean;
  
  // Misc
  license?: string[];
  videoTitle?: string;
  videoTutorial?: ReactNode;
  
  // Header overrides
  headerFullName?: string;
  headerToolName?: string;
}

export const products: ProductDetails[] = [
  {
    id: "aster-multiseat-software",
    image: "https://shop.softsheba.com/wp-content/uploads/2023/11/aster-software-box-min.png",
    name: "Aster Multiseat Software- 1 PC Multiple User",
    price: "৳1,590.00 – ৳10,990.00",
    category: "Business Management",
    link: "business-management",
    tagName1: "1 PC multiple user",
    tagLink1: "1-pc-multiple-user",
    tagName2: "Aster multiseat software in bd",
    tagLink2: "invoice-software",
    reviews: 3,
    sectionToShow: ["Description", "Additional information", "Reviews", "FAQs", "Aster Multiseat Software কেন ব্যবহার করবেন?", "🔐 License Delivery Information"],
    licenseOption: [
      "ANNUAL - 2",
      "ANNUAL - 3",
      "ANNUAL - 6",
      "LIFETIME - 2",
      "LIFETIME - 3",
      "LIFETIME - 6"
    ],
    asterBenefit: [
      "Low noise level",
      "Space is saved",
      "Upgrading costs are cut down",
      "Easy application",
      "Electric power is saved",
      "Local network is not required",
      "Environmentally friendly"
    ],
    sale: true,
    license: ["ANNUAL-2, ANNUAL-3, ANNUAL-6, LIFETIME-2, LIFETIME-3, LIFETIME-6"],
    asterMultiseatDesc: true
  },
  {
    id: "become-a-reseller",
    image: "https://shop.softsheba.com/wp-content/uploads/2023/11/Become-a-reseller-min.png",
    name: "Become a Reseller of Softsheba",
    price: "৳20,000.00 – ৳45,000.00",
    category: "Uncategorized",
    link: "uncategorized",
    tagName1: "Become a Reseller",
    tagLink1: "become-a-reseller",
    reviews: 0,
    sectionToShow: ["Additional information", "Reviews"],
    licenseOption: [
      "Rebrand",
      "Reseller"
    ],
    productDetail: [
      "Business Pro",
      "SMS Gateway",
      "Email Broadcast",
      "Invoice Software"
    ],
    shortDesc: 'Start your business with us.',
    sale: false,
    additionalInfo: [
      {
        name: "Product",
        description: "Business Pro, SMS Gateway, Email Broadcast, Invoice Software"
      },
      {
        name: "Seller Type",
        description: "Rebrand, Reseller"
      }
    ],
    headerFullName: "Marketing Software Collection | Combo Offer",
    headerToolName: "Marketing tools"
  },
  {
    id: "bulk-sms-gateway-with-web-panel-android-app",
    image: "https://shop.softsheba.com/wp-content/uploads/2023/10/SMS-Gateway-min.png",
    name: "Bulk SMS Gateway with Web Panel & Android App",
    price: "৳3,990.00 – ৳5,900.00",
    licenseOption: ["1 Year","Lifetime"],
    category: "Marketing tools",
    link: "marketing-tools",
    tagName1: "Bulk SMS Gateway",
    tagLink1: "bulk-sms-gateway",
    tagName2: "Digital Marketing Tools",
    tagLink2: "digital-marketing-tools",
    reviews: 1,
    description: [
      "Bulk Message: Send Bulk messages using this Gateway",
      "Multiple Devices: You can use multiple devices",
      "Contacts: You can save your contacts by group name",
      "Contact lists:- Create contact lists and import contacts into them using an Excel file.",
      "Send a message to contact list:- Send a message to contacts in a contacts list.",
      "Template:</b> You can save your message template then any time you use it.",
      "Auto responder: You can add responses for certain messages so whenever you receive that message, the app will reply to it automatically.",
      "Schedule messages>- Send messages on schedule.",
      "API, WordPress Plugin Ready: You can use API for your website.",
    ],
    sectionToShow: [
      "Description",
      "Additional information",
      "SMS মার্কেটিং করুন",
      "Reviews",
    ],
    feat: `Send Unlimited Messages to your client, Our all-plan includes Unlimited Credit.
Android App Ready`,
    sale: true,
    license: ["	1 Month, 1Year, 2 Year, 3 Year, Lifetime"],
    bulksmsDesc: true
  },
  {
    id: "business-pro",
    image: "https://shop.softsheba.com/wp-content/uploads/2023/08/Business-Pro-Whatsapp-Marketing-Software-min.png",
    name: "Business Pro (WhatsApp Marketing Software)",
    price: "৳690.00 - ৳9,990.00",
    licenseOption: ["1 Month", "6 Month", "1 Year", "3 Year", "Lifetime"],
    category: "Marketing tools",
    link: "marketing-tools",
    tagName1: " Digital Marketing Tools",
    tagName2: "Whatsapp marketing Software",
    tagLink1: "digital-marketing-tools",
    tagLink2: "whatsapp-marketing-software",
    reviews: 3,
    description: [
      "Multiple Account Manager",
      "Routing Sender System",
      "Message Scheduler",
      "WhatsApp Group Sender",
      "Grab WhatsApp Group",
      "Export Group Members",
      "Bulk Add Group Members",
      "Auto Group Joiner",
      "Bulk Group Generator",
      "Whatsapp Number Filter",
      "Auto Group Joiner",
      "WhatsApp Auto Reply Bot",
      "Google Contacts CSV Generator",
      "Contact List/ Chatlist Grabber",
      "Whatsapp Warmer",
      "Poll Results",
      "Whatsapp Group Finder",
      "Website Email Mobile Extractor",
      "INBUILT GOOGLE MY BUSINESS EXTRACTOR (Most wanted Features)",
      "Social Media Data Extractor (LinkedIn, Facebook, Instagram, Telegram)",
    ],
    sectionToShow: [
      "Description",
      "Additional information",
      "এই সফটওয়্যার দিয়ে আপনি কি করতে পারবেন?",
      "Reviews",
    ],
    sale: false,
    license: ["1 Month, 6 Month, 1 Year, 3 Year, Lifetime"],
    businessPro: true
  },
  {
    id: "business-sender-whatsapp-marketing-software-1-year",
    image: "https://shop.softsheba.com/wp-content/uploads/2024/05/Business-Sender-min.webp",
    name: "Business Sender- WhatsApp Marketing Software (1 Year)",
    price: "৳1,999.00",
    shortDesc: "It's required off your system anti-virus Update depend on the manufactured company",
    category: "Marketing Tools",
    link: "marketing-tools",
    tagName1: "Business Sender",
    tagName2: "Whatsapp marketing Software",
    tagLink1: "business-sender",
    tagLink2: "whatsapp-marketing-software",
    reviews: 0,
    sectionToShow: ["Description", "Reviews"],
    sale: false,
    businessSender: true
  },
  {
    id: "email-broadcast",
    image: "https://shop.softsheba.com/wp-content/uploads/2023/08/Email-broadcast-email-marketing-software-softbarta-min.png",
    name: "Email Broadcast (Email Marketing Software)",
    price: "৳3,990.00 – ৳5,900.00",
    licenseOption: ["1 Year", "Lifetime"],
    category: "Marketing tools",
    link: "marketing-tools",
    tagName1: "Email Marketing Software",
    tagLink1: "email-marketing-software",
    reviews: 1,
    description: [
      " Multi-tenant app",
      "Creating personalized content",
      "Email Tracking",
      "Segmentation of audience",
      "Sending timely campaigns",
      "Subscriber management",
      "Export functionalities",
      "Default/Custom Template",
      "Role Permission",
      "Mailgun, Amazon SES, SMTP",
      "Track campaigns status",
    ],
    sectionToShow: ["Description", "Additional information", "Reviews"],
    feat: "Email Marketing Solution",
    sale: true,
    license: ["1 Year, Lifetime"],
    emailBroadcastDesc: true
  },
  {
    id: "invoice-software-lifetime-license",
    image: "https://shop.softsheba.com/wp-content/uploads/2023/08/Invoice-software-min.png",
    name: "Invoice Software (Lifetime License)",
    price: "৳9,990.00",
    cutPrice: "৳12,900.00",
    category: "Business Management",
    link: "business-management",
    tagName1: "Business Management",
    tagLink1: "business-management",
    tagName2: "Invoice Software",
    tagLink2: "invoice-software",
    reviews: 0,
    sectionToShow: ["Description", "Screenshot", "Video Tutorial", "Reviews"],
    videoTitle: 'Video Tutorial',
    videoTutorial: (
        <iframe className="w-full h-[600px]" width="560" height="315" src="https://www.youtube.com/embed/YNQ6ItOCUL8?si=MF2jykDPiMYLZeXK" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
    ),
    howToUse: [
        "◉ Set up multiple companies.",
        "◉ Creating professional invoices with your own logo.",
        "◉ Creating Quotes (Quotation) and Proforma Invoices.",
        "◉ Creating Credit Invoices.",
        "◉ Support many languages.",
        "◉ Support Inclusive tax/fee for items.",
        "◉ Change any text on the invoice and issue non-English invoices!",
        "◉ Currencies from around the world.",
        "◉ Rich configuration and customization."
    ],
    sale: true,
    invoiceDesc: true
  },
  {
    id: "linkedin-extream-scrap-lead-from-linkedin",
    image: "https://shop.softsheba.com/wp-content/uploads/2023/10/Linkedin-Extream-min.png",
    name: "Linkedin Extream | Scrap lead from Linkedin",
    price: "৳ 3,999.00",
    licenseType: "1 Year",
    category: "Marketing Tools",
    link: "marketing-tools",
    tagName1: "Linkedin Extream",
    tagLink1: "linkedin-extream",
    reviews: 0,
    sectionToShow: [
      "Description",
      "Reviews"
    ],
    sale: false,
    linkedinDesc: true
  },
  {
    id: "marketing-software-collection-combo-offer",
    image: "https://shop.softsheba.com/wp-content/uploads/2024/03/combo-offer-1-Year-softsheba-ltd.png",
    name: "Combo offer, Digital Marketing Tools",
    price: "৳7,176.00",
    cutPrice: "৳8,970.00 ",
    category: "Marketing Tools",
    link: "marketing-tools",
    tagName1: "Combo offer",
    tagLink1: "combo-offer",
    tagName2: "Digital Marketing Tools",
    tagLink2: "digital-marketing-tools",
    reviews: 0,
    detailsLinks: [
      {
        title: "Whatsapp Marketing Software 1 Year",
        link: "/",
      },
      {
        title: "Email Marketing Software 1 Year",
        link: "/",
      },
      {
        title: "SMS Marketing Software 1 Year",
        link: "/",
      },
    ],
    sectionToShow: ["Description", "Reviews"],
    sale: true,
    marketingSoftDesc: true,
    headerFullName: "Marketing Software Collection | Combo Offer",
    headerToolName: "Marketing tools"
  },
  {
    id: "whatsapp-crm-all-in-one-whatsapp-business-solution",
    image: "https://shop.softsheba.com/wp-content/uploads/2025/01/wacrm-software-box.png",
    name: "Whatsapp CRM-All-in-One WhatsApp Business Solution",
    price: "৳2,990.00 - ৳3,990.00",
    licenseOption: ["Yearly", "Lifetime"],
    category: "Business Management, Marketing Tools",
    link: "business-management",
    tagName1: "Whatsapp CRM",
    tagName2: "Whatsapp marketing Software",
    tagLink1: "whatsapp-crm",
    tagLink2: "whatsapp-marketing-software",
    reviews: 0,
    description: [
      " Chat Filtering",
      "Send WhatsApp Messages",
      "Message Delay Management",
      "Multiple Account Setup",
      "Set Multiple Chat Bots",
      "Group Guard",
      "Schedule Messages",
      "Reminders",
      "Quick Replies",
      "Data Extractors",
      "Group Joiner",
      "Group Destroyer",
      "Group Management",
      "Additional Tools",
      "Privacy Blur",
      "WhatsApp Link Generator",
      "Send Direct Messages",
      "Message Signature",
      "Message Translator",
      "Proxy Support",
      "Modern Material Design",
      "Reports",
    ],
    sectionToShow: ["Description", "Additional information"],
    sale: true,
    license: ["Yearly, Lifetime"],
    whatsappCrmDesc: true,
    headerFullName: "Whatsapp CRM-All-in-One WhatsApp Business Solution",
    headerToolName: "Marketing Tools"
  }
];
