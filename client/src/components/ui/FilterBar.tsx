import React, { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  /**
   * The current search query value
   */
  searchQuery: string;

  /**
   * Callback function when search query changes
   */
  onSearchChange: (value: string) => void;

  /**
   * Icon component for the search input
   */
  searchIcon: ReactNode;

  /**
   * Placeholder text for the search input
   */
  searchPlaceholder?: string;

  /**
   * Options for the first filter dropdown
   */
  filter1Options?: FilterOption[];

  /**
   * Selected value for the first filter
   */
  filter1Value: string;

  /**
   * Callback function when first filter changes
   */
  onFilter1Change: (value: string | null) => void;

  /**
   * Label for the first filter "All" option
   */
  filter1AllLabel?: string;

  /**
   * Icon component for the first filter
   */
  filter1Icon: ReactNode;

  /**
   * Options for the second filter dropdown
   */
  filter2Options?: FilterOption[];

  /**
   * Selected value for the second filter
   */
  filter2Value: string;

  /**
   * Callback function when second filter changes
   */
  onFilter2Change: (value: string | null) => void;

  /**
   * Label for the second filter "All" option
   */
  filter2AllLabel?: string;

  /**
   * Icon component for the second filter
   */
  filter2Icon: ReactNode;

  /**
   * Additional className for the container
   */
  className?: string;
}

/**
 * A reusable filter bar component with search and dropdown filters
 */
const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  searchIcon,
  searchPlaceholder = "Search...",
  filter1Options = [],
  filter1Value,
  onFilter1Change,
  filter1AllLabel = "All",
  filter1Icon,
  filter2Options = [],
  filter2Value,
  onFilter2Change,
  filter2AllLabel = "All",
  filter2Icon,
  className = "",
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-6 mb-10 border border-gray-100 backdrop-blur-sm bg-white/80 ${className}`}
    >
      <div className="grid md:grid-cols-3 gap-6">
        {/* Search */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors duration-200">
            {searchIcon}
          </div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm"
          />
        </div>

        {/* First Filter */}
        {filter1Options.length > 0 && (
          <div className="relative group">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors duration-200">
              {filter1Icon}
            </div>
            <select
              value={filter1Value}
              onChange={(e) => onFilter1Change(e.target.value || null)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm"
            >
              <option value="">{filter1AllLabel}</option>
              {filter1Options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronRight className="w-5 h-5 text-gray-400 rotate-90" />
            </div>
          </div>
        )}

        {/* Second Filter */}
        {filter2Options.length > 0 && (
          <div className="relative group">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors duration-200">
              {filter2Icon}
            </div>
            <select
              value={filter2Value}
              onChange={(e) => onFilter2Change(e.target.value || null)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm"
            >
              <option value="">{filter2AllLabel}</option>
              {filter2Options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronRight className="w-5 h-5 text-gray-400 rotate-90" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
