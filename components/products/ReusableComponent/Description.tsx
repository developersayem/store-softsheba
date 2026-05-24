"use client";
import React, { ReactNode } from "react";
import { easeInOut, motion } from "framer-motion"

type Detail = {
  id?: number;
  title?: string;
  description?: string | string[];
  subPoints?: string[];
  detailsDesc?: string;
  video?: ReactNode;
  link?: string
};


export default function Description({ details }: { details: Detail }) {
  return (
    <motion.div className="h-auto px-8 py-6 space-y-6"
    initial={{opacity: 0}}
    animate={{opacity: 1}}
    transition={{duration: 1.2, ease: easeInOut}}
    >
      <p className="leading-relaxed text-[#666] text-sm">
        {details.detailsDesc}
      </p>
      {
        details.video &&
        
      <div className="flex justify-center w-full overflow-hidden">
        <div className="w-full h-full aspect-video">
          {details.video}
        </div>
      </div>
      }
    </motion.div>
  );
}
