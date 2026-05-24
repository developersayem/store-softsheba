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
  licenseType: string;
  category: string;
  link: string;
  tagName1: string;
  tagLink1: string;
  reviews: number;
  sectionToShow: string[],
  sale: boolean;
}



export default function Page() {
  const product: ProductDetails = {
    image:
      "https://shop.softsheba.com/wp-content/uploads/2023/10/Linkedin-Extream-min.png",
    name: "Linkedin Extream | Scrap lead from Linkedin",
    price: "৳ 3,999.00",
    licenseType: "1 Year",
    category: "Marketing Tools",
    link: "marketing-tools",
    tagName1: "Linkedin Extream",
    tagLink1: "linkedin-extream",
    reviews: 0,
    sectionToShow: [
      "Description",
      "Reviews"
    ],
    sale: false
  };
  
  const linkedinDesc:boolean = true;

  

  return (
    <div className="mt-20 lg:mt-0">
      <PageLayout>
        <Header
          fullName={product.name}
          toolName={product.category}
          link={product.link}
        />
        <LinkedinPrimaryDetails product={product} />
        <DescriptionAndReviews
          reviews={product.reviews}
          name={product.name}
          sectionToShow={product.sectionToShow}
          linkedinDesc={linkedinDesc}
        />
        <div className="py-20">
          <CreateReview name={product.name} reviews={product.reviews} />
        </div>
        <div className='my-12 bg-gray-50'>
                            <RelatedProducts />
                        </div>
        <div>
          
        <Actions />
        </div>
      </PageLayout>
    </div>
  );
}
