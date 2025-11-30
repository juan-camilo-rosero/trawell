"use client";
import React from "react";
import { FiStar, FiMapPin } from "react-icons/fi";

interface ItemCardProps {
  title: string;
  subtitle: string;
  price?: string;
  rating?: number;
  details: string[];
  onClick: () => void;
}

function ItemCard({
  title,
  subtitle,
  price,
  rating,
  details,
  onClick,
}: ItemCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-muted-300 rounded-lg p-4 hover:border-primary-500 hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-muted-900 text-base mb-1">
            {title}
          </h4>
          <p className="text-sm text-muted-600">{subtitle}</p>
        </div>
        {price && (
          <div className="text-right ml-4">
            <p className="font-bold text-primary-600">{price}</p>
          </div>
        )}
      </div>

      {rating && (
        <div className="flex items-center gap-1 mb-2">
          <FiStar className="text-yellow-500 fill-yellow-500" size={16} />
          <span className="text-sm font-medium text-muted-700">{rating}</span>
        </div>
      )}

      {details.length > 0 && (
        <div className="space-y-1 mt-2">
          {details.map((detail, index) => (
            <p key={index} className="text-xs text-muted-500">
              {detail}
            </p>
          ))}
        </div>
      )}
    </button>
  );
}

export default ItemCard;