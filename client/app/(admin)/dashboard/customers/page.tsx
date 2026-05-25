"use client";

import { CustomersTable } from "@/components/dashboard/customers/CustomersTable";
import LoadingCom from "@/components/shared/loading-com";
import { fetcher } from "@/lib/fetcher";
import { ICustomer } from "@/types/order.type";
import useSWR from "swr";

const CustomersPage = () => {
  const { data, isLoading, error, mutate } = useSWR<{ data: ICustomer[] }>(
    "/customers",
    fetcher
  );

  const customersData = data?.data || [];
  //console.log(customersData);

  return (
    <div className=" space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingCom />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center font-medium">
          লোড করা সম্ভব হয়নি।
        </div>
      ) : (
         <CustomersTable customersData={customersData} mutateCustomersData={mutate} />
      )}
    </div>
  );
};

export default CustomersPage;
