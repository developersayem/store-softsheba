import { useCallback, useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Order } from "./data";
import { IOrderItem } from "@/types/order.type";
import { IProduct } from "@/types/product.type";

export const STATUS_CONFIG: Record<string, string[]> = {
  Pending: [],
  "On Hold": [
    "Pre Order",
    "Out of Stock",
    "Awaiting Payment Confirmation",
    "Phone Number Unreachable",
    "Call Not Answered",
    "Awaiting Customer Decision",
    "Follow-up Call Scheduled",
    "Invalid Phone Number",
    "Additional Product Required",
    "Delivery Address Updated",
    "Delivery Date Updated",
    "Others",
  ],
  Approved: [],
  Processing: [],
  "Ready To Ship": [],
  "In-Transit": ["pathao", "steadfast", "carrybee"],
  Delivered: ["Payment Collected", "Payment Due"],
  Flagged: ["Pending Returned", "Damaged", "Returned"],
  Cancelled: [
    "Customer Unreachable",
    "Customer Payment Issues",
    "Customer Mistakenly Placed Order",
    "Customer Not Interested in Paying in Advance",
    "Customer Wants to Cancle",
    "Customer Will Not Be Available at delivery Time",
    "Customer Will Order Later",
    "Customer Not Interested",
    "Delay delivery",
    "Urgent Delivery Required",
    "Out of Area Coverage",
    "Product Stock-Out",
    "Product Price Issues",
    "Duplicate Order",
    "Test Order",
    "Fake Order",
    "other",
  ],
  Incomplete: [],
};

interface ICarrybeeCity {
  id: number;
  name: string;
}
interface ICarrybeeZone {
  id: number;
  name: string;
}
interface ICarrybeeArea {
  id: number;
  name: string;
}

interface ChangeStatusDialogProps {
  open: boolean;
  onClose: () => void;
  selectedOrders?: Order[];
  onConfirm: (data: {
    status: string;
    subStatus?: string;
    followUpDate?: string;
    courierDetails?: {
      city_id: string;
      zone_id: string;
      area_id?: string;
      weight: number;
      delivery_type: number;
      product_type: number;
      isBulk?: boolean;
    };
  }) => void;
}

export function ChangeStatusDialog({
  open,
  onClose,
  selectedOrders = [],
  onConfirm,
}: ChangeStatusDialogProps) {
  const [status, setStatus] = useState<string>("");
  const [subStatus, setSubStatus] = useState<string>("");
  const [followUpDate, setFollowUpDate] = useState<string>("");

  // Carrybee Specific State
  const [cities, setCities] = useState<ICarrybeeCity[]>([]);
  const [zones, setZones] = useState<ICarrybeeZone[]>([]);
  const [areas, setAreas] = useState<ICarrybeeArea[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [wasAreaAutoDetected, setWasAreaAutoDetected] = useState(false);

  const hasSubStatus = status && STATUS_CONFIG[status]?.length > 0;
  const isOnHold = status === "On Hold";
  const isCarrybee = status === "In-Transit" && subStatus === "carrybee";

  const fetchCities = useCallback(async () => {
    setLoadingLocations(true);
    try {
      const res = await api.get("/courier-api/carrybee/cities");
      setCities(res.data.data);
    } catch (error) {
      console.error("Failed to fetch Carrybee cities", error);
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  const fetchZones = useCallback(async (cityId: string) => {
    setLoadingLocations(true);
    setAreas([]); // Clear areas when city/zone changes
    try {
      const res = await api.get(`/courier-api/carrybee/zones/${cityId}`);
      setZones(res.data.data);
    } catch (error) {
      console.error("Failed to fetch Carrybee zones", error);
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  const fetchAreas = useCallback(async (cityId: string, zoneId: string) => {
    setLoadingLocations(true);
    try {
      const res = await api.get(
        `/courier-api/carrybee/areas/${cityId}/${zoneId}`,
      );
      // Filter out empty or invalid areas
      const data = res.data.data;
      const validAreas = Array.isArray(data)
        ? data.filter((a: ICarrybeeArea) => a && a.id && a.name && a.name.trim() !== "")
        : [];
      setAreas(validAreas);
    } catch (error) {
      console.error("Failed to fetch Carrybee areas", error);
      setAreas([]);
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  // 3. Fetch cities when Carrybee is selected
  useEffect(() => {
    if (isCarrybee && cities.length === 0 && !loadingLocations) {
      fetchCities();
    }
  }, [isCarrybee, cities.length, fetchCities, loadingLocations]);

  // 4. Fetch zones when city changes
  useEffect(() => {
    if (isCarrybee && selectedCity && !loadingLocations) {
      fetchZones(selectedCity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCarrybee, selectedCity, fetchZones]);

  // 5. Fetch areas when zone changes
  useEffect(() => {
    if (isCarrybee && selectedCity && selectedZone && !loadingLocations) {
      fetchAreas(selectedCity, selectedZone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCarrybee, selectedCity, selectedZone, fetchAreas]);

  // 1. Initial Data Pre-fill (Runs once when dialog opens)
  useEffect(() => {
    if (open && selectedOrders.length === 1) {
      const order = selectedOrders[0];

      // Auto-fill status if empty
      if (!status) setStatus(order.status || "");
      if (!subStatus) {
        const initialSubStatus = order.sub_status || order.courier?.name || "";
        setSubStatus(initialSubStatus);
      }

      // Initial Carrybee Setup
      if (order.courier?.name === "carrybee" && order.courier.city_id) {
        const cId = order.courier.city_id.toString();
        const zId = order.courier.zone_id?.toString();
        const aId = order.courier.area_id?.toString();

        setSelectedCity(cId);
        fetchCities(); // Ensure cities are loaded
        fetchZones(cId); // Pre-fetch zones

        if (zId) {
          setSelectedZone(zId);
          fetchAreas(cId, zId); // Pre-fetch areas
          if (aId) {
            setSelectedArea(aId);
            setWasAreaAutoDetected(true);
          }
        }
      } else if (!selectedCity) {
        // Auto-detect if nothing set
        const address = order.shipping_address?.address || "";
        if (address) {
          api
            .post("/courier-api/carrybee/address-details", { query: address })
            .then((res) => {
              if (res.data?.data) {
                const { city_id, zone_id, area_id } = res.data.data;
                if (city_id) {
                  setSelectedCity(city_id.toString());
                  fetchCities();
                  fetchZones(city_id.toString());
                }
                if (zone_id) {
                  setSelectedZone(zone_id.toString());
                  if (city_id)
                    fetchAreas(city_id.toString(), zone_id.toString());
                }
                if (area_id) {
                  setSelectedArea(area_id.toString());
                  setWasAreaAutoDetected(true);
                } else {
                  setWasAreaAutoDetected(false);
                }
              }
            })
            .catch((e) => {
              console.error("Detection failed", e);
              setWasAreaAutoDetected(false);
            });
        }
      }

      // Weight Setup
      let calculatedWeight = 0;

      if (order.courier?.weight) {
        calculatedWeight = Number(order.courier.weight);
      } else {
        order.items?.forEach((item: IOrderItem) => {
          const product = typeof item.productId === 'object' ? item.productId as IProduct : null;
          
          const attributes = [
            ...(item.selectedAttributes || []),
            ...(item.productAttributes || []),
            ...(product?.productAttributes || [])
          ] as Array<{ name?: string, slug?: string, value: string, attributeId?: string | { $oid?: string, _id?: string }, unit?: string }>;
          
          const weightAttr = attributes?.find((attr) => {
            const attrId = typeof attr.attributeId === 'object' && attr.attributeId !== null ? (attr.attributeId as { $oid?: string }).$oid || (attr.attributeId as { _id?: string })._id : attr.attributeId;
            
            return (attr.name || "").toLowerCase().includes("weight") || 
                   (attr.slug || "").toLowerCase().includes("weight") ||
                   attrId === "69f58e988467e86df8178893";
          });

          if (weightAttr) {
            const val = parseFloat(weightAttr.value);
            const unit = (weightAttr.unit || "").toLowerCase();
            const name = (weightAttr.name || "").toLowerCase();
            const slug = (weightAttr.slug || "").toLowerCase();

            const isKg = weightAttr.value.toString().toLowerCase().includes("kg") || 
                         unit.includes("kg") ||
                         name.includes("kg") ||
                         slug.includes("kg");
            
            calculatedWeight += (isKg ? val * 1000 : val) * (item.quantity || 1);
          } else if (item.weight) {
            calculatedWeight += Number(item.weight) * (item.quantity || 1);
          }
        });
      }

      if (calculatedWeight > 0) {
        setWeight(Math.round(calculatedWeight).toString());
      } else {
        setWeight("500"); // Final fallback
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 2. Reset state on close
  useEffect(() => {
    if (!open) {
      setStatus("");
      setSubStatus("");
      setFollowUpDate("");
      setSelectedCity("");
      setSelectedZone("");
      setSelectedArea("");
      setWeight("");
      setCities([]);
      setZones([]);
      setAreas([]);
    }
  }, [open]);

  const handleStatusChange = (val: string) => {
    setStatus(val);
    // If the order already has a valid courier/sub-status for the new status, pre-fill it
    const order = selectedOrders[0];
    const existingSub = order?.sub_status || order?.courier?.name || "";
    if (val && STATUS_CONFIG[val]?.includes(existingSub)) {
      setSubStatus(existingSub);
    } else {
      setSubStatus("");
    }
  };

  const handleSubStatusChange = (val: string) => {
    setSubStatus(val);
    if (val === "carrybee") {
      fetchCities();
    }
  };

  const handleConfirm = () => {
    onConfirm({
      status,
      subStatus: hasSubStatus ? subStatus : undefined,
      followUpDate: isOnHold ? followUpDate : undefined,
      courierDetails: isCarrybee
        ? {
            city_id: selectedCity,
            zone_id: selectedZone,
            area_id: selectedArea,
            weight: parseInt(weight) || 500,
            delivery_type: 1, // Default Normal
            product_type: 1, // Default Parcel
            isBulk: selectedOrders.length > 1, // Signal for bulk processing
          }
        : undefined,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Change Status</DialogTitle>
        </DialogHeader>

        {/* Main Status */}
        <Select onValueChange={handleStatusChange} value={status}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(STATUS_CONFIG).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sub Status */}
        {hasSubStatus && (
          <Select onValueChange={handleSubStatusChange} value={subStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Sub Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_CONFIG[status].map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Carrybee Locations (Only show for single order selection) */}
        {isCarrybee && selectedOrders.length === 1 && (
          <div className="space-y-4">
            <Select
              onValueChange={(val) => {
                setSelectedCity(val);
                setSelectedZone("");
                setSelectedArea("");
                fetchZones(val);
              }}
              value={selectedCity}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    loadingLocations ? "Loading Cities..." : "Select City"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id.toString()}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCity && (
              <Select
                onValueChange={(val) => {
                  setSelectedZone(val);
                  setSelectedArea("");
                  fetchAreas(selectedCity, val);
                }}
                value={selectedZone}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      loadingLocations ? "Loading Zones..." : "Select Zone"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id.toString()}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {selectedZone &&
              wasAreaAutoDetected &&
              areas.filter((a) => a.name && a.name.trim() !== "").length > 0 && (
              <Select onValueChange={setSelectedArea} value={selectedArea}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      loadingLocations ? "Loading Areas..." : "Select Area"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id.toString()}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Weight (grams)</label>
              <Input
                type="number"
                placeholder="Weight in grams"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Follow-up Date (Only On Hold) */}
        {isOnHold && (
          <Input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              !status ||
              (hasSubStatus && !subStatus) ||
              (isCarrybee && selectedOrders.length === 1 && (!selectedCity || !selectedZone))
                ? true
                : false
            }
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
