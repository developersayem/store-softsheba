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
  tagLink1: string;
  reviews: number;
  licenseOption: string[];
  sectionToShow: string[];
  productDetail: string[];
  shortDesc: string;
  sale: boolean;
}

type AdditionalInfo = {
  name: string;
  description: string;
}


export default function page() {
  const product: ProductDetails = {
    image:
      "https://shop.softsheba.com/wp-content/uploads/2023/11/Become-a-reseller-min.png",
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
    sale: false
  };

  const additionalInfo:AdditionalInfo[] = [
    {
      name: "Product",
      description: "Business Pro, SMS Gateway, Email Broadcast, Invoice Software"
    },
    {
      name: "Seller Type",
      description: "Rebrand, Reseller"
    }
  ]

  
  return (
    <PageLayout>
      <Header
        fullName="Marketing Software Collection | Combo Offer"
        toolName="Marketing tools"
        link={product.link}
      />
      <LinkedinPrimaryDetails product={product} />
      <DescriptionAndReviews
        reviews={product.reviews}
        name={product.name}
        sectionToShow={product.sectionToShow}
        additionalInfo={additionalInfo}
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

