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
  tagName2?: string;
  tagLink2?: string;
  reviews: number;
  licenseOption?: string[];
  description: string[];
  sectionToShow: string[];
  feat: string;
  sale: boolean;
}

type License = string;

export default function page() {
  const product: ProductDetails = {
    image:
      "https://shop.softsheba.com/wp-content/uploads/2023/08/Email-broadcast-email-marketing-software-softbarta-min.png",
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
  };

  const license: License[] = ["1 Year, Lifetime"];
  const emailBroadcastDesc = true;
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
        emailBroadcastDesc={emailBroadcastDesc}
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
  );
}
