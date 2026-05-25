"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SupportDetailsPage() {
  const { id } = useParams();
  const { data, isLoading } = useSWR(`/support/${id}`, fetcher);
  const router = useRouter();
  const mail = data?.data;

  if (isLoading) return <p>Loading...</p>;
  if (!mail) return <p>Support mail not found</p>;

  return (
    <div className="bg-accent/50 p-10 rounded-2xl">
      <Button
        variant="outline"
        className="mb-6 flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" /> Go Back
      </Button>
      <h1 className="text-2xl font-bold mb-2">{mail.name}</h1>
      <p className="text-sm text-muted-foreground">{mail.email}</p>
      {mail.phone && <p className="text-sm">{mail.phone}</p>}

      <p className="text-sm mt-2 text-gray-500">
        {format(new Date(mail.createdAt), "dd MMM yyyy, hh:mm a")}
      </p>

      <div className="mt-6 p-4 bg-accent rounded-lg">
        <p className="whitespace-pre-wrap">{mail.message}</p>
      </div>
    </div>
  );
}
