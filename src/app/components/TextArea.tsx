import React from 'react';

interface TextAreaProps {
  label: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  value = '',
  placeholder,
  disabled = false,
  maxLength = 50,
  rows = 2,
  onChange
}) => {
  const [currentValue, setCurrentValue] = React.useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentValue(e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  const className = `textarea-field ${disabled ? 'textarea-field-disabled' : ''}`;

  return (
    <div className={className}>
      <textarea
        className="textarea-field-control"
        placeholder={placeholder || label}
        value={currentValue}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        onChange={handleChange}
      />
      <span className="textarea-field-counter">
        {currentValue.length}/{maxLength}
      </span>
    </div>
  );
};
