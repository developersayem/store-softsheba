import Link from 'next/link';
import React from 'react'
type HeaderProps = {
    fullName: string;
    toolName: string;
    link: string;
}

export default function Header({fullName, toolName, link}: HeaderProps) {
  return (
    <div className='bg-[linear-gradient(212deg,#1ea31b_5%,#29c4a9_28%)]'>
        <div className='flex flex-col items-center justify-center px-8 py-20 text-center text-white'>

      <h1 className='text-3xl lg:text-[35px] font-bold'>
        {fullName}
      </h1>
      <div className='flex flex-wrap items-center justify-center gap-1 pt-5 text-[13px]'>
        <Link href={'/'}>Home </Link>
        <span> /</span>
        <Link href={`/product-category/${link}`}> {toolName} </Link>
        <span> /</span>
        <p>
            {fullName}
        </p>
      </div>
        </div>
    </div>
  )
}
