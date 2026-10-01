interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  textarea?: boolean
  placeholder?: string
  rows?: number
  maxLength?: number
  type?: string
}

export default function TextField({
  label,
  value,
  onChange,
  required,
  textarea,
  placeholder,
  rows = 3,
  maxLength,
  type = 'text',
}: TextFieldProps) {
  const className =
    'w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
  return (
    <div>
      <label className="block text-sm font-medium text-card-foreground mb-2">
        {label}
        {required ? ' *' : ''}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          rows={rows}
          placeholder={placeholder}
          maxLength={maxLength}
          className={className}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          className={className}
        />
      )}
    </div>
  )
}
