"use client";
import { 
  GiPalmTree, 
  GiDiamondRing, 
  GiGreekTemple, 
  GiMountainClimbing,
  GiKnifeFork,
  GiLotusFlower
} from 'react-icons/gi';

export type TripType = 'relaxation' | 'luxury' | 'cultural' | 'adventure' | 'gastronomic' | 'spiritual';

interface TripOption {
  value: TripType;
  label: string;
  icon: React.ReactNode;
}

interface TripTypeSelectorProps {
  value: TripType;
  onChange: (type: TripType) => void;
}

const tripOptions: TripOption[] = [
  {
    value: 'relaxation',
    label: 'Relaxation',
    icon: <GiPalmTree size={24} />
  },
  {
    value: 'luxury',
    label: 'Luxury',
    icon: <GiDiamondRing size={24} />
  },
  {
    value: 'cultural',
    label: 'Cultural',
    icon: <GiGreekTemple size={24} />
  },
  {
    value: 'adventure',
    label: 'Adventure',
    icon: <GiMountainClimbing size={24} />
  },
  {
    value: 'gastronomic',
    label: 'Gastronomic',
    icon: <GiKnifeFork size={24} />
  },
  {
    value: 'spiritual',
    label: 'Spiritual',
    icon: <GiLotusFlower size={24} />
  }
];

function TripTypeSelector({ value, onChange }: TripTypeSelectorProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-muted-900 mb-4">
        What type of trip do you want?
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {tripOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
              value === option.value
                ? 'bg-secondary-200 border-muted-500'
                : 'bg-white border-muted-300 hover:border-muted-400'
            }`}
          >
            <span className={value === option.value ? 'text-secondary-700' : 'text-muted-600'}>
              {option.icon}
            </span>
            <span className={`text-base font-medium ${
              value === option.value ? 'text-secondary-900' : 'text-muted-700'
            }`}>
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default TripTypeSelector;