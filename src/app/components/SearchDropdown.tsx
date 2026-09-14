import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  id: string;
  label: string;
  subtitle?: string;
  section?: string;
}

interface SearchDropdownProps {
  options: DropdownOption[];
  placeholder?: string;
  onSelect?: (option: DropdownOption) => void;
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({ 
  options, 
  placeholder = "Search...",
  onSelect 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.subtitle && option.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (option.section && option.section.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group options by section
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const section = option.section || 'Other';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(option);
    return acc;
  }, {} as Record<string, DropdownOption[]>);

  const handleSelect = (option: DropdownOption) => {
    setSelectedOption(option);
    setSearchTerm(option.label);
    setIsOpen(false);
    if (onSelect) {
      onSelect(option);
    }
  };

  return (
    <div className="search-dropdown-container" ref={dropdownRef}>
      <div className="position-relative">
        <input
          type="text"
          className="form-control-custom"
          placeholder="Sök"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <i className="fa-solid fa-search input-icon"></i>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="search-dropdown">
          <div className="search-dropdown-scroll">
            {Object.entries(groupedOptions).map(([section, sectionOptions]) => (
              <div key={section}>
                {section !== 'Other' && (
                  <div className="search-dropdown-item search-dropdown-section">
                    <div className="search-dropdown-text">{section}</div>
                  </div>
                )}
                {sectionOptions.map((option) => (
                  <div
                    key={option.id}
                    className="search-dropdown-item search-dropdown-option"
                    onClick={() => handleSelect(option)}
                  >
                    <div className="search-dropdown-text">{option.label}</div>
                    {option.subtitle && (
                      <div className="search-dropdown-subtitle">{option.subtitle}</div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="search-dropdown-scrollbar"></div>
        </div>
      )}
    </div>
  );
};