"use client"
import React from 'react'
import { easeIn, motion } from 'framer-motion'
import Image from 'next/image'

export default function Screenshot() {
  return (
    <motion.div
    className='flex flex-wrap items-end justify-center gap-1 px-8 py-6 sm:justify-start'
    initial={{opacity: 0}}
    animate={{opacity: 1}}
    transition={{duration: 1, ease: easeIn}}
    >
        <Image src={'https://shop.softsheba.com/wp-content/uploads/2023/08/invoice-screen17-300x188.jpg'} alt='screenshot' width={300} height={188} className='object-cover h-fit w-fit'/>
        <Image src={'https://shop.softsheba.com/wp-content/uploads/2023/08/invoice-screen16-271x300.jpg'} alt='screenshot' width={271} height={300} className='object-cover h-fit w-fit'/>
        <Image src={'https://shop.softsheba.com/wp-content/uploads/2023/08/invoice-screen15-266x300.jpg'} alt='screenshot' width={266} height={300} className='object-cover h-fit w-fit'/>
        <Image src={'https://shop.softsheba.com/wp-content/uploads/2023/08/invoice-screen13-266x300.jpg'} alt='screenshot' width={266} height={300} className='object-cover h-fit w-fit'/>
        <Image src={'https://shop.softsheba.com/wp-content/uploads/2023/08/invoice-screen14-287x300.jpg'} alt='screenshot' width={287} height={300} className='object-cover h-fit w-fit'/>
        <Image src={'https://shop.softsheba.com/wp-content/uploads/2023/08/invoice-screen12-265x300.jpg'} alt='screenshot' width={265} height={300} className='object-cover h-fit w-fit'/>
        <Image src={'https://shop.softsheba.com/wp-content/uploads/2023/08/invoice-screen11-300x281.jpg'} alt='screenshot' width={300} height={281} className='object-cover h-fit w-fit'/>
        <Image src={'https://shop.softsheba.com/wp-content/uploads/2023/08/invoice-screen10-274x300.jpg'} alt='screenshot' width={240} height={300} className='object-cover h-fit w-fit'/>
        <Image src={'https://shop.softsheba.com/wp-content/uploads/2023/08/invoice-screen09-300x188.jpg'} alt='screenshot' width={300} height={188} className='object-cover h-fit w-fit'/>
        <Image src={'https://shop.softsheba.com/wp-content/uploads/2023/08/invoice-screen08-300x188.jpg'} alt='screenshot' width={300} height={188} className='object-cover h-fit w-fit'/>
        <Image src={'https://shop.softsheba.com/wp-content/uploads/2023/08/invoice-screen07-300x188.jpg'} alt='screenshot' width={300} height={188} className='object-cover h-fit w-fit'/>
        <Image src={'https://shop.softsheba.com/wp-content/uploads/2023/08/invoice-screen06-300x188.jpg'} alt='screenshot' width={300} height={188} className='object-cover h-fit w-fit'/>
        <Image src={'https://shop.softsheba.com/wp-content/uploads/2023/08/invoice-screen05-300x188.jpg'} alt='screenshot' width={300} height={188} className='object-cover h-fit w-fit'/>
        <Image src={'https://shop.softsheba.com/wp-content/uploads/2023/08/invoice-screen04-300x271.png'} alt='screenshot' width={300} height={271} className='object-cover h-fit w-fit'/>
        <Image src={'https://shop.softsheba.com/wp-content/uploads/2023/08/invoice-screen03-300x188.jpg'} alt='screenshot' width={300} height={188} className='object-cover h-fit w-fit'/>
        <Image src={'https://shop.softsheba.com/wp-content/uploads/2023/08/invoice-screen02-300x188.jpg'} alt='screenshot' width={300} height={188} className='object-cover h-fit w-fit'/>
        <Image src={'https://shop.softsheba.com/wp-content/uploads/2023/08/invoice-screen01-300x188.jpg'} alt='screenshot' width={300} height={188} className='object-cover h-fit w-fit'/>

    </motion.div>
  )
}
