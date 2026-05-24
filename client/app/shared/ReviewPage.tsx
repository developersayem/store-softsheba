"use client"
import React, { useState } from 'react'
import { FaStar } from 'react-icons/fa';

export default function ReviewPage({name, reviews}: {name: string; reviews: number}) {
    const [rating, setRating] = useState(0);
      const [hover, setHover] = useState(0);
  return (
    <div>
        {
        reviews ? <> 
        <p className="mb-6 text-sm text-[#666]">
       Add a review <br /> Your email address will not be published. Required fields are marked <span className="text-red-500">*</span>
      </p> 
        </>:
        <>
        
      <p className="mt-6 text-[#666]">
        Be the first to review <span className="font-medium">“{name}”</span>
      </p>
      <p className="mb-6 text-sm text-[#666]">
        Your email address will not be published. Required fields are marked <span className="text-red-500">*</span>
      </p>
        </>
      }

      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => {
          const ratingValue = i + 1;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setRating(ratingValue)}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(rating)}
              className="text-green-500"
            >
              <FaStar
                size={24}
                color={ratingValue <= (hover || rating) ? '#22c55e' : '#d1d5db'}
              />
            </button>
          );
        })}
      </div>

      {/* Review Form */}
      <form className="space-y-4">
        <textarea
          placeholder="Your review *"
          className="w-full h-32 p-3 rounded-md bg-[#eee] focus:outline-none text-[#666]"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Name *"
            className="w-full p-3 bg-[#eee] rounded-md focus:outline-none text-[#666]"
          />
          <input
            type="email"
            placeholder="Email *"
            className="w-full p-3 bg-[#eee] rounded-md focus:outline-none text-[#666]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="saveInfo" className="accent-blue-700" />
          <label htmlFor="saveInfo" className="text-sm text-[#666]">
            Save my name, email, and website in this browser for the next time I comment.
          </label>
        </div>

        <button
          type="submit"
          className="px-6 py-2 text-[#15bf86] transition-all duration-300 border border-[#15bf86] rounded-md hover:bg-[#15bf86] hover:text-white cursor-pointer"
        >
          SUBMIT
        </button>
      </form>
    </div>
  )
}
