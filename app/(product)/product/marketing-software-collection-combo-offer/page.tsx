import Actions from "@/components/products/ReusableComponent/Actions";
import CreateReview from "@/components/products/ReusableComponent/CreateReview";
import DescriptionAndReviews from "@/components/products/ReusableComponent/DescriptionAndReviews";
import Header from "@/components/products/ReusableComponent/Header";
import LinkedinPrimaryDetails from "@/components/products/ReusableComponent/LinkedinPrimaryDetails";
import PageLayout from "@/components/products/ReusableComponent/PageLayout";
import RelatedProducts from "@/components/products/ReusableComponent/RelatedProducts";
import React from "react";

type DetailsLink = {
  title: string;
  link: string;
};
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
  description?: string[];
  sectionToShow: string[];
  detailsLinks?: DetailsLink[];
  cutPrice: string;
  sale: boolean;
}



export default function page() {
  const product: ProductDetails = {
    image:
      "https://shop.softsheba.com/wp-content/uploads/2024/03/combo-offer-1-Year-softsheba-ltd.png",
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
    sale: true
  };


  const marketingSoftDesc:boolean = true;
  
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
        marketingSoftDesc={marketingSoftDesc}
        sectionToShow={product.sectionToShow}
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
