import Image from 'next/image';
import Link from 'next/link';
import React from 'react'


export default function BusinesProDescription() {
    
  return (
    <div className='text-[#333] text-lg lg:text-[26px]'>
        <h1>
            Business Pro (WhatsApp Marketing Software)
        </h1>
        <div>
    <iframe
              className="w-full h-[600px]"
              width="560"
              height="315"
              src="https://www.youtube.com/embed/umKXHxwPRlc?si=SH6JAGKG7gVd8HPy"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
        </div>
        <p className='mb-5'>
            Business Pro Home Interface ( This is the contact sender option)
        </p>
        <Image src={'https://shop.softsheba.com/wp-content/uploads/2023/08/Business-pro-ss-1-980x570.png'} alt='image business pro' width={980} height={570} className='mb-2'/>
        <h2 >
            All effective Tools in the software tools section
        </h2>
        <Image src={'https://shop.softsheba.com/wp-content/uploads/2023/08/business-pro-ss-2-980x567.png'} alt='image business pro' width={980} height={570}/>
        <h2 className='mt-3'>
            Business Pro (Manage Accounts) You can log in to multiple accounts
        </h2>
        <Image src={'https://shop.softsheba.com/wp-content/uploads/2023/08/Business-pro-ss-manage-accounts.png'} alt='' width={600} height={570}/>
        <h2>
            Software Settings Menu
        </h2>
        <Image  src={'https://shop.softsheba.com/wp-content/uploads/2023/08/Business-pro-ss-4.png'} alt='Image business pro' width={600} height={399}/>
        <Link href={'https://www.youtube.com/watch?v=wTEEDh76fR4&list=PLLPOt6aaeQP0TcuKBeW6gMXwGatmQYaTD'} className='text-[#2ae048] text-sm'>Totorial Playlist</Link>
    </div>
  )
}
