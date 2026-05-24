"use client"
import React from 'react'
import { easeInOut, motion } from 'framer-motion'

type Features = {
    title?: string;
    description?: string
}

export default function InvoiceDescription() {

    const features:Features[] = [
        {
            title: "Stock control",
            description: "For companies that are product-oriented. The Stock control feature helps track how much stock you have at any given time and maintain inventory levels against its cost."
        },
        {
            title: "Purchases module",
            description: "The Purchasing Module allows users to enter, edit, and print purchase invoices. It also provides an easy way to update your inventory.",
        },
        {
            title: "Multiple tax rates",
            description: "Apply multiple tax rates to your items.",
        },
        {
            description: "… and other features:"
        },
        {
            title: "Set up multiple companies.",
        },
        {
            title: "Creating professional invoices with your own logo.",
        },
        {
            title: "Creating Quotes (Quotation) and Proforma Invoices."
        },
        {
            title: "Creating Credit Invoices.",
        },
        {
            title: "Support many languages.",
        },
        {
            title: "Support Inclusive tax/fee for items.",
        },
        {
            title:  "Change any text on the invoice and issue non-English invoices!",
        },
        {
            title: "Currencies from around the world.",
        },
        {
            title: "Rich configuration and customization.",
        },
        {
            title: "Sales TAX, VAT, GST, MwST, IVA, BTW.",
        },
        {
            title: "Five professional-looking invoice templates.",
        },
        {
            title: "Track payments and print statements for customers.",
        },
        {
            title: "Support for shipping – add shipping cost and print Packing Slip.",
        },
        {
            title: "Put your own information and messages on invoices.",
        },
        {
            title: "Send invoice via email.",
        },
        {
            title: "Create categories for products and customers.",
        },
        {
            title: "Support barcode scanner.",
        },
        {
            title: "Support for thermal printers.",
        },
        {
            title: "Business reports such as sales, customers, inventory, profit, payments, overdue and more.",
        },
        {
            title: "Easy backup and restore system.",
        },
        {
            title: "Import and Export tool."
        }
];


  return (
    <motion.div
    initial={{opacity: 0}}
    animate={{opacity: 1}}
    transition={{duration: 1, ease: easeInOut}}
    >
        <h1 className='text-[26px] text-[#333] font-bold'>
            Invoice software for your business
        </h1>
        <h2 className='mb-1 text-[22px] text-[#333]'>            Most accessible invoicing software on the market, designed for self-employed or small business owners.
        </h2>
        <div className='space-y-4 text-[#666] text-sm'>
            {
                features.map((f,i) => (
                    <div key={i} className='space-y-4'>
                        {
                            f.title && (
                                <h4 className='flex gap-1'>
                            <span>◉</span>
                            {f.title}
                        </h4>
                            )
                        }
                        
                        <p>
                            {f.description}
                        </p>
                    </div>
                ))
            }
        </div>
    </motion.div>
  )
}
