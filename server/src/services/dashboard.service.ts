//dasboard.service.ts
import { Order } from "../models/order.model";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isoWeek from "dayjs/plugin/isoWeek";
import { resolveImageUrls } from "../utils/image-resolver.plugin";

interface OverviewParams {
  statuses: string[];
  timeframe: string;
  frequency: string;
}

dayjs.extend(utc);
dayjs.extend(isoWeek);

const getDateRange = (timeframe: string) => {
  const now = dayjs().utc();
  // console.log(now)

  switch (timeframe) {
    case "today":
      return {
        start: now.startOf("day").toDate(),
        end: now.add(1, "day").startOf("day").toDate(), // ✅ next day start
      };

    case "yesterday":
      return {
        start: now.subtract(1, "day").startOf("day").toDate(),
        end: now.startOf("day").toDate(), // ✅ clean boundary
      };

    case "last7days":
      return {
        start: now.subtract(6, "day").startOf("day").toDate(),
        end: now.add(1, "day").startOf("day").toDate(),
      };

    case "last30days":
      return {
        start: now.subtract(29, "day").startOf("day").toDate(),
        end: now.add(1, "day").startOf("day").toDate(),
      };

    case "thisWeek":
      return {
        start: now.startOf("isoWeek").toDate(), // ✅ Monday start
        end: now.add(1, "day").startOf("day").toDate(),
      };

    case "thisMonth":
      return {
        start: now.startOf("month").toDate(),
        end: now.add(1, "day").startOf("day").toDate(),
      };

    case "thisYear":
      return {
        start: now.startOf("year").toDate(),
        end: now.add(1, "day").startOf("day").toDate(),
      };

    default:
      return null;
  }
};
//--- Helper for Chart Colors ---

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: "#3b82f6",
    shipped: "#10b981",
    "on hold": "#fbcfe8",
    approved: "#06b6d4",
    processing: "#2563eb",
    "ready to ship": "#14b8a6",
    "in-transit": "#8b5cf6",
    delivered: "#0f766e",
    cancelled: "#dc2626",
    returned: "#f59e0b",
    flagged: "#f43f5e",
  };
  return colors[status.toLowerCase()] || "#f59e0b"; //default color is amber
};

const getReasonColor = (index: number) => {
  const colors = [
    "#7f1d1d",
    "#991b1b",
    "#b91c1c",
    "#dc2626",
    "#ef4444",
    "#f87171",
    "#fca5a5",
    "#fecaca",
  ];
  return colors[index % colors.length];
};

export const getOverviewData = async ({
  statuses,
  timeframe,
  frequency,
}: OverviewParams) => {
  const dateRange = getDateRange(timeframe);

  // Normalize incoming statuses safely
  const normalizedStatuses = Array.isArray(statuses)
    ? statuses.map((s) => s.toLowerCase())
    : [];

  const matchStage: any = {};

  if (dateRange) {
    const { start, end } = dateRange;
    // Filter orders strictly by creation date — status transition dates
    // (approved, in_transit, etc.) should NOT pull older orders into the
    // current timeframe when their status is updated.
    matchStage.created_at = { $gte: start, $lte: end };
  }

  // ==========================
  // MAIN SUMMARY AGGREGATION
  // ==========================

  const summary = await Order.aggregate([
    {
      $addFields: {
        normalizedStatus: { $toLower: "$status" },
      },
    },
    {
      $match: {
        ...matchStage,
        ...(normalizedStatuses.length > 0 && {
          normalizedStatus: { $in: normalizedStatuses },
        }),
      },
    },
    {
      $group: {
        _id: "$normalizedStatus",
        count: { $sum: 1 },
        amount: { $sum: "$total" },
      },
    },
  ]);

  let totalCount = 0;
  let totalSales = 0;
  const statusMap: any = {};

  summary.forEach((item) => {
    statusMap[item._id] = {
      count: item.count,
      amount: item.amount,
    };
    totalCount += item.count;
    totalSales += item.amount;
  });

  // ==========================
  // TREND AGGREGATION
  // ==========================

  let groupFormat;

  switch (frequency) {
    case "weekly":
      groupFormat = { $week: "$created_at" };
      break;
    case "monthly":
      groupFormat = { $month: "$created_at" };
      break;
    case "yearly":
      groupFormat = { $year: "$created_at" };
      break;
    default:
      groupFormat = {
        $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
      };
  }

  const trends = await Order.aggregate([
    {
      $addFields: {
        normalizedStatus: { $toLower: "$status" },
      },
    },
    {
      $match: {
        ...matchStage,
        ...(normalizedStatuses.length > 0 && {
          normalizedStatus: { $in: normalizedStatuses },
        }),
      },
    },
    {
      $group: {
        _id: groupFormat,
        count: { $sum: 1 },
        amount: { $sum: "$total" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const locations = await Order.aggregate([
    {
      $addFields: {
        normalizedStatus: { $toLower: "$status" },
      },
    },
    {
      $match: {
        ...matchStage,
        ...(normalizedStatuses?.length && {
          normalizedStatus: { $in: normalizedStatuses },
        }),
      },
    },
    {
      $group: {
        _id: "$shipping_address.city",
        count: { $sum: 1 },
        value: { $sum: "$total" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
  const formattedLocations = locations.map((l) => ({
    location: l._id || "Unknown",
    count: l.count,
    value: l.value,
  }));
  const items = await Order.aggregate([
    {
      $addFields: {
        normalizedStatus: { $toLower: "$status" },
      },
    },
    {
      $match: {
        ...matchStage,
        ...(normalizedStatuses?.length && {
          normalizedStatus: { $in: normalizedStatuses },
        }),
      },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        name: { $first: "$items.name" },
        price: { $avg: "$items.price" },
        qty: { $sum: "$items.quantity" },
        amount: { $sum: "$items.total" },
        image: { $first: "$items.image" },
      },
    },
    { $sort: { qty: -1 } },
    { $limit: 10 },
  ]);
  const formattedItems = items.map((i) => ({
    id: i._id,
    name: i.name,
    price: i.price,
    qty: i.qty,
    amount: i.amount,
    image: i.image,
  }));
  const customers = await Order.aggregate([
    {
      $addFields: {
        normalizedStatus: { $toLower: "$status" },
      },
    },
    {
      $match: {
        ...matchStage,
        ...(normalizedStatuses?.length && {
          normalizedStatus: { $in: normalizedStatuses },
        }),
      },
    },
    {
      $group: {
        _id: "$customerId",
        frequency: { $sum: 1 },
        value: { $sum: "$total" },
        firstOrder: { $min: "$created_at" },
        phone: { $first: "$shipping_address.phone" },
        name: { $first: "$shipping_address.full_name" },
        address: { $first: "$shipping_address.address" },
        district: { $first: "$shipping_address.city" },
      },
    },
    { $sort: { frequency: -1 } },
    { $limit: 10 },
  ]);
  const formattedCustomers = customers.map((c) => ({
    id: c._id,
    phone: c.phone,
    name: c.name,
    address: c.address,
    district: c.district,
    frequency: c.frequency,
    value: c.value,
    since: dayjs(c.firstOrder).format("MMM D, YYYY"),
  }));
  // ==========================
  // WORKFLOW DATA CALCULATIONS
  // ==========================

  // 1. Workflow Status Percentages
  const workflowStatusData = Object.entries(statusMap).map(
    ([status, data]: [string, any]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value:
        totalCount > 0
          ? Number(((data.count / totalCount) * 100).toFixed(2))
          : 0,
      color: getStatusColor(status),
    }),
  );

  const cycleTimeAgg = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        avgPendingMs: {
          $avg: {
            $let: {
              vars: {
                approvedDate: {
                  $convert: {
                    input: "$dates.approved",
                    to: "date",
                    onError: null,
                    onNull: null,
                  },
                },
                createdDate: {
                  $convert: {
                    input: "$dates.created",
                    to: "date",
                    onError: null,
                    onNull: null,
                  },
                },
              },
              in: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$$approvedDate", null] },
                      { $ne: ["$$createdDate", null] },
                    ],
                  },
                  { $subtract: ["$$approvedDate", "$$createdDate"] },
                  null,
                ],
              },
            },
          },
        },
        avgApprovedMs: {
          $avg: {
            $let: {
              vars: {
                processingDate: {
                  $convert: {
                    input: "$dates.processing",
                    to: "date",
                    onError: null,
                    onNull: null,
                  },
                },
                approvedDate: {
                  $convert: {
                    input: "$dates.approved",
                    to: "date",
                    onError: null,
                    onNull: null,
                  },
                },
              },
              in: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$$processingDate", null] },
                      { $ne: ["$$approvedDate", null] },
                    ],
                  },
                  { $subtract: ["$$processingDate", "$$approvedDate"] },
                  null,
                ],
              },
            },
          },
        },
        avgProcessingMs: {
          $avg: {
            $let: {
              vars: {
                readyDate: {
                  $convert: {
                    input: "$dates.ready_to_ship",
                    to: "date",
                    onError: null,
                    onNull: null,
                  },
                },
                processingDate: {
                  $convert: {
                    input: "$dates.processing",
                    to: "date",
                    onError: null,
                    onNull: null,
                  },
                },
              },
              in: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$$readyDate", null] },
                      { $ne: ["$$processingDate", null] },
                    ],
                  },
                  { $subtract: ["$$readyDate", "$$processingDate"] },
                  null,
                ],
              },
            },
          },
        },
        avgReadyToShipMs: {
          $avg: {
            $let: {
              vars: {
                transitDate: {
                  $convert: {
                    input: "$dates.in_transit",
                    to: "date",
                    onError: null,
                    onNull: null,
                  },
                },
                readyDate: {
                  $convert: {
                    input: "$dates.ready_to_ship",
                    to: "date",
                    onError: null,
                    onNull: null,
                  },
                },
              },
              in: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$$transitDate", null] },
                      { $ne: ["$$readyDate", null] },
                    ],
                  },
                  { $subtract: ["$$transitDate", "$$readyDate"] },
                  null,
                ],
              },
            },
          },
        },
        avgInTransitMs: {
          $avg: {
            $let: {
              vars: {
                deliveredDate: {
                  $convert: {
                    input: "$dates.Delivered",
                    to: "date",
                    onError: null,
                    onNull: null,
                  },
                },
                transitDate: {
                  $convert: {
                    input: "$dates.in_transit",
                    to: "date",
                    onError: null,
                    onNull: null,
                  },
                },
              },
              in: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$$deliveredDate", null] },
                      { $ne: ["$$transitDate", null] },
                    ],
                  },
                  { $subtract: ["$$deliveredDate", "$$transitDate"] },
                  null,
                ],
              },
            },
          },
        },
      },
    },
  ]);

  // Helper to convert milliseconds to hours safely
  const msToHours = (ms?: number) =>
    ms ? Number((ms / (1000 * 60 * 60)).toFixed(2)) : 0;

  // Extract the single group result, fallback to empty object if no orders match
  const cycleData = cycleTimeAgg[0] || {};

  // Format into the array structure the Recharts frontend expects
  const cycleTimeData = [
    {
      status: "Pending",
      timeHours: msToHours(cycleData.avgPendingMs),
      fill: getStatusColor("pending"),
    },
    {
      status: "Approved",
      timeHours: msToHours(cycleData.avgApprovedMs),
      fill: getStatusColor("approved"),
    },
    {
      status: "Processing",
      timeHours: msToHours(cycleData.avgProcessingMs),
      fill: getStatusColor("processing"),
    },
    {
      status: "Ready to Ship",
      timeHours: msToHours(cycleData.avgReadyToShipMs),
      fill: getStatusColor("ready to ship"),
    },
    {
      status: "In-Transit",
      timeHours: msToHours(cycleData.avgInTransitMs),
      fill: getStatusColor("in-transit"),
    },
  ];
  // Cancelled Orders Grouped By sub_status
  const cancelledAgg = await Order.aggregate([
    { $addFields: { normalizedStatus: { $toLower: "$status" } } },
    { $match: { ...matchStage, normalizedStatus: "cancelled" } },
    {
      $group: {
        _id: "$sub_status",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);
  console.log(cancelledAgg);

  const totalCanclledCount = cancelledAgg.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  const cancelledOrdersData = cancelledAgg.map((item, index) => {
    const percentage =
      totalCanclledCount > 0
        ? ((item.count / totalCanclledCount) * 100).toFixed(2)
        : 0;
    return {
      name: item._id || "Other",
      value: Number(percentage),
      count: item.count,
      color: getReasonColor(index),
    };
  });

  const returnedAgg = await Order.aggregate([
    { $addFields: { normalizedStatus: { $toLower: "$status" } } },
    { $match: { ...matchStage, normalizedStatus: "flagged" } },
    {
      $group: {
        _id: "$sub_status",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const totalReturnedCount = returnedAgg.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  const returnedOrdersData = returnedAgg.map((item, index) => {
    const percentage =
      totalReturnedCount > 0
        ? ((item.count / totalReturnedCount) * 100).toFixed(2)
        : 0;
    return {
      name: item._id || "Other",
      value: Number(percentage),
      count: item.count,
      color: getReasonColor(index),
    };
  });
  // --- PIPELINE 1: Delivery Partners ---
  const deliveryPartnersAgg = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$courier.name", // e.g., "Steadfast"
        count: { $sum: 1 },
        value: { $sum: "$total" },
      },
    },
    { $sort: { count: -1 } },
  ]);

  // --- PIPELINE 2: Payments ---
  const paymentsAgg = await Order.aggregate([
    { $addFields: { normalizedStatus: { $toLower: "$status" } } },
    { $match: { ...matchStage, normalizedStatus: "delivered" } },
    {
      $group: {
        _id: "$sub_status", // e.g., "due", "collected"
        count: { $sum: 1 },
        value: { $sum: "$total" },
      },
    },
  ]);

  // --- PIPELINE 3: Discounts & Advanced Payments ---
  const discountsAgg = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,

        // orders with discount
        discountCount: {
          $sum: {
            $cond: [
              {
                $gt: [{ $add: ["$discount", "$coupon_discount"] }, 0],
              },
              1,
              0,
            ],
          },
        },

        // total discount value
        discountValue: {
          $sum: {
            $add: ["$discount", "$coupon_discount"],
          },
        },

        // orders with advance/paid payment
        advancedCount: {
          $sum: {
            $cond: [{ $gt: ["$payment.paid", 0] }, 1, 0],
          },
        },

        // total advance/paid amount
        advancedValue: {
          $sum: "$payment.paid",
        },
      },
    },
  ]);

  return {
    orders: {
      totalCount,
      totalSales,
      ...statusMap,
    },
    workflow: {
      workflowStatusData,
      cycleTimeData,
      cancelledOrdersData,
      returnedOrdersData,
    },
    trends: trends.map((t) => ({
      day: t._id,
      count: t.count,
      amount: t.amount,
    })),
    locations: formattedLocations,
    items: resolveImageUrls(formattedItems, ["image"]),
    customers: formattedCustomers,
    deliveryPartners: deliveryPartnersAgg.map((dp) => ({
      name: dp._id || "Other",
      count: dp.count,
      value: dp.value,
      percentage:
        totalCount > 0 ? Number(((dp.count / totalCount) * 100).toFixed(2)) : 0,
    })),
    payments: paymentsAgg.map((p) => ({
      method: p._id || "Other",
      count: p.count,
      value: p.value,
    })),
    discounts: {
      discountCount: discountsAgg[0]?.discountCount || 0,
      discountValue: discountsAgg[0]?.discountValue || 0,
      advancedCount: discountsAgg[0]?.advancedCount || 0,
      advancedValue: discountsAgg[0]?.advancedValue || 0,
    },
  };
};

export const profitAndLossOverview = async (
  timeframe: string,
  statuses?: string[],
) => {

  const dateRange = getDateRange(timeframe);

  const normalizedStatuses = Array.isArray(statuses)
    ? statuses.map((s) => s.toLowerCase())
    : [];

  const matchStage: any = {
    status: { $in: ["flagged", "Flagged"] },
  };


  // 1. Find the orders with given timeframe from order.dates.flagged
  if (dateRange) {
    matchStage["dates.flagged"] = {
      $gte: dateRange.start,
      $lte: dateRange.end,
    };
  }

  const lossAggregation = await Order.aggregate([
    // Step 1 & 2: Match flagged orders within the dates.flagged timeframe
    { $match: matchStage },

    // Step 3 (prep): Check shipping charge. If 0 or missing, default to 120.
    {
      $addFields: {
        adjusted_shipping_charge: {
          $cond: {
            if: { $eq: [{ $ifNull: ["$shipping_charge", 0] }, 0] },
            then: 120,
            else: "$shipping_charge",
          },
        },
      },
    },

    // Step 3.i: Look at bought items
    { $unwind: "$items" },

    // Search product by productId
    {
      $lookup: {
        from: "products", // Ensure this matches your exact DB collection name
        localField: "items.productId",
        foreignField: "_id",
        as: "productData",
      },
    },
    { $unwind: { path: "$productData", preserveNullAndEmptyArrays: true } },

    // Search variant by variantId
    {
      $lookup: {
        from: "variants", // Ensure this matches your exact DB collection name
        localField: "items.variantId",
        foreignField: "_id",
        as: "variantData",
      },
    },
    { $unwind: { path: "$variantData", preserveNullAndEmptyArrays: true } },

    // Collect the purchase price (prioritize Variant, fallback to Product, default 0)
    {
      $addFields: {
        unitCost: {
          $ifNull: [
            "$variantData.purchase_price",
            "$productData.purchase_price",
            0,
          ],
        },
      },
    },

    // Calculate total cost for that specific item line (price * quantity)
    {
      $addFields: {
        itemTotalCost: {
          $multiply: ["$unitCost", { $ifNull: ["$items.quantity", 1] }],
        },
      },
    },

    // Group items back to the Order level to sum up the total cost of goods
    {
      $group: {
        _id: "$_id",
        sub_status: { $first: "$sub_status" },
        adjusted_shipping_charge: { $first: "$adjusted_shipping_charge" },
        totalGoodsCost: { $sum: "$itemTotalCost" }, // Sum of all items' purchase prices in this order
      },
    },

    // Step 3.ii: Look at order sub_status and calculate sequential loss
    {
      $group: {
        _id: null, // Grouping to null means we sum EVERYTHING up into one final grand total
        totalLoss: {
          $sum: {
            $switch: {
              branches: [
                // Condition A: Pending Return / Returned
                {
                  case: {
                    $in: [
                      {
                        $trim: {
                          input: { $toLower: { $ifNull: ["$sub_status", ""] } },
                        },
                      },
                      ["pending return", "returned"],
                    ],
                  },
                  // Loss = only shipping charge
                  then: "$adjusted_shipping_charge",
                },
                // Condition B: Damaged
                {
                  case: {
                    $eq: [
                      {
                        $trim: {
                          input: { $toLower: { $ifNull: ["$sub_status", ""] } },
                        },
                      },
                      "damaged",
                    ],
                  },
                  // Loss = shipping charge + product/variant purchase price
                  then: {
                    $add: ["$adjusted_shipping_charge", "$totalGoodsCost"],
                  },
                },
              ],
              // Default Fallback: If status is flagged but sub_status is empty or unrecognized, we'll assume standard shipping loss.
              default: "$adjusted_shipping_charge",
            },
          },
        },
      },
    },
  ]);

  // 2. Calculate Profit
  const profitMatchStage: any = {};
  if (dateRange) {
    const { start, end } = dateRange;
    profitMatchStage.$or = [
      { created_at: { $gte: start, $lte: end } },
      { "dates.approved": { $gte: start, $lte: end } },
      { "dates.processing": { $gte: start, $lte: end } },
      { "dates.ready_to_ship": { $gte: start, $lte: end } },
      { "dates.in_transit": { $gte: start, $lte: end } },
      { "dates.Delivered": { $gte: start, $lte: end } },
    ];
  }

  const profitAggregation = await Order.aggregate([
    {
      $addFields: {
        normalizedStatus: { $toLower: "$status" },
      },
    },
    {
      $match: {
        ...profitMatchStage,
        ...(normalizedStatuses.length > 0
          ? { normalizedStatus: { $in: normalizedStatuses } }
          : {
              normalizedStatus: {
                $nin: ["pending", "flagged", "cancelled", "incomplete"],
              },
            }),
      },
    },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $lookup: {
        from: "variants",
        localField: "items.variantId",
        foreignField: "_id",
        as: "variant",
      },
    },
    { $unwind: { path: "$variant", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: null,
        totalProfit: {
          $sum: {
            $multiply: [
              {
                $max: [
                  0,
                  {
                    $subtract: [
                      "$items.price",
                      {
                        $ifNull: [
                          "$variant.purchase_price",
                          "$product.purchase_price",
                          0,
                        ],
                      },
                    ],
                  },
                ],
              },
              { $ifNull: ["$items.quantity", 1] },
            ],
          },
        },
      },
    },
  ]);

  return {
    profit: profitAggregation[0]?.totalProfit || 0,
    loss: lossAggregation[0]?.totalLoss || 0,
  };
};


export const getProfitandLossDataByProductAndCategory = async () => {
  // --- Aggregation for profit by product ---
  const profitByProduct = await Order.aggregate([
    { $addFields: { normalizedStatus: { $toLower: "$status" } } },
    {
      $match: {
        normalizedStatus: {
          $nin: ["pending", "flagged", "cancelled", "incomplete"],
        },
      },
    },
    { $unwind: "$items" },

    // 1. Lookup the main Product
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    // 2. Lookup the Variant (if any)
    {
      $lookup: {
        from: "variants",
        localField: "items.variantId",
        foreignField: "_id",
        as: "variant",
      },
    },
    // 3. Safely unwind variant (preserves items that don't have variants)
    {
      $unwind: {
        path: "$variant",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $group: {
        _id: "$items.productId",
        productName: { $first: "$items.name" },
        totalProfit: {
          $sum: {
            $multiply: [
              // 4. Use $max to ensure profit doesn't go below 0
              {
                $max: [
                  0,
                  {
                    $subtract: [
                      "$items.price",
                      {
                        $ifNull: [
                          "$variant.purchase_price",
                          "$product.purchase_price",
                        ],
                      },
                    ],
                  },
                ],
              },
              "$items.quantity",
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: "$productName",
        totalProfit: 1,
      },
    },
    { $sort: { totalProfit: -1 } },
    { $limit: 10 },
  ]);

  //console.log(profitByProduct);

  // --- Aggregation for profit by category ---
  const profitByCategory = await Order.aggregate([
    { $addFields: { normalizedStatus: { $toLower: "$status" } } },
    {
      $match: {
        normalizedStatus: {
          $nin: ["pending", "flagged", "cancelled", "incomplete"],
        },
      },
    },
    { $unwind: "$items" },

    // 1. Lookup Product
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    // 2. Lookup Variant
    {
      $lookup: {
        from: "variants",
        localField: "items.variantId",
        foreignField: "_id",
        as: "variant",
      },
    },
    // 3. Safely unwind variant
    {
      $unwind: {
        path: "$variant",
        preserveNullAndEmptyArrays: true,
      },
    },

    { $unwind: "$product.categories" },
    {
      $group: {
        _id: "$product.categories",
        totalProfit: {
          $sum: {
            $multiply: [
              // 4. Use $max to ensure profit doesn't go below 0
              {
                $max: [
                  0,
                  {
                    $subtract: [
                      "$items.price",
                      {
                        $ifNull: [
                          "$variant.purchase_price",
                          "$product.purchase_price",
                        ],
                      },
                    ],
                  },
                ],
              },
              "$items.quantity",
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $project: {
        _id: 0,
        name: "$category.name",
        totalProfit: 1,
      },
    },
    { $sort: { totalProfit: -1 } },
    { $limit: 10 },
  ]);

  //console.log(profitByCategory);

  return {
    profitByProduct,
    profitByCategory,
  };
};
