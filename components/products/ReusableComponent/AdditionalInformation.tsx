"use client"
import React from 'react'
import { easeInOut, motion } from 'framer-motion'
type License = string;

type AdditionalInfo = {
  name: string;
  description: string;
}

interface LicenseProps {
  license?: License[];
  additionalInfo?: AdditionalInfo[]
}

export default function AdditionalInformation({license, additionalInfo}: LicenseProps) {
  console.log(license)
  return (
    <motion.div
    initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: easeInOut }}
    className='px-8 py-6'>
          <h1 className='text-[26px] text-[#333] border-b pb-2 border-dotted border-gray-200'>
            Additional Information
        </h1>
      {
        license  && (
          <>
        <p className='px-6 pt-3 text-[#666] text-sm'>
      {license?.map((l, i) => (<p className='flex gap-8 font-bold' key={i}><span>License Type</span> <span className='italic font-normal'>{l}</span> </p>))}
    
        </p>
          </>
        )
      }
      {
        additionalInfo && (
          additionalInfo.map((a, i) => (
            <div key={i} className='pt-3 text-[#666] flex text-sm'>
              <p className='flex w-full gap-8 px-6 py-2 border-b border-gray-200 border-dotted'>
                <span className='font-bold '>
                  {a.name}
                </span>
                 {a.description}
              </p>
            </div>
          ))
        )
      }
        
    </motion.div>
  )
}
