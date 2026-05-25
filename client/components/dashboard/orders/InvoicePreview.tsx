"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { IOrder } from "@/types/order.type";
import { Download } from "lucide-react";
import { StoreSettings } from "@/types/store.settings.type";

interface InvoicePreviewProps {
  order: IOrder;
  handleDownload?: () => void;
  storeSettingsData?: StoreSettings[];
  invoiceRef?: React.RefObject<HTMLDivElement | null>;
  loading?: boolean;
  showButton?: boolean;
}

export default function InvoicePreview({
  order,
  handleDownload,
  storeSettingsData,
  invoiceRef,
  loading,
}: InvoicePreviewProps) {
  const formatPrice = (price: number) => Number(price).toFixed(2);

  return (
    <div className="w-full">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page { 
            size: 3in 4in; 
            margin: 0; 
          }
          body { 
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact; 
          }
        }
      `,
        }}
      />
      <div className="flex flex-col items-center gap-6 p-4 w-full rounded-xl ">
        <div
          className="rounded-none overflow-hidden"
          style={{ width: "3in", height: "4in" }}
        >
          <div
            ref={invoiceRef}
            className="bg-white text-black p-2 text-[8px] leading-[1.1] font-sans w-full h-full"
            style={{ width: "3in", height: "4in", boxSizing: "border-box" }}
          >
            {/* HEADER */}
            <div className="flex justify-between items-start mb-1">
              <div>
                <h1 className="text-xs font-bold text-black mb-0.5 uppercase">
                  {storeSettingsData?.[0]?.site_name || "BelyFly"}
                </h1>
                <p className="text-[7.5px] text-gray-600 mb-0.5">
                  Help Line:{" "}
                  {storeSettingsData?.[0]?.footer?.contact?.phone ||
                    "01723242152"}
                </p>
                <div className="space-y-0">
                  <p className="font-bold text-gray-800">
                    Inv: {order.order_number}
                  </p>
                  <p className="text-gray-600">
                    Date:{" "}
                    {new Date(order?.created_at ?? "").toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </p>
                </div>
              </div>
              {/* QR CODE */}
              <div className="pt-0">
                {(() => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const QRCodeAny = QRCode as any;
                  return (
                    <QRCodeAny
                      value={order?.order_number}
                      size={35}
                      viewBox={`0 0 256 256`}
                      level="M"
                    />
                  );
                })()}
              </div>
            </div>

            {/* CUSTOMER INFO */}
            <div className="mb-1.5 py-1 border-t border-b border-gray-100">
              <p className="font-bold text-[8.5px] mb-0.5 text-black">
                Customer:
              </p>
              <div className="pl-0.5 space-y-0 text-gray-800">
                <p className="font-bold">{order?.shipping_address?.full_name}</p>
                <p className="font-bold">{order?.shipping_address?.phone}</p>
                <p className="leading-tight text-[7.5px]">
                  {order?.shipping_address?.address}
                </p>
              </div>
            </div>

            {/* TABLE */}
            <div className="mb-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black text-black">
                    <th className="py-0.5 pl-0.5 font-bold w-[65%] text-[8px]">
                      Product
                    </th>
                    <th className="py-0.5 text-center font-bold w-[10%] text-[8px]">
                      Qty
                    </th>
                    <th className="py-0.5 pr-0.5 text-right font-bold w-[25%] text-[8px]">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order?.items?.map((item, i: number) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="py-1 pl-0.5 align-top font-medium text-gray-800 text-[7.5px]">
                        {item.name}
                      </td>
                      <td className="py-1 text-center align-top font-bold text-gray-900 text-[7.5px]">
                        {item.quantity}
                      </td>
                      <td className="py-1 pr-0.5 text-right align-top font-medium text-gray-800 text-[7.5px]">
                        {formatPrice(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SUMMARY */}
            <div className="flex flex-col items-end gap-0.5 pt-0.5 border-t border-dashed border-gray-300">
              <div className="w-[120px] flex justify-between">
                <span className="font-bold text-gray-600">Sub Total</span>
                <span className="font-bold text-gray-800">
                  {formatPrice(order?.subtotal ?? 0)}
                </span>
              </div>
              <div className="w-[120px] flex justify-between">
                <span className="font-bold text-gray-600">Delivery Fee</span>
                <span className="font-bold text-gray-800">
                  {formatPrice(order?.shipping_charge ?? 0)}
                </span>
              </div>
              {(() => {
                const subtotal = order?.subtotal ?? 0;
                const shipping = order?.shipping_charge ?? 0;
                const grandTotal = order?.payment?.sales ?? order?.total ?? 0;
                const effectiveDiscount = subtotal + shipping - grandTotal;
                
                if (effectiveDiscount > 0) {
                  return (
                    <div className="w-[120px] flex justify-between">
                      <span className="font-bold text-gray-600 text-[8px]">Discount</span>
                      <span className="font-bold text-gray-800 text-[8px]">
                        -{formatPrice(effectiveDiscount)}
                      </span>
                    </div>
                  );
                }
                return null;
              })()}
              <div className="w-[120px] flex justify-between border-t border-gray-300 pt-0.5 mt-0.5">
                <span className="font-black text-black text-[9px]">
                  Grand Total
                </span>
                <span className="font-black text-black text-[9px]">
                  {formatPrice(order?.payment?.sales ?? order?.total ?? 0)}
                </span>
              </div>
              {((order?.payment?.paid ?? 0) > 0) && (
                <div className="w-[120px] flex justify-between">
                  <span className="font-bold text-gray-600 text-[8px]">Paid Amount</span>
                  <span className="font-bold text-gray-800 text-[8px]">
                    {formatPrice(order?.payment?.paid ?? 0)}
                  </span>
                </div>
              )}
              <div className="w-[120px] flex justify-between border-t border-gray-300 pt-0.5 mt-0.5">
                <span className="font-black text-black text-[9px]">
                  Due Amount
                </span>
                <span className="font-black text-black text-[9px]">
                  {formatPrice(order?.payment?.due ?? order?.total ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleDownload}
          disabled={loading}
          className="w-[302px] hidden"
        >
          {loading ? (
            "Generating..."
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" /> Download Receipt
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
