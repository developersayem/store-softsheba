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
  category: string;
  link: string;
  tagName1: string;
  tagName2: string;
  tagLink1: string;
  tagLink2: string;
  reviews: number;
  sectionToShow: string[];
  shortDesc: string;
  sale: boolean;
}

export default function page() {
  const product: ProductDetails = {
    image:
      "https://shop.softsheba.com/wp-content/uploads/2024/05/Business-Sender-min.webp",
    name: "Business Sender- WhatsApp Marketing Software (1 Year)",
    price: "৳1,999.00",
    shortDesc:
      "It's required off your system anti-virus Update depend on the manufactured company",
    category: "Marketing Tools",
    link: "marketing-tools",
    tagName1: "Business Sender",
    tagName2: "Whatsapp marketing Software",
    tagLink1: "business-sender",
    tagLink2: "whatsapp-marketing-software",
    reviews: 0,
    sectionToShow: ["Description", "Reviews"],
    sale: false
  };

  const businessSender: boolean = true;

  return (
    <PageLayout>
      <Header
        fullName={product.name}
        toolName={product.category}
        link={product.link}
      />
      <LinkedinPrimaryDetails product={product} />
      <DescriptionAndReviews
        sectionToShow={product.sectionToShow}
        reviews={product.reviews}
        name={product.name}
        businessSender={businessSender}
      />
      <div className="py-20">
        <CreateReview name={product.name} reviews={product.reviews} />
      </div>
      <div className="my-12 bg-gray-50">
        <RelatedProducts />
      </div>
      <div>
        <Actions />
      </div>
    </PageLayout>
  );
}
