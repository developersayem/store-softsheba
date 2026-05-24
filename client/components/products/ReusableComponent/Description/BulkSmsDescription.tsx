import Link from 'next/link';
import React from 'react';

type Details = {
    banglaList: string[];
    englishList: string[]
}

export default function BulkSmsDescription() {
    const details:Details = {
        banglaList: [
            "✅ প্রতি ৩০ টাকায় ৫০০ জনকে এসএমএস করতে পারবেন।",
"✅ সব অপারেটর নাম্বারে SMS পাঠাতে পারবেন।",
"✅ বাংলা, ইংরেজী উভয় ধরনের মেসেজ সার্পোটেড।",
"✅ যেকোন জায়গা থেকে কম্পিটউটার/ল্যাপটপ বা স্মার্ট ফোনের মাধ্যমে এসএমএস পাঠাতে পারবেন।",
"✅ আপনার ইচ্ছামতো বড় SMS দিতে পারবেন।",
"✅ আরো পাচ্ছেন API integration এর সুবিধা!",
"✅ কন্টাক্ট-লিস্ট সেভ করে রাখার সুবিধা।",
"✅ শিডিউল করে মেসেজ পাঠানোর সুবিধা।",
        ],
        englishList: [
    `Send bulk messages:- Use CSV or Excel file containing numbers to send bulk messages.`,
`Supports very long messages:- Send SMS with virtually no limit. You won’t be bound by the SMS character limit (160 Characters).`,
`Supports delay between messages:- You can set delay between each message to send a limited amount of messages in specific time intervals.`,
`Autoresponder:- You can add responses for certain messages so whenever you receive that message, the app will reply to it automatically.`,
`Supports SMS delivery reports:- It also supports tracking of delivery of SMS messages when you turn on delivery reports. It will report the message as ‘Delivered’ when the message is successfully delivered.`,
`Blacklist:- Each user account have their blacklist. Users can add numbers to the blacklist to avoid sending messages to those numbers. Subscribers can also reply with “STOP” to add their number to the user’s blacklist.`,
`Schedule messages:- Send messages on schedule.`,
`Contact lists:- Create contact lists and import contacts into them using an Excel file.`,
`Send a message to contact list:- Send a message to contacts in a contacts list.`,
`Unsubscribe contacts:- Ability to allow a contact to unsubscribe from the contacts list.`,
`Contacts API:- Add contacts or unsubscribe them from the list using the API. `
        ]
    }
  return (
    <div className='text-sm text-[#666]'>
        <h1 className='text-3xl text-[#333]'>
            Bulk SMS Gateway with Web Panel & Android App
        </h1>
        <div className='mt-3 space-y-5'>
            
        <p>
            Are you in need of a reliable solution for sending bulk SMS messages effortlessly? Look no further than this Bulk SMS Gateway with a comprehensive Web Panel and Android App. With the promise of unlimited messaging for all plans, it offers unbeatable value for businesses and individuals alike.
        </p>
        <p>
            One of the standout features of this platform is its versatility. Users can send bulk messages seamlessly using the Gateway, accessing it from multiple devices for added convenience. Organizing contacts is a breeze with the ability to save them by group name and import them in bulk using Excel files. Creating contact lists further streamlines the process, ensuring targeted communication.
        </p>
        <p>
            Saving time is paramount, and this product excels in that regard with its template feature. Users can save message templates for easy access, eliminating the need to retype frequently sent messages. Additionally, the auto-responder functionality adds a layer of automation by allowing predefined responses to specific messages.
        </p>
        <p>
            he scheduling feature ensures that messages are sent at optimal times, maximizing their impact. Moreover, the availability of an API and WordPress plugin opens up endless integration possibilities for websites, adding to the product&apos;s versatility.
        </p>
        </div>
        <p className='mt-12'>
            Bulk SMS Text Messaging Software for Mobile Marketing!
This is an easy-to-use yet powerful SMS
        </p>
        <p>
            /Message broadcasting <Link className='text-[#2ae048]' href={'https://youtu.be/Pf6ZNwyJWBg?si=85t9f2cS3vwPM_LL'}>Gateway for SMS marketing</Link>.
        </p>
        <div className='mt-4 space-y-2'>
            
    {details.englishList.map((d, i) => {
      if (d.includes(":")) {
        const [boldPart, ...rest] = d.split(":");
        const restText = rest.join(":");
        return (
          <li key={i} className="ml-4">
            <strong>{boldPart}:</strong>
            <span> {restText}</span>
          </li>
        );
      }
      return (
        <li key={i} className="pl-3">
          {d}
        </li>
      );
    })}

        </div>
        <p className='mt-6'>
            Powerful <Link className='text-[#2ae048]' href={'/product/bulk-sms-gateway-with-web-panel-android-app/'}>SMS Marketing</Link> Solution by <Link className='text-[#2ae048]' href={'https://softsheba.com'}>Softsheba</Link>
        </p>
        <h2 className='my-3 text-3xl text-[#333]'>
            বাংলা:
        </h2>
        <p>
            আপনার স্মার্ট ফোনকে বানিয়ে ফেলুন এসএমএস গেটওয়ে আর এস এম এস পাঠান অপারেটর  রেটে। <br />
🔥কম খরচে আপনার ব্যাবসা/প্রতিষ্ঠানের প্রচারের জন্য SMS মার্কেটিং করুন🔥 <br />
SMS Gateway by android phone <br />
যেকোন ব্যবসা প্রতিষ্ঠান/ কোম্পানি, স্কুল, কলেজ, ক্লাব, পণ্যের ইত্যাদি SMS পাঠাতে পারেন। <br />
বাংলা এবং ইংরেজীতে, যেমন- ছাত্র/ছাত্রী উপস্থিতি, কর্মীর উপস্থিতি, ইনফরমেশন শেয়ার, শুভেচ্ছা, মার্কেটিং, ডিসকাউন্ট,অফার, এলার্ট, প্রমোশন ইত্যাদি।
        </p>
        <p className='mt-5'>
            সারা বাংলাদেশে আমরাই একমাত্র এমন কম মূল্যে SMS সার্ভিস দিচ্ছি। যা আপনি অন্য কোথায় পাবেন না।
        </p>
        <ul className='space-y-1'>
            {details.banglaList.map((d, i) => (
                <li key={i}>
                    {d}
                </li>
            ))}
        </ul>
        <p className='mt-3'>
            ফ্রিতে ডেমো ৭ দিন ব্যবহার করতে  <Link  className='text-[#2ae048]' href={'https://sms.softbarta.com/register.php'}>রেজিষ্ট্রেশন</Link> করুন।
        </p>
    </div>
  )
}
