"use client";

import { AlertTriangle } from "lucide-react";

const UnderMaintenance = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <AlertTriangle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">
          We’ll be back soon
        </h1>
        <p className="text-muted-foreground">
          Our store is currently under maintenance.
          Please check back later.
        </p>
      </div>
    </div>
  );
};

export default UnderMaintenance;