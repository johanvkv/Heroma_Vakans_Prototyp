import React from 'react';

interface TextSearchProps {
  label: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  supportingText?: string;
  readOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TextSearch: React.FC<TextSearchProps> = ({
  label,
  value = '',
  placeholder,
  disabled = false,
  error = false,
  errorMessage,
  supportingText,
  readOnly = false,
  onChange
}) => {
  const [currentValue, setCurrentValue] = React.useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentValue(e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  const className = `text-search-field ${error ? 'text-search-field-error' : ''} ${disabled ? 'text-search-field-disabled' : ''} ${readOnly ? 'text-search-field-readonly' : ''}`;

  return (
    <div className={className}>
      {readOnly && (
        <label className="text-search-field-label">{label}</label>
      )}
      <div className="text-search-field-content">
        <i className="fa-solid fa-magnifying-glass text-search-field-icon"></i>
        <input
          type="text"
          className="text-search-field-control"
          placeholder={placeholder || label}
          value={currentValue}
          disabled={disabled}
          readOnly={readOnly}
          onChange={handleChange}
        />
      </div>
      {(supportingText || errorMessage) && (
        <span className={`text-search-field-helper ${error ? 'text-search-field-helper-error' : ''}`}>
          {error ? errorMessage : supportingText}
        </span>
      )}
    </div>
  );
};
