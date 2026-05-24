
import React from 'react'
import FooterProduct from './FooterProduct';
import FooterServices from './FooterServices';
import FooterResources from './FooterResources';
import FooterDetails from './FooterDetails';


export default function Footer() {



  return (
    <div className='py-12 px-8 lg:py-20 lg:px-22 xl:py-20 bg-[#f0f6ff]'>
      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 text-sm gap-8 md:gap-12 lg:gap-18 xl:gap-18 2xl:gap-24'>

      <FooterDetails />
      <FooterProduct/>
      <FooterServices />
      <FooterResources />
      </div>
      <p className="text-sm text-center col-span-full text-[#0c71c3] font-normal pt-16">
    Copyright © {new Date().getFullYear()} Softsheba Ltd. All rights reserved.
  </p>
    </div>
  )
}
