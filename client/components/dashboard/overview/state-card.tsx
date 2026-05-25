import React from "react";
import { type LucideIcon } from "lucide-react";
import LoadingCom from "@/components/shared/loading-com";
import { CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  Icon: LucideIcon;
  currency?: string;
  amount?: number | string;
  className?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  Icon,
  currency,
  amount,
  className = "",
  loading = false,
}) => {
  return (
    <>
      {loading ? (
        <LoadingCom displayText="Loading..." />
      ) : (
        <>
          <CardContent
            className={`border border-gray-200 justify-between dark:border-gray-800 w-full p-6 rounded-lg ${className}`}
          >
            <div className="text-center xl:mb-0 mb-3">
              <div className={`text-center inline-block text-3xl`}>
                <Icon />
              </div>
              <div>
                <p className="mb-3 text-base font-medium text-gray-50 dark:text-gray-100">
                  {title}
                </p>
                <p className="text-2xl font-bold leading-none text-gray-50 dark:text-gray-50">
                  {currency}
                  {amount}
                </p>
              </div>
            </div>
          </CardContent>
        </>
      )}
    </>
  );
};

export default StatCard;
