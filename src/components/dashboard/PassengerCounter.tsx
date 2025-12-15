"use client";
import { HiPlus, HiMinus } from 'react-icons/hi';

interface PassengerCounterProps {
  label: string;
  description: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  maxValue?: number;
}

function PassengerCounter({
  label,
  description,
  value,
  onIncrement,
  onDecrement,
  maxValue = 30
}: PassengerCounterProps) {
  const isMinDisabled = value === 0;
  const isMaxDisabled = value === maxValue;

  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-medium text-muted-900">{label}</h3>
        <p className="text-base text-muted-500">{description}</p>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onDecrement}
          disabled={isMinDisabled}
          className={`w-9 h-9 rounded-full border-2 border-muted-400 flex items-center justify-center transition-colors bg-white ${
            isMinDisabled
              ? 'opacity-40'
              : 'hover:bg-muted-100 hover:border-muted-500'
          }`}
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <HiMinus size={18} className="text-muted-500" />
        </button>
        <span className="text-xl font-medium text-muted-900 w-10 text-center">
          {value}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          disabled={isMaxDisabled}
          className={`w-9 h-9 rounded-full border-2 border-muted-400 flex items-center justify-center transition-colors bg-white ${
            isMaxDisabled
              ? 'opacity-40'
              : 'hover:bg-muted-100 hover:border-muted-500'
          }`}
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <HiPlus size={18} className="text-muted-500" />
        </button>
      </div>
    </div>
  );
}

export default PassengerCounter;