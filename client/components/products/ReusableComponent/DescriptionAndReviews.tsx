"use client";

import React, { ReactNode, useState } from "react";
import { motion, easeInOut } from "framer-motion";

import Reviews from "./Reviews";
import AdditionalInformation from "./AdditionalInformation";
import WhatCanDo from "./WhatCanDo";
import SMSMarketing from "./SMSMarketing";
import LinkedinDescription from "./Description/LinkedinDescription";
import BulkSmsDescription from "./Description/BulkSmsDescription";
import BusinessSenderDescription from "./Description/BusinessSenderDescription";
import MarketingSoftDescription from "./Description/MarketingSoftDescription";
import BusinesProDescription from "./Description/BusinesProDescription";
import WhatsappCrmDescription from "./Description/WhatsappCrmDescription";
import VideoTutorial from "./VideoTutorial";
import InvoiceDescription from "./Description/InvoiceDescription";
import EmailBroadDescription from "./Description/EmailBroadDescription";
import Screenshot from "./Screenshot";
import AsterMultiDescription from "./Description/AsterMultiDescription";
import Faq from "./Faq";
import WhyAster from "./WhyAster";
import LicenseDelivary from "./LicenseDelivary";


type License = string;
type AdditionalInfo = {
  name: string;
  description: string;
}
interface Props {
  reviews: number;
  name: string;
  sectionToShow: string[];
  license?: License[];
  additionalInfo?: AdditionalInfo[] ;
  linkedinDesc?: boolean;
  bulksmsDesc?: boolean;
  businessSender?: boolean;
  marketingSoftDesc?: boolean;
  businessPro?: boolean;
  whatsappCrmDesc?: boolean;
  emailBroadcastDesc?: boolean;
  asterMultiseatDesc?: boolean;
  invoiceDesc?: boolean;
  videoTitle?: string;
  videoTutorial?: ReactNode
}

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  reviews: number;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick, reviews }) => (
  <button
    onClick={onClick}
    className={`px-5 py-1.5 text-sm text-white cursor-pointer transition-all duration-200 ${
      isActive ? "bg-green-600" : "bg-[#15BF86]"
    }`}
  >
    {label}
    {label.toLowerCase() === "reviews" && ` (${reviews})`}
  </button>
);



export default function DescriptionAndReviews({
  reviews,
  name,
  sectionToShow,
  license = [],
  linkedinDesc,
  bulksmsDesc,
  businessSender,
  marketingSoftDesc,
  businessPro,
  whatsappCrmDesc,
  emailBroadcastDesc,
  invoiceDesc,
  asterMultiseatDesc,
  additionalInfo,
  videoTitle,
  videoTutorial
}: Props) {
  const [activeTab, setActiveTab] = useState(sectionToShow[0]);

  return (
    <div className="px-6 py-16 mx-auto md:px-14 lg:px-10 xl:px-0 lg:max-w-6xl">
      <div className="overflow-hidden border border-gray-300">
        <div className="flex flex-col gap-[1px] bg-gray-100 border-b border-gray-200 md:flex-row flex-wrap">
          {sectionToShow.map((label, i) => (
            <TabButton
              key={i}
              label={label}
              isActive={activeTab === label}
              onClick={() => setActiveTab(label)}
              reviews={reviews}
            />
          ))}
        </div>

        {activeTab.toLowerCase() === "description" && (
          <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 1, ease: easeInOut}}
          className="px-8 py-6">
            {
              linkedinDesc && (
                <LinkedinDescription /> 
              )
            }
            {
              bulksmsDesc && (
                <BulkSmsDescription />
              )
            }
            {
              businessSender && (
                <BusinessSenderDescription />
              )
            }
            {
              marketingSoftDesc && (
                <MarketingSoftDescription />
              )
            }
            {
              businessPro && (
                <BusinesProDescription />
              )
            }
            {
              whatsappCrmDesc && (
                <WhatsappCrmDescription />
              )
            }
            {
              emailBroadcastDesc && (
                <EmailBroadDescription />
              )
            }
            {
              invoiceDesc && (
                <InvoiceDescription />
              )
            }
            {
              asterMultiseatDesc && 
              <AsterMultiDescription />
            }
          </motion.div>
        )}

        {activeTab.toLowerCase() === "reviews" && (
          <motion.div
            className="py-6 lg:px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: easeInOut }}
          >
            <Reviews reviews={reviews} name={name} />
          </motion.div>
        )}

        {activeTab.toLowerCase() === "additional information" && (
          <AdditionalInformation license={license} additionalInfo={additionalInfo}/>
        )}

        {activeTab.toLowerCase() === "এই সফটওয়্যার দিয়ে আপনি কি করতে পারবেন?" && (
          <WhatCanDo />
        )}

        {activeTab === "SMS মার্কেটিং করুন" && (
          <SMSMarketing />
        )}
        {
          activeTab.toLowerCase() === "screenshot" && (
            <Screenshot />
          )
        }
        {
          activeTab.toLowerCase() === "faqs" &&
          <Faq />
        }
        {
          activeTab === "Aster Multiseat Software কেন ব্যবহার করবেন?" && 
          <WhyAster />
        }
        {
          activeTab === "🔐 License Delivery Information" && <LicenseDelivary />
        }
        {
  activeTab && activeTab.toLowerCase() === "video tutorial" && 
  videoTitle && videoTutorial && (
    <VideoTutorial videoTitle={videoTitle} videoTutorial={videoTutorial} />
  )
}
      </div>
    </div>
  );
}
