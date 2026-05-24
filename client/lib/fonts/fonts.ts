import { NextFont } from "next/dist/compiled/@next/font";
// import localFont from "next/font/local";
import { Anek_Bangla, Assistant, Catamaran, Nunito, Sora } from "next/font/google";


export const sora:NextFont = Sora({
  subsets: ["latin"],
  weight: [ "400", "500" , "800"],
  fallback: ["Helvetica", "Arial", "Lucida", "sans-serif"],
  display: "swap"
})

export const assistant:NextFont = Assistant({
  subsets: ["latin"],
  weight: [ "400", "500", "600"],
  fallback: ["Helvetica", "Arial", "Lucida", "sans-serif"],
  display: "swap"
})

export const catamaran:NextFont = Catamaran({
  subsets: ["latin"],
  weight: [ "400", "500", "600", "700", "800"],
  fallback: ["Helvetica", "Arial", "Lucida", "sans-serif"],
  display: "swap"
})

export const anekBangla:NextFont = Anek_Bangla({
  subsets: ["latin"],
  weight: [ "400", "500", "600", "700", "800"],
  fallback: ["Helvetica", "Arial", "Lucida", "sans-serif"],
  display: "swap"
})


export const nunito:NextFont = Nunito({
  subsets: ["latin"],
  weight: [ "400", "500", "600", "700"],
  fallback: ["Helvetica", "Arial", "Lucida", "sans-serif"],
  display: "swap"
})

