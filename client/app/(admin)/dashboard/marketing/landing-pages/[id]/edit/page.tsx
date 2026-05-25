"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import LandingPageBuilder from "@/components/dashboard/landing-pages/LandingPageBuilder";

export default function EditLandingPagePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useSWR(`landing-pages/${id}`, fetcher);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading...
      </div>
    );
  }

  const lp = data?.data;
  if (!lp) {
    return (
      <div className="p-6 text-red-500">Landing page not found.</div>
    );
  }

  return <LandingPageBuilder initialData={lp} isEditing />;
}
