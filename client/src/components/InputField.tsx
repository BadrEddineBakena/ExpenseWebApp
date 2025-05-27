import React from "react";

interface InputFieldProps {
  label: string;
  name: string;
  className: string;
  value: string;
  type: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type,
  className,
  value,
  onChange,
}) => {
  return (
    <label className="form-label">
      <input
        type={type}
        name={name}
        className={className}
        value={value}
        onChange={onChange}
        required
        placeholder=" " // IMPORTANT: space placeholder for floating effect
      />
      <span>{label}</span>
    </label>
  );
};



export default InputField;

