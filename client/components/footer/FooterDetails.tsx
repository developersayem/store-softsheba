"use client"
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { FaFacebookF, FaInstagram, FaSkype, FaWhatsapp, FaYoutube } from 'react-icons/fa'

export default function FooterDetails() {
  return (
    <div>
    <Image
    src={`/assets/logo/footer-softsheba.png`}
    alt='footer'
    width={180}
    height={42}
    />
    <div className='py-4 text-[#666666] space-y-1'>
      <h6 className='font-bold'>
      UK Office:
    </h6>
    <p>
      City Bar & Kitchen, 9, Stony Lane, London, United Kingdom, E1 7BH
    </p>
    <h6 className='font-bold'>
      Bangladesh Office: 
    </h6>
    <p>
      50/R.K Mission Road, Mymensingh-2200
    </p>
    </div>
    <div>
      <h6 className='text-[#0c71c3] font-semibold pb-4'>
        Support: 24/7
      </h6>
      <div className='flex items-center px-2 border border-green-700'>
        <div className='border-r border-green-700'>

      <Image
      src={`/assets/logo/customer-service.png`}
      alt='support'
      width={62}
      height={62}
      className='py-1'
       />
        </div>
       <div className='px-2 space-y-1 flex-col flex'>
        <Link href={`tel:(+88)%2001967-557788`} className='text-[#333399] font-bold'>Hotline: <span className='font-semibold'>8801967557799</span></Link>
        <Link href={`mailto:support@softsheba.com`} className='text-[#666699]'>
          support@softsheba.com
        </Link>
       </div>
      </div>
    </div>
    {/* Links */}
    <div className='flex gap-2 mt-8 lg:mt-16'>
      <Link href={`#`} className='p-2 bg-[#3b5998] text-white rounded' >
      <FaFacebookF size={16}/>
      </Link>
      <Link href={`#`} className='p-2 bg-[#ea2c59] text-white rounded'>
      <FaInstagram size={16} />
      </Link>
      <Link href={`#`} className='p-2 bg-[#a82400] text-white rounded'>
      <FaYoutube size={16} />
      </Link>
      <Link href={`#`} className='p-2 bg-[#25D366] text-white rounded'>
      <FaWhatsapp size={16} />
      </Link>
      <Link href={`#`} className='p-2 bg-[#12A5F4] text-white rounded'>
      <FaSkype size={16} />
      </Link>
    </div>
      </div>
  )
}
