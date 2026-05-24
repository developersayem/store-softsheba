"use client"
import ReviewPage from '@/app/shared/ReviewPage';
import React from 'react';
import { FaStar } from 'react-icons/fa';

export default function CreateReview({name, reviews}: {name: string; reviews: number}) {


  return (
    <div className="px-10 mx-auto md:px-14 lg:px-10 xl:px-0 lg:max-w-6xl">
      {
            reviews ? 
            <>          
            <h2 className="mb-4 text-[26px] font-medium text-[#333]">{`${reviews} reviews for ${name}`}</h2>
            <div className='grid grid-cols-1 gap-12 mt-7 mb-14'>
              <div>
                {/* fetch from real data */}
                <div className='flex'>
                {
                  // There will be real data
                  [1,2,3,4,5].map(s => (    
                    <FaStar  key={s} className='text-[#e09900]'/>
                  ))
                }
                  
                </div>
                <div className='mt-1'>
                  <h3 className='text-[#767676] text-sm font-semibold'>
                    Name <span className='italic font-normal'>(verified owner)</span> - <span className='font-normal'>February 5, 2025</span>
                  </h3>
                  <p className='mt-1 text-[#666666] text-sm'>
                    Business Pro has really helped my business. It is very easy to use and has smart tools that make my WhatsApp marketing better. The support team is kind and quick to help. I really recommend it!
                  </p>
                </div>
              </div>
            </div>
            </>
            :
            
      <h2 className="mb-4 text-[26px] font-medium text-[#333]">Reviews</h2>
        }
        <div>
          
        </div>
      <ReviewPage  reviews={reviews} name={name}/>
    </div>
  );
}
