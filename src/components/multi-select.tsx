import React, { useState, useRef, useEffect } from 'react';

export interface Option {
  value: string;
  label: string;
  isDivider?: boolean;
}

export interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

const MultiSelectCheckbox: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select options',
  disabled = false,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (optionValue: string) => {
    if (optionValue === '') return; // Skip empty values and dividers

    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    
    onChange(newValue);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const getDisplayText = () => {
    if (value.length === 0) return placeholder;
    if (value.length === 1) {
      const option = options.find((opt) => opt.value === value[0]);
      return option?.label || value[0];
    }
    return `${value.length} selected`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={`w-full min-w-[200px] !bg-white text-[14px] !border !border-gray-300 rounded px-3 !py-[0.4vw] text-left text-black focus:outline-none focus:border-gray-400 flex items-center justify-between ${
          disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
        }`}
      >
        <span className={value.length === 0 ? 'text-gray-500' : ''}>
          {getDisplayText()}
        </span>
        <svg
          className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-[400px] overflow-y-auto">
          {value.length > 0 && (
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
              <span className="text-xs text-gray-600 font-medium">
                {value.length} selected
              </span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-[#295F9A] hover:underline font-medium"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="py-1">
            {options.map((option, index) => {
              if (option.isDivider || option.value === '') {
                return (
                  <div key={index} className="border-t border-gray-200 my-1" />
                );
              }

              const isSelected = value.includes(option.value);

              return (
                <label
                  key={option.value}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(option.value)}
                    className="w-4 h-4 text-[#295F9A] border-gray-300 rounded focus:ring-[#295F9A] focus:ring-2 cursor-pointer"
                  />
                  <span className="ml-3 text-[14px] text-gray-700 select-none">
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default MultiSelectCheckbox