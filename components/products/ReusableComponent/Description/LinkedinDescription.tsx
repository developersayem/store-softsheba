import React, { ReactNode } from 'react'
type Details = {
  detailsDesc: string;
  video: ReactNode;
};

export default function LinkedinDescription() {

    const details: Details = {
        detailsDesc:
          "Scrape list of emails or phone numbers for LinkedIn professionals by any keyword or location using Google search. Probably the only tool in the market that supports automatic web driver updates for multiple browsers (Chrome, Edge & Firefox), English and Chinese language support etc. Features Name Email address Phone number Position or Designation Profile URL",
        video: (
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/M3-3VTufjQI?si=8gDD65SxK9Q3mNi7"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        ),
      };
  return (
    <div>
      <p className='text-sm text-[#666]'>
        {details.detailsDesc}
      </p>
      <div className='h-[700px] mt-4'>
        {details.video}
      </div>
    </div>
  )
}
