import Actions from "@/components/products/ReusableComponent/Actions";
import CreateReview from "@/components/products/ReusableComponent/CreateReview";
import DescriptionAndReviews from "@/components/products/ReusableComponent/DescriptionAndReviews";
import Header from "@/components/products/ReusableComponent/Header";
import LinkedinPrimaryDetails from "@/components/products/ReusableComponent/LinkedinPrimaryDetails";
import PageLayout from "@/components/products/ReusableComponent/PageLayout";
import RelatedProducts from "@/components/products/ReusableComponent/RelatedProducts";
import React from "react";
interface ProductDetails {
  image: string;
  name: string;
  price: string;
  licenseType?: string;
  category: string;
  link: string;
  tagName1: string;
  tagLink1: string;
  tagName2: string;
  tagLink2: string;
  reviews: number;
  licenseOption?: string[];
  description: string[];
  sectionToShow: string[];
  sale: boolean;
}



type License = string;

export default function page() {
  const product: ProductDetails = {
    image:
      "https://shop.softsheba.com/wp-content/uploads/2023/08/Business-Pro-Whatsapp-Marketing-Software-min.png",
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
    sale: false
  };

  
  const license: License[] = ["1 Month, 6 Month, 1 Year, 3 Year, Lifetime"];

  const businessPro:boolean = true;

  return (
    <div>
      <PageLayout>
        <Header fullName={product.name} toolName="Marketing Tools" link={product.link}/>
        <LinkedinPrimaryDetails product={product} />
        <DescriptionAndReviews
          sectionToShow={product.sectionToShow}
          reviews={product.reviews}
          businessPro={businessPro}
          name={product.name}
          license={license}
        />
        <div className="mb-8 mt-18">
          <CreateReview name={product.name} reviews={product.reviews} />
        </div>
        <div className="my-12 bg-gray-50">
          <RelatedProducts />
        </div>
        <Actions />
      </PageLayout>
    </div>
  );
}
