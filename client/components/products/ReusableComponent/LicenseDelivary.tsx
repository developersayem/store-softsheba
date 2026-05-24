"use client"
import React from 'react'
import { easeInOut, motion } from 'framer-motion'

export default function LicenseDelivary() {
  return (
    <motion.div
    className='px-6 py-8 text-sm text-[#666]'
    initial={{opacity: 0}}
    animate={{opacity: 1}}
    transition={{duration: 1, ease: easeInOut}}
    >
        <h1 className='text-[26px] text-[#333]'>
            🔐 License Delivery Information
        </h1>
        <div className='mt-2 space-y-6'>
            <p>
                If you make your payment using <strong></strong> (Visa, MasterCard, or Credit Card), your <strong>Aster software final license</strong> will be delivered to your email <strong>within 14 days</strong>.Stripe
This delay is due to Stripe’s processing time, which takes up to 14 days to complete on our end.
            </p>
            <p>
                To ensure uninterrupted use, we provide a <strong>temporary pre-license</strong> immediately after your purchase, so you can start using the software right away. The <strong>final license</strong> will be automatically sent to your email once the Stripe payment is fully processed.
            </p>
            <p>
                If you are a <strong>Bangladeshi customer</strong> and use any <strong>local payment method</strong> (e.g., <strong>Bkash, Rocket, or Nagad</strong>), your <strong>final license</strong> will be delivered <strong>within 24 hours</strong> of payment confirmation.
            </p>
        </div>
    </motion.div>
  )
}
