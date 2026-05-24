"use client"
import React from 'react'
import { easeInOut, motion } from 'framer-motion'

export default function SMSMarketing() {
  return (
    <motion.div
    initial={{opacity: 0}}
    animate={{opacity: 1}}
    transition={{duration: 1, ease: easeInOut}}
    className='px-6 py-8'>
        
        <h1 className='mb-2 text-3xl'>
          SMS মার্কেটিং করুন
        </h1>
        <p className='text-sm text-[#666]'>
          আপনার স্মার্ট ফোনকে বানিয়ে ফেলুন এসএমএস গেটওয়ে আর এস এম এস পাঠান অপারেটর  রেটে। <br />
🔥কম খরচে আপনার ব্যাবসা/প্রতিষ্ঠানের প্রচারের জন্য SMS মার্কেটিং করুন🔥 <br />
SMS Gateway by android phone <br />
যেকোন ব্যবসা প্রতিষ্ঠান/ কোম্পানি, স্কুল, কলেজ, ক্লাব, পণ্যের ইত্যাদি SMS পাঠাতে পারেন। <br />
বাংলা এবং ইংরেজীতে, যেমন- ছাত্র/ছাত্রী উপস্থিতি, কর্মীর উপস্থিতি, ইনফরমেশন শেয়ার, শুভেচ্ছা, মার্কেটিং, ডিসকাউন্ট,অফার, এলার্ট, প্রমোশন ইত্যাদি।
        </p>
        <p className='text-sm text-[#666] mt-4'>
          সারা বাংলাদেশে আমরাই একমাত্র এমন কম মূল্যে SMS সার্ভিস দিচ্ছি। যা আপনি অন্য কোথায় পাবেন না।
        </p>
        <ul className='text-sm text-[#666] space-y-1'>
          <li>
            ✅ প্রতি ৩০ টাকায় ৫০০ জনকে এসএমএস করতে পারবেন।
          </li>
          <li>
            ✅ সব অপারেটর নাম্বারে SMS পাঠাতে পারবেন।
          </li>
          <li>
            ✅ বাংলা, ইংরেজী উভয় ধরনের মেসেজ সার্পোটেড।
          </li>
          <li>
            ✅ যেকোন জায়গা থেকে কম্পিটউটার/ল্যাপটপ বা স্মার্ট ফোনের মাধ্যমে এসএমএস পাঠাতে পারবেন।
          </li>
          <li>
            ✅ আপনার ইচ্ছামতো বড় SMS দিতে পারবেন।
          </li>
          <li>
            ✅ আরো পাচ্ছেন API integration এর সুবিধা!
          </li>
          <li>
            ✅ কন্টাক্ট-লিস্ট সেভ করে রাখার সুবিধা।
          </li>
          <li>
            ✅ শিডিউল করে মেসেজ পাঠানোর সুবিধা।
          </li>
        </ul>
        <p className='text-sm text-[#666] mt-4'>
          
        ফ্রিতে ডেমো ৭ দিন ব্যবহার করতে  রেজিষ্ট্রেশন করুন।
        </p>
    </motion.div>
  )
}
