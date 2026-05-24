import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaCartPlus, FaStar } from "react-icons/fa";

type DetailsLink = {
  title: string;
  link: string;
};

interface ProductDetails {
  image: string;
  name: string;
  shortDesc?: string;
  price: string;
  licenseType?: string;
  category: string;
  link: string;
  tagName1?: string;
  tagName2?: string;
  tagLink1?: string;
  tagLink2?: string;
  licenseOption?: string[];
  description?: string[];
  detailsLinks?: DetailsLink[];
  cutPrice?: string;
  reviews: number;
  feat?: string;
  productDetail?: string[];
  howToUse?: string[];
  asterBenefit?: string[];
  sale: boolean
}

interface PrimaryDetailsProps {
  product: ProductDetails;
}

export default function LinkedinPrimaryDetails({
  product,
}: PrimaryDetailsProps) {
  const {
    image,
    name,
    price,
    licenseType,
    category,
    link,
    tagName1,
    tagName2,
    tagLink1,
    tagLink2,
    licenseOption,
    description,
    detailsLinks,
    cutPrice,
    shortDesc,
    reviews,
    feat,
    productDetail,
    howToUse,
    asterBenefit,
    sale
  } = product;
  return (
    <div className="px-10 py-20 mx-auto md:px-14 lg:px-10 xl:px-0 lg:max-w-6xl lg:py-22">
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-2">
        <div className="w-full sm:w-[500px] md:w-[600px] lg:w-full mx-auto relative">
          <Image
            src={image}
            alt={name}
            width={735}
            height={1000}
            priority
            fetchPriority="high"
            loading="eager"
            className="mx-auto"
            sizes="(max-width: 640px) 70vw, (max-width: 1023px) 60vw, 800px "
          />
          {
            sale && (
              <div className="absolute top-5 left-3 px-4.5 py-2 text-[12px] text-white bg-[#1ea31b] rounded-sm">Sale</div>
            )
          }
        </div>
        <div className="w-full">
          <h1 className="text-[#1ea31b] text-3xl font-bold">{name}</h1>
          {shortDesc && (
            <p className="py-8 text-[#666] font-mono text-sm">{shortDesc}</p>
          )}
          {detailsLinks && (
            <ul className="py-8 pl-3 list-disc text-[#666] textsm">
              {detailsLinks.map((d, i) => (
                <li key={i} className="py-[2px]">
                  <Link href={d.link} className="text-[#2ae048]">
                    {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {
            asterBenefit && (
              <div className="text-[#666] text-sm mt-6 mb-12">
                
              <h1 className="text-[26px] text-[#333]">
                Benefits of ASTER:
              </h1>
              <p className="mt-2">
                1 PC Multiple User!
              </p>
              <ul className="pl-4 mt-2 space-y-2 list-disc">
                {
                  asterBenefit.map((a,i) => (
                    <li key={i}>
                      {a}
                    </li>
                  ))
                }
              </ul>
              </div>
            )
          }
          {description ? (
            <ul className="py-8 list-disc text-[#666] font-medium text-sm space-y-2">
              {feat && <h3>{feat}</h3>}
              {description.map((d, i) => {
                if (d.includes(":")) {
                  const [boldPart, ...rest] = d.split(":");
                  const restText = rest.join(":");
                  return (
                    <li key={i} className="pl-3">
                      <strong>{boldPart}:</strong>
                      <span> {restText}</span>
                    </li>
                  );
                }
                return (
                  <li key={i} className="pl-3">
                    {d}
                  </li>
                );
              })}
            </ul>
          ) : null}
          {
            howToUse && (
              <ul className="my-6 text-[#666] text-sm space-y-4">
                {     
                howToUse.map((h,i) => (
                  <li key={i}>
                    {h}
                  </li>
                ))
                }
              </ul>
            )
          }
          

          {licenseOption && null}
          {licenseType && (
            <p className="text-[#666666] text-sm py-8">
              License Type: {licenseType}
            </p>
          )}
          {reviews ? (
            <div className="flex items-center my-6 text-sm">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>
                  <FaStar size={18} className="text-[#e09900]" />
                </span>
              ))}
              <span className="text-blue-800 ml-[3px]">
                ({`${reviews} customer review`} )
              </span>
            </div>
          ) : null}
          <h2 className="text-[#1ea31b] text-[26px] font-bold pb-5 border-b border-blue-800 flex gap-2">
            {cutPrice && (
              <span className="text-[#999999] line-through"> {cutPrice}</span>
            )}{" "}
            {price}
          </h2>
          {
            productDetail && (
              <div className="flex justify-between mt-12">
              <p className="text-[#15bf86] font-bold">Product</p>
              <div className="bg-auto">
                <select
                  name="licenseOptions"
                  id=""
                  className="bg-[#15bf86] text-white text-[12px] w-full block outline-none p-1 rounded "
                >
                  <option value="">Choose an option</option>
                  {productDetail.map((l, i) => (
                    <option key={i} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            )
          }
          {licenseOption && (
  <div
    className={`flex items-center justify-between gap-4 ${
      productDetail ? "mt-5" : "mt-12"
    }`}
  >
    <p className="text-[#15bf86] font-bold min-w-[120px] ">License Type</p>

    <div>
      <select
        name="licenseOptions"
        className="p-1 rounded bg-[#15bf86] text-white text-[12px] outline-none focus:ring-2 focus:ring-[#15bf86] "
      >
        <option value="">Choose an option</option>
        {licenseOption.map((l, i) => (
          <option key={i} value={l}>
            {l}
          </option>
        ))}
      </select>
    </div>
  </div>
)}

          <button className="group relative flex items-center px-5 font-medium py-2 border border-[#15bf86] text-[#15bf86] hover:bg-[#15bf86] hover:text-white rounded-3xl mt-12 mb-8 transition-all duration-300 overflow-hidden">
            <span className="absolute transition-all duration-300 -translate-x-2 opacity-0 left-3 group-hover:opacity-100 group-hover:translate-x-0">
              <FaCartPlus size={16} />
            </span>

            <span className="pl-0 transition-all duration-300 group-hover:pl-3">
              ADD TO CART
            </span>
          </button>
          <p className="pt-2 border-t border-gray-300 text-[#666666] text-sm">
            Categories:{" "}
            <Link href={`/product-category/${link}`} className="text-[#2ea3f2]">
              {category}
            </Link>
          </p>
          <p className="text-[#666666] text-sm flex gap-1">
            Tags:{" "}
            <span>
              {" "}
              <Link
                href={`/product-tag/${tagLink1}`}
                className="text-[#2ea3f2]"
              >
                {tagName1}
              </Link>{" "}
              {tagName2 && (
                <>
                  ,{" "}
                  <Link
                    href={`/product-tag/${tagLink2}`}
                    className="text-[#2ea3f2]"
                  >
                    {tagName2}
                  </Link>
                </>
              )}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
