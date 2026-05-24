import Actions from "@/components/products/ReusableComponent/Actions";
import CreateReview from "@/components/products/ReusableComponent/CreateReview";
import DescriptionAndReviews from "@/components/products/ReusableComponent/DescriptionAndReviews";
import Header from "@/components/products/ReusableComponent/Header";
import LinkedinPrimaryDetails from "@/components/products/ReusableComponent/LinkedinPrimaryDetails";
import PageLayout from "@/components/products/ReusableComponent/PageLayout";
import RelatedProductTwo from "@/components/products/ReusableComponent/RelatedProductTwo";
import React from "react";

type License = string;

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
  sectionToShow: string[];
  asterBenefit: string[];
  sale: boolean;
}


export default function page() {
  const product: ProductDetails = {
    image:
      "https://shop.softsheba.com/wp-content/uploads/2023/11/aster-software-box-min.png",
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
    sale: true
  };

  const license: License[] = ["ANNUAL-2, ANNUAL-3, ANNUAL-6, LIFETIME-2, LIFETIME-3, LIFETIME-6"];
  
  const asterMultiseatDesc:boolean = true;

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
        license={license}
       asterMultiseatDesc={asterMultiseatDesc}
      />
      <div className="mb-8 mt-18">
        <CreateReview name={product.name} reviews={product.reviews} />
      </div>
      <div className="my-12 bg-gray-50">
        <RelatedProductTwo />
      </div>
      <Actions />
    </PageLayout>
  );
}
