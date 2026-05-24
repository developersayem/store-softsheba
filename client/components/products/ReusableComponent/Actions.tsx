import Link from 'next/link'
import React from 'react'
import { BiSupport } from 'react-icons/bi'
import { FaClipboardList, FaInfoCircle } from 'react-icons/fa'
import { IoIosReturnLeft } from 'react-icons/io'

export default function Actions() {
  return (
    <div className='px-6 py-8 md:px-12 lg:px-18 xl:px-12 bg-[#f2f3f8] my-12'>
      <div className='grid grid-cols-1s justify-items-center sm:grid-cols-2 md:grid-cols-4 text-[#15bf86]'>
        <Link href={'/'}  className='flex flex-col items-center gap-6'>
        <FaClipboardList size={88} />
        <h3 className='text-[#333] text-lg text-center'>
          Terms & conditions
        </h3>
        </Link>

        <Link href={'/'} className='flex flex-col items-center gap-6'>
        <IoIosReturnLeft size={88}  />
        <h3 className='text-[#333] text-lg text-center'>
          Return policy
        </h3>
        </Link>

        <Link href={'/'} className='flex flex-col items-center gap-6'>
        <BiSupport size={88}  />
        <h3 className='text-[#333] text-lg text-center'>
          Support policy
        </h3>
        </Link>

        <Link href={'/'} className='flex flex-col items-center gap-6'>
        <FaInfoCircle size={88}  />
        <h3 className='text-[#333] text-lg text-center'>
          Terms & conditions
        </h3>
        </Link>
      </div>
    </div>
  )
}
