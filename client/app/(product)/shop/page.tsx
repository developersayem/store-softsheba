import ShopProducts from '@/components/products/Shop/ShopProducts'
import React from 'react'

export default function page() {

  return (
    <div className='px-8 py-12 mx-auto mt-25 sm:px-10 md:px-16 xl:px-0 lg:max-w-6xl lg:mt-8 xl:mt-6'>
        <div className='px-3 shadow-[0_0_10px_rgba(0,0,0,0.15)] md:px-8 xl:px-10 py-18 lg:py-22'>
            <h1 className='text-[#2b2b2b] text-[26px] px-5 font-semibold'>
                BROWSE PRODUCT
            </h1>
        <ShopProducts />
        </div>
    </div>
  )
}
