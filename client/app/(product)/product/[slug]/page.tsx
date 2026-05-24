import Actions from "@/components/products/ReusableComponent/Actions";
import CreateReview from "@/components/products/ReusableComponent/CreateReview";
import DescriptionAndReviews from "@/components/products/ReusableComponent/DescriptionAndReviews";
import Header from "@/components/products/ReusableComponent/Header";
import LinkedinPrimaryDetails from "@/components/products/ReusableComponent/LinkedinPrimaryDetails";
import PageLayout from "@/components/products/ReusableComponent/PageLayout";
import RelatedProducts from "@/components/products/ReusableComponent/RelatedProducts";
import RelatedProductTwo from "@/components/products/ReusableComponent/RelatedProductTwo";
import React from "react";
import { products } from "@/app/data/products";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.id,
  }));
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.id === params.slug);

  if (!product) {
    return notFound();
  }

  const useRelatedTwo = [
    "invoice-software-lifetime-license",
    "aster-multiseat-software",
    "whatsapp-crm-all-in-one-whatsapp-business-solution"
  ].includes(product.id);

  return (
    <div className={product.id === "linkedin-extream-scrap-lead-from-linkedin" ? "mt-20 lg:mt-0" : ""}>
      <PageLayout>
        <Header
          fullName={product.headerFullName || product.name}
          toolName={product.headerToolName || product.category}
          link={product.link}
        />
        {/* @ts-ignore */}
        <LinkedinPrimaryDetails product={product} />
        <DescriptionAndReviews
          reviews={product.reviews}
          name={product.name}
          sectionToShow={product.sectionToShow}
          
          businessPro={product.businessPro}
          asterMultiseatDesc={product.asterMultiseatDesc}
          emailBroadcastDesc={product.emailBroadcastDesc}
          whatsappCrmDesc={product.whatsappCrmDesc}
          bulksmsDesc={product.bulksmsDesc}
          businessSender={product.businessSender}
          invoiceDesc={product.invoiceDesc}
          linkedinDesc={product.linkedinDesc}
          marketingSoftDesc={product.marketingSoftDesc}

          // @ts-ignore
          additionalInfo={product.additionalInfo}
          license={product.license}
          videoTitle={product.videoTitle}
          videoTutorial={product.videoTutorial}
        />
        <div className={product.id.includes("linkedin") || product.id.includes("marketing") || product.id.includes("reseller") ? "py-20" : "mb-8 mt-18"}>
          <CreateReview name={product.name} reviews={product.reviews} />
        </div>
        <div className="my-12 bg-gray-50">
          {useRelatedTwo ? <RelatedProductTwo /> : <RelatedProducts />}
        </div>
        <div>
          <Actions />
        </div>
      </PageLayout>
    </div>
  );
}
