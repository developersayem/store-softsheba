import Actions from "@/components/products/ReusableComponent/Actions";
import DescriptionAndReviews from "@/components/products/ReusableComponent/DescriptionAndReviews";
import Header from "@/components/products/ReusableComponent/Header";
import LinkedinPrimaryDetails from "@/components/products/ReusableComponent/LinkedinPrimaryDetails";
import PageLayout from "@/components/products/ReusableComponent/PageLayout";
import RelatedProductTwo from "@/components/products/ReusableComponent/RelatedProductTwo";
import React from "react";
interface ProductDetails {
  image: string;
  name: string;
  price: string;
  category: string;
  link: string;
  tagName1: string;
  tagLink1: string;
  tagName2: string;
  tagLink2: string;
  reviews: number;
  licenseOption: string[];
  description: string[];
  sectionToShow: string[];
  sale: boolean;
}


type License = string;

export default function page() {
  const product: ProductDetails = {
    image:
      "https://shop.softsheba.com/wp-content/uploads/2025/01/wacrm-software-box.png",
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
    sale: true
  };

  const whatsappCrmDesc:boolean = true;

  

  const license: License[] = ["Yearly, Lifetime"];

  return (
    <div>
      <PageLayout>
        <Header
          fullName="Whatsapp CRM-All-in-One WhatsApp Business Solution"
          toolName="Marketing Tools"
          link={product.link}
        />
        <LinkedinPrimaryDetails product={product} />
        <DescriptionAndReviews
          sectionToShow={product.sectionToShow}
          reviews={product.reviews}
          whatsappCrmDesc={whatsappCrmDesc}
          name=""
          license={license}
        />
        <div className="my-12 bg-gray-50">
          <RelatedProductTwo />
        </div>
        <Actions />
      </PageLayout>
    </div>
  );
}
