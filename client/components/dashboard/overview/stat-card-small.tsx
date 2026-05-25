import React from "react";
// import useUtilsFunction from "@/hooks/useUtilsFunction";
import LoadingCom from "@/components/shared/loading-com";
import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardSmallProps {
  title: string;
  Icon: LucideIcon;
  amount?: number | string;
  className?: string;
  loading?: boolean;
}

const StatCardSmall: React.FC<StatCardSmallProps> = ({
  title,
  Icon,
  amount,
  className = "",
  loading = false,
}) => {
  //   const { getNumberTwo } = useUtilsFunction();

  return (
    <>
      {loading ? (
        <LoadingCom displayText="Loading..." />
      ) : (
        <Card className="flex h-full">
          <CardContent className="flex items-center w-full rounded-lg">
            <div
              className={`flex items-center justify-center p-3 rounded-full h-12 w-12 text-center mr-4 text-lg ${className}`}
            >
              <Icon />
            </div>

            <div>
              <h6 className="text-sm mb-1 font-medium text-gray-600 dark:text-gray-400">
                <span>{title}</span>{" "}
              </h6>
              <p className="text-2xl font-bold leading-none text-gray-600 dark:text-gray-200">
                {amount}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default StatCardSmall;
