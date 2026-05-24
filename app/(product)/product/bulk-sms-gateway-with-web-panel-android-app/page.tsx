import Actions from '@/components/products/ReusableComponent/Actions';
import CreateReview from '@/components/products/ReusableComponent/CreateReview';
import DescriptionAndReviews from '@/components/products/ReusableComponent/DescriptionAndReviews';
import Header from '@/components/products/ReusableComponent/Header'
import LinkedinPrimaryDetails from '@/components/products/ReusableComponent/LinkedinPrimaryDetails';
import PageLayout from '@/components/products/ReusableComponent/PageLayout'
import RelatedProducts from '@/components/products/ReusableComponent/RelatedProducts';
import React from 'react'

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
  feat: string;
  sale: boolean;
}

type License = string;

export default function page() {
      const product: ProductDetails = {
    image:
      "https://shop.softsheba.com/wp-content/uploads/2023/10/SMS-Gateway-min.png",
    name: "Bulk SMS Gateway with Web Panel & Android App",
    price: "৳3,990.00 – ৳5,900.00",
    licenseOption: ["1 Year","Lifetime"],
    category: "Marketing tools",
    link: "marketing-tools",
    tagName1: "Bulk SMS Gateway",
    tagLink1: "bulk-sms-gateway",
    tagName2: "Digital Marketing Tools",
    tagLink2: "digital-marketing-tools",
    reviews: 1,
    description: [
     "Bulk Message: Send Bulk messages using this Gateway",
"Multiple Devices: You can use multiple devices",
"Contacts: You can save your contacts by group name",
"Contact lists:- Create contact lists and import contacts into them using an Excel file.",
"Send a message to contact list:- Send a message to contacts in a contacts list.",
"Template:</b> You can save your message template then any time you use it.",
"Auto responder: You can add responses for certain messages so whenever you receive that message, the app will reply to it automatically.",
"Schedule messages>- Send messages on schedule.",
"API, WordPress Plugin Ready: You can use API for your website.",
    ],
    sectionToShow: [
      "Description",
      "Additional information",
      "SMS মার্কেটিং করুন",
      "Reviews",
    ],
        feat: `Send Unlimited Messages to your client, Our all-plan includes Unlimited Credit.
Android App Ready`,
sale: true

  };

  const bulksmsDesc:boolean = true;
  

  const license: License[] = ["	1 Month, 1Year, 2 Year, 3 Year, Lifetime"];
  return (
    <PageLayout >
        <Header fullName={product.name} toolName={product.category} link={product.link}/>
        <LinkedinPrimaryDetails product={product} />
        <DescriptionAndReviews
                  sectionToShow={product.sectionToShow}
                  reviews={product.reviews}
                  name={product.name}
                  license={license}
                  bulksmsDesc={bulksmsDesc}
                />
                <div className="mb-8 mt-18">
                          <CreateReview name={product.name} reviews={product.reviews} />
                        </div>
                        <div className="my-12 bg-gray-50">
                          <RelatedProducts />
                        </div>
                        <Actions />
    </PageLayout>
  )
}
