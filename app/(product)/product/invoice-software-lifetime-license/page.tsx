import Actions from "@/components/products/ReusableComponent/Actions";
import CreateReview from "@/components/products/ReusableComponent/CreateReview";
import DescriptionAndReviews from "@/components/products/ReusableComponent/DescriptionAndReviews";
import Header from "@/components/products/ReusableComponent/Header";
import LinkedinPrimaryDetails from "@/components/products/ReusableComponent/LinkedinPrimaryDetails";
import PageLayout from "@/components/products/ReusableComponent/PageLayout";
import RelatedProductTwo from "@/components/products/ReusableComponent/RelatedProductTwo";
import React, { ReactNode } from "react";

interface ProductDetails {
  image: string;
  name: string;
  price: string;
  cutPrice: string;
  category: string;
  link: string;
  tagName1: string;
  tagLink1: string;
  tagName2: string;
  tagLink2: string;
  reviews: number;
  licenseOption?: string[];
  sectionToShow: string[];
  videoTitle: string;
  videoTutorial: ReactNode;
  howToUse: string[];
  sale: boolean;
}


export default function page() {
  const product: ProductDetails = {
    image:
      "https://shop.softsheba.com/wp-content/uploads/2023/08/Invoice-software-min.png",
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
    sale: true
  };
  const invoiceDesc:boolean = true;

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
        videoTitle={product.videoTitle}
        videoTutorial={product.videoTutorial}
        invoiceDesc={invoiceDesc}
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
