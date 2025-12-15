"use client";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export type FoodType =
  | 'all'
  | 'fine_dining'
  | 'casual'
  | 'fast_food'
  | 'cafe'
  | 'bar'
  | 'american'
  | 'asian'
  | 'chinese'
  | 'french'
  | 'greek'
  | 'indian'
  | 'indonesian'
  | 'italian'
  | 'japanese'
  | 'korean'
  | 'lebanese'
  | 'mediterranean'
  | 'mexican'
  | 'middle_eastern'
  | 'spanish'
  | 'thai'
  | 'turkish'
  | 'pizza'
  | 'seafood'
  | 'steak_house'
  | 'sushi'
  | 'ramen'
  | 'hamburger'
  | 'bakery'
  | 'ice_cream'
  | 'sandwich';

interface FoodOption {
  value: FoodType;
  label: string;
  category: string;
}

interface FoodPreferencesSelectorProps {
  value: FoodType[];
  onChange: (types: FoodType[]) => void;
}

const foodOptions: FoodOption[] = [
  { value: 'all', label: 'All', category: 'General' },
  { value: 'fine_dining', label: 'Fine Dining', category: 'Style' },
  { value: 'casual', label: 'Casual', category: 'Style' },
  { value: 'fast_food', label: 'Fast Food', category: 'Style' },
  { value: 'cafe', label: 'Cafe', category: 'Style' },
  { value: 'bar', label: 'Bar', category: 'Style' },
  { value: 'american', label: 'American', category: 'Cuisine' },
  { value: 'asian', label: 'Asian', category: 'Cuisine' },
  { value: 'chinese', label: 'Chinese', category: 'Cuisine' },
  { value: 'french', label: 'French', category: 'Cuisine' },
  { value: 'greek', label: 'Greek', category: 'Cuisine' },
  { value: 'indian', label: 'Indian', category: 'Cuisine' },
  { value: 'indonesian', label: 'Indonesian', category: 'Cuisine' },
  { value: 'italian', label: 'Italian', category: 'Cuisine' },
  { value: 'japanese', label: 'Japanese', category: 'Cuisine' },
  { value: 'korean', label: 'Korean', category: 'Cuisine' },
  { value: 'lebanese', label: 'Lebanese', category: 'Cuisine' },
  { value: 'mediterranean', label: 'Mediterranean', category: 'Cuisine' },
  { value: 'mexican', label: 'Mexican', category: 'Cuisine' },
  { value: 'middle_eastern', label: 'Middle Eastern', category: 'Cuisine' },
  { value: 'spanish', label: 'Spanish', category: 'Cuisine' },
  { value: 'thai', label: 'Thai', category: 'Cuisine' },
  { value: 'turkish', label: 'Turkish', category: 'Cuisine' },
  { value: 'pizza', label: 'Pizza', category: 'Specific' },
  { value: 'seafood', label: 'Seafood', category: 'Specific' },
  { value: 'steak_house', label: 'Steakhouse', category: 'Specific' },
  { value: 'sushi', label: 'Sushi', category: 'Specific' },
  { value: 'ramen', label: 'Ramen', category: 'Specific' },
  { value: 'hamburger', label: 'Burger', category: 'Specific' },
  { value: 'bakery', label: 'Bakery', category: 'Specific' },
  { value: 'ice_cream', label: 'Ice Cream', category: 'Specific' },
  { value: 'sandwich', label: 'Sandwich', category: 'Specific' },
];

function FoodPreferencesSelector({ value, onChange }: FoodPreferencesSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedValue: FoodType) => {
    let newValue: FoodType[];

    if (selectedValue === 'all') {
      // Si selecciona "Todos", limpia todas las demás selecciones
      newValue = ['all'];
    } else {
      // Si ya tiene "Todos" seleccionado, lo quita y agrega la nueva selección
      if (value.includes('all')) {
        newValue = [selectedValue];
      } else {
        // Toggle de la selección
        if (value.includes(selectedValue)) {
          newValue = value.filter((v) => v !== selectedValue);
          // Si no queda nada seleccionado, vuelve a "Todos"
          if (newValue.length === 0) {
            newValue = ['all'];
          }
        } else {
          newValue = [...value, selectedValue];
        }
      }
    }

    onChange(newValue);
  };

  const removeItem = (itemToRemove: FoodType) => {
    const newValue = value.filter((v) => v !== itemToRemove);
    // Si no queda nada seleccionado, vuelve a "Todos"
    if (newValue.length === 0) {
      onChange(['all']);
    } else {
      onChange(newValue);
    }
  };

  const getDisplayText = () => {
    if (value.includes('all')) {
      return 'All';
    }
    if (value.length === 0) {
      return 'Select preferences';
    }
    return `${value.length} selected`;
  };

  const categories = Array.from(new Set(foodOptions.map(option => option.category)));

  return (
    <div>
      <h3 className="text-lg font-medium text-muted-900 mb-4">
        Food preferences
      </h3>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-[44px] py-2"
          >
            <span className="truncate">{getDisplayText()}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search food type..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {categories.map((category) => (
                <CommandGroup key={category} heading={category}>
                  {foodOptions
                    .filter((option) => option.category === category)
                    .map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        onSelect={() => handleSelect(option.value)}
                        className="cursor-pointer hover:bg-secondary-200 transition-all"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value.includes(option.value) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Badges de selección */}
      {value.length > 0 && !value.includes('all') && (
        <div className="flex flex-wrap gap-2 mt-3">
          {value.map((type) => {
            const option = foodOptions.find((opt) => opt.value === type);
            return (
              <Badge
                key={type}
                variant="secondary"
                className="pl-3 pr-1 py-1 gap-1"
              >
                {option?.label}
                <button
                  type="button"
                  onClick={() => removeItem(type)}
                  className="ml-1 rounded-full hover:bg-secondary-300 p-0.5"
                >
                  <span className="sr-only">Remove {option?.label}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3 h-3"
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FoodPreferencesSelector;