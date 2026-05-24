import React from "react";
interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <main className="min-h-screen mt-18 lg:mt-0">
      {children}
    </main>
  );
}
