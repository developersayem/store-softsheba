"use client"
import React from 'react'
import { easeInOut, motion } from 'framer-motion'
type WhatCanDo = {
    heading:string;
    title: string;
    subHeading: string;
    description: string[];
}

export default function WhatCanDo() {
    const whatCanDo:WhatCanDo = {
    heading: "এই সফটওয়্যার দিয়ে আপনি কি করতে পারবেন?",
    title: "হোয়াটসঅ্যাপ মার্কেটিং করার জন্য সেরা সফটওয়্যার হলো Business Pro",
    subHeading: "চলুন জেনে নেই এই সফটওয়্যার দিয়ে আপনি কি করতে পারবেন?",
    description: [
        "১. হোয়াটসঅ্যাপ মার্কেটিং করতে প্রথমেই আপনার প্র্রয়োজন পড়বে টার্গেট ওয়াইজ লিড, আপনি Business Pro সফটওয়্যার দিয়েই লোকেশন ও ক্যাটাগরি ভিত্তিক লিড কালেক্ট করতে পারবেন। প্রয়োজনে আপনি নাম্বার জেনেরেটও করতে পারবেন। মোবাইল নাম্বারগুলো ফিল্টার করে কোনগুলোতে হোয়াটসঅ্যাপ আছে বা কোনগুলোতে হোয়াটসঅ্যাপ নেই সেটাও খুব সহজেই বের করতে পারবেন।",

"২. Business Pro সফটওয়্যারে আপনি একাধিক হোয়াটসঅ্যাপ একাউন্ট লগিন করে রাখতে পারবেন, প্রয়োজন অনুসারে যেটা ইচ্ছা সেটা দিয়েই আপনার ক্যাম্পেইন রান করতে পারবেন। এবং এখানে বিশেষ একটি ফিচার হলো,আপনি চাইলে সবগুলো একাউন্ট দিয়েই ক্যাম্পেইন করতে পারবেন রাউটিং সিস্টেম করে অর্থাত কয়টি এসএমএস যাওয়ার পর আপনার একাউন্ট পরিবর্তন হয়ে অন্য একাউন্ট থেকে আবার এসএমএস যাবে এমন। ধরুন, আপনি চাচ্ছেন ৫০ টি এসএমএস যাওয়ার পর একাউন্ট পরিবর্তন হয়ে অন্য একটি একাউন্ট থেকে ৫০ টি এসএমএস সেন্ড হবে ঠিক এমন। আপনি যতগুলো ইচ্ছা ততোগুলো একাউন্টই এখানে সংযুক্ত করতে পারেন ফলে আপনার নাম্বার ব্যান হওয়ার চান্স একদম কমে যাবে এবং আপনি বেশি পরিমাণে ক্যাম্পেইন বা এসএমএস পাঠাতে পারবেন।",

`৩. শুধু যে Business Pro দিয়ে আপনি Individual Number গুলোতেই এসএমএস পাঠাতে পারবেন এমন না, আপনি ইচ্ছা করলে বিভিন্ন গ্রুপেও আপনার প্রমোশনাল এসএমএস করতে পারবেন। এজন্য আপনার টার্গেট ওয়াইজ Group Link আমাদের Business Pro সফটওয়্যার দিয়েই সংগ্রহ করতে পারবেন।
এমনকি আপনি যদি কোন গ্রুপে জয়েন থাকেন তাহলে সেই গ্রুপ মেম্বারগুলোর WhatsApp number export করে তাদের কাছে ক্যাম্পেইন করতে পারবেন।`,

`৪. হোয়াটসঅ্যাপ যাতে ব্যান না হয় এজন্য আমাদের Business Pro (WhatsApp marketing software) এর রয়েছে Anti-Blocking Technology এবং সপ্তাহের যেদিন আপনি ক্যাম্পেইন করবেন না, সেদিন WhatsApp account warmer ব্যবহার করবেন ফলে আপনার WhatsApp একাউন্টির Daily Activity ঠিক থাকবে ও আপনার এসএমএস পাঠানোর লিমিট ক্রমান্বয়ে বাড়বে।`
    ]
}
  return (
    <motion.div
    initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: easeInOut }}
    className='px-8 py-6 text-[#666] text-sm'>
        <h1 className='text-[26px] text-[#333]'>
            {whatCanDo.heading}
        </h1>
        <p className='mt-2 font-semibold'>
            {whatCanDo.title}
        </p>
        <p className='mt-2'>
            {whatCanDo.subHeading}
        </p>
        {whatCanDo.description.map((d,i) => (
            <p key={i} className='mt-6'>
                {d}
            </p>
        ))}
        <p className='mt-4'>
            তো দেরী কেন এখনি অর্ডার করুন Business Pro (WhatsApp Marketing Software)
        </p>
    </motion.div>
  )
}
