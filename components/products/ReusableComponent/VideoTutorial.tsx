"use client"
import React, { ReactNode } from 'react'
import { easeInOut, motion } from "framer-motion"


export default function VideoTutorial({videoTitle, videoTutorial} : {videoTitle: string; videoTutorial: ReactNode}) {
  return (
    <motion.div
    className='px-8 py-6'
    initial={{opacity: 0}}
    animate={{opacity: 1}}
    transition={{duration: 1, ease: easeInOut}}
    >
        <h2 className='text-[26px] text-[#333]'>
            {videoTitle}
        </h2>
        <div>
            {videoTutorial}
        </div>
    </motion.div>
  )
}
