"use client";

import { RiHotelBedFill } from "react-icons/ri";
import { MdRestaurant } from "react-icons/md";
import { FaMonument } from "react-icons/fa";

export type ItemType = "hotel" | "tourism" | "restaurant" | "flight";

interface ItemOption {
  value: ItemType;
  label: string;
  icon: React.ReactNode;
}

interface ItemTypeSelectorProps {
  value: ItemType | null;
  onChange: (type: ItemType) => void;
}

const itemOptions: ItemOption[] = [
  {
    value: "hotel",
    label: "Hotel",
    icon: <RiHotelBedFill size={24} />,
  },
  {
    value: "tourism",
    label: "Tourist Site",
    icon: <FaMonument size={24} />,
  },
  {
    value: "restaurant",
    label: "Restaurant",
    icon: <MdRestaurant size={24} />,
  },
];

function ItemTypeSelector({ value, onChange }: ItemTypeSelectorProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-muted-900 mb-4">
        What type of item would you like to add?
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {itemOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
              value === option.value
                ? "bg-secondary-200 border-muted-500"
                : "bg-white border-muted-300 hover:border-muted-400"
            }`}
          >
            <span
              className={
                value === option.value
                  ? "text-secondary-700"
                  : "text-muted-600"
              }
            >
              {option.icon}
            </span>
            <span
              className={`text-base font-medium ${
                value === option.value
                  ? "text-secondary-900"
                  : "text-muted-700"
              }`}
            >
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ItemTypeSelector;
