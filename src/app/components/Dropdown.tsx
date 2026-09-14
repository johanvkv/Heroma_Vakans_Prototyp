import React, { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  options: string[];
  value?: string;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value = '',
  placeholder = 'Label',
  label,
  disabled = false,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (option: string) => {
    setSelected(option);
    onChange?.(option);
    setIsOpen(false);
  };

  const triggerClass = [
    'dropdown-custom-trigger',
    disabled ? 'dropdown-custom-trigger-disabled' : '',
    isOpen ? 'dropdown-custom-trigger-open' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="dropdown-custom" ref={ref}>
      {label && selected && (
        <label className="dropdown-field-label">{label}</label>
      )}
      <div className={triggerClass} onClick={() => !disabled && setIsOpen(!isOpen)}>
        <span className={selected ? 'dropdown-custom-value' : 'dropdown-custom-placeholder'}>
          {selected || placeholder}
        </span>
        <i className="fa-solid fa-chevron-down dropdown-custom-arrow"></i>
      </div>
      {isOpen && (
        <div className="dropdown-list">
          {options.map((opt) => (
            <div
              key={opt}
              className={`dropdown-list-item${opt === selected ? ' selected' : ''}`}
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
