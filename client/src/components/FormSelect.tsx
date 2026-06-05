interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const baseClass =
  "input-mobile w-full rounded-lg border border-slate-300 bg-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  required,
  className = baseClass,
}: FormSelectProps) {
  const showCustom = value !== "" && !options.includes(value);

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        {showCustom && <option value={value}>{value}</option>}
      </select>
    </div>
  );
}

interface FormDatalistInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  required?: boolean;
  listId: string;
  className?: string;
  hideLabel?: boolean;
}

const inputClass =
  "input-mobile w-full rounded-lg border border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export function FormDatalistInput({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  listId,
  className = inputClass,
  hideLabel,
}: FormDatalistInputProps) {
  return (
    <div>
      {!hideLabel && label && (
        <label className="mb-1 block text-sm font-medium">{label}</label>
      )}
      <input
        required={required}
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      <datalist id={listId}>
        {options.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </div>
  );
}
