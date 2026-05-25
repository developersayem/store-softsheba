import { AuthProvider } from "@/contexts/auth-context";
import type { Metadata } from "next";
import { Anek_Bangla } from "next/font/google";

const font = Anek_Bangla({
  variable: "--font-anek-bangla",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Auth",
  description: "Secure access to your store dashboard",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${font.variable} antialiased`}>
      <AuthProvider>{children}</AuthProvider>
    </div>
  );
}
