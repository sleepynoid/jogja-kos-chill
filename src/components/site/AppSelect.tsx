import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "__all";

export type AppSelectOption = { value: string; label: string };

export function AppSelect({
  value,
  onChange,
  options,
  placeholder,
  allowAll = true,
  allLabel,
  className,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly AppSelectOption[];
  placeholder?: string;
  allowAll?: boolean;
  allLabel?: string;
  className?: string;
  required?: boolean;
}) {
  // Radix Select can't use "" as item value, so we use a sentinel.
  const current = value === "" ? (allowAll ? ALL : "") : value;

  return (
    <Select
      value={current || undefined}
      onValueChange={(v) => onChange(v === ALL ? "" : v)}
      required={required}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder ?? "Pilih…"} />
      </SelectTrigger>
      <SelectContent>
        {allowAll && <SelectItem value={ALL}>{allLabel ?? "Semua"}</SelectItem>}
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
