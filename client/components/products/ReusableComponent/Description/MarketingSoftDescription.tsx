import React from 'react'

type Details = {
    detailsDesc: string
}
export default function MarketingSoftDescription() {
    const details: Details = {
        detailsDesc:
          "Marketing Software Collection | Combo Offer, You will get WhatsApp Marketing Software, Email Marketing Software, SMS Marketing Software- Softsheba.com",
      };
  return (
    <div>
        <p className='text-sm text-[#666]'>
            {details.detailsDesc}
        </p>
    </div>
  )
}
