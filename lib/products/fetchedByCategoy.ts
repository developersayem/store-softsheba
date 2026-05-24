interface CategoryProduct {
    id: number;
    image: string;
    link: string;
    name: string;
    price: string;
    cutPrice?: string;
    reviews: number;
    category: string;
    sale: boolean;
    tags: string[];
    tagName: string[];
}

export const products:CategoryProduct[] = [
    {
    id: 1,
    image: "https://shop.softsheba.com/wp-content/uploads/2023/08/Business-Pro-Whatsapp-Marketing-Software-min-300x408.png",
    link: "/business-pro/",
    name: "Business Pro (WhatsApp Marketing Software)",
    price: "৳690.00 – ৳9,990.00",
    cutPrice: "",
    reviews: 3,
    category: "marketing-tools",
    sale: false,
    tags: [
        "digital-marketing-tools",
        "whatsapp-marketing-software"
    ],
    tagName: [
        "Digital Marketing Tool",
        "WhatsApp Marketing Software"
    ]

    },
    {
    id: 2,
    image: "https://shop.softsheba.com/wp-content/uploads/2023/08/Email-broadcast-email-marketing-software-softbarta-min-300x408.png",
    link: "/email-broadcast/",
    name: "Email Broadcast (Email Marketing Software)",
    price: "৳3,990.00 – ৳5,900.00",
    cutPrice: "",
    reviews: 1,
    category: "marketing-tools",
    sale: true,
    tags: [
        "email-marketing-software"
    ],
    tagName: [
        "Email Marketing Software"
    ]
    },
    {
    id: 3,
    image: "https://shop.softsheba.com/wp-content/uploads/2023/08/Invoice-software-min-300x408.png",
    link: "/invoice-software-lifetime-license",
    name: "Invoice Software (Lifetime License)",
    price: "৳9,990.00",
    cutPrice: "৳12,900.00",
    reviews: 0,
    category: "business-management",
    sale: true,
    tags: [
        "business-management",
        "invoice-software"
    ],
    tagName: [
        "Business Mangament",
        "Invoice Software"
    ]
    },
    {
    id: 4,
    image: "https://shop.softsheba.com/wp-content/uploads/2023/10/SMS-Gateway-min-300x408.png",
    link: "/bulk-sms-gateway-with-web-panel-android-app",
    name: "Bulk SMS Gateway with Web Panel & Android App",
    price: "৳490.00 – ৳9,990.00",
    cutPrice: "",
    reviews: 1,
    category: "marketing-tools",
    sale: true,
    tags: [
        "digital-marketing-tools",
        "bulk-sms-gateway"
    ],
    tagName: [
        "Digital Marketing Tools",
        "Bulk SMS Gateway"
    ]
    },
    {
    id: 5,
    image: "https://shop.softsheba.com/wp-content/uploads/2023/10/Linkedin-Extream-min-300x408.png",
    link: "/linkedin-extream-scrap-lead-from-linkedin",
    name: "Linkedin Extream | Scrap lead from LinkedIn",
    price: "৳3,990.00",
    cutPrice: "",
    reviews: 0,
    category: "marketing-tools",
    sale: false,
    tags: [
        "linkedin-extream"
    ],
    tagName: [
        "Linkedin Extream"
    ]
    },
    {
    id: 6,
    image: "https://shop.softsheba.com/wp-content/uploads/2023/11/aster-software-box-min-300x408.png",
    link: "/aster-multiseat-software",
    name: "Aster Multiseat Software- 1 PC Multiple User",
    price: "৳1,590.00 – ৳10,990.00",
    cutPrice: "",
    reviews: 3,
    category: "business-management",
    sale: true,
    tags: [
        "1-pc-multiple-user",
        "aster-multiseat-software-in-bd"
    ],
    tagName: [
        "1 PC multiple user",
        "Aster Multiseat Software in BD"
    ]
    },
    {
    id: 7,
    image: "https://shop.softsheba.com/wp-content/uploads/2023/11/Become-a-reseller-min-300x409.png",
    link: "/become-a-reseller",
    name: "Become a Reseller of Softsheba",
    price: "৳20,000.00 – ৳45,000.00",
    cutPrice: "",
    reviews: 3,
    category: "uncategorized",
    sale: false,
    tags: [
        "become-a-reseller"
    ],
    tagName: [
        "Become a Reseller"
    ]
    },
    {
    id: 8,
    image: "https://shop.softsheba.com/wp-content/uploads/2024/03/combo-offer-1-Year-softsheba-ltd-300x408.png",
    link: "/marketing-software-collection-combo-offer",
    name: "Marketing Software Collection | Combo Offer",
    price: "৳7,176.00",
    cutPrice: "৳8,970.00",
    reviews: 0,
    category: "marketing-tools",
    sale: true,
    tags: [
        "digital-marketing-tools",
        "combo-offer"
    ],
    tagName: [
        "Digital Marketing Tools"
    ]
    },
    {
    id: 9,
    image: "https://shop.softsheba.com/wp-content/uploads/2024/05/Business-Sender-min-300x408.webp",
    link: "/business-sender-whatsapp-marketing-software-1-year",
    name: "Business Sender- WhatsApp Marketing Software (1 Year)",
    price: "৳1,990.00",
    cutPrice: "",
    reviews: 0,
    category: "marketing-tools",
    sale: false,
    tags: [
        "whatsapp-marketing-software",
        "business-sender"
    ],
    tagName: [
        "Whatsapp Marketing Software"
    ]
    },
    {
    id: 10,
    image: "https://shop.softsheba.com/wp-content/uploads/2025/01/wacrm-software-box-300x408.png",
    link: "/whatsapp-crm-all-in-one-whatsapp-business-solution",
    name: "Whatsapp CRM-All-in-One WhatsApp Business Solution",
    price: "৳2,490.00 – ৳3,990.00",
    cutPrice: "",
    reviews: 0,
    category: "marketing-tools",
    sale: true,
    tags: [
        "whatsapp-marketing-software"
    ],
    tagName: [
        "Whatsapp Marketing Software"
    ]
    }
]

export default function fethchedByCategory (category: string)  {
    const filteredCategoryProduct = products.filter(p => p.category === category);
    return filteredCategoryProduct;
};

