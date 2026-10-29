type NumberFieldProps = {
  value: number;
  label: string;
  onChange: (value: number) => void;
  invalid?: boolean;
};

export function NumberField({ value, label, onChange, invalid = false }: NumberFieldProps) {
  return (
    <input
      aria-label={label}
      className={`number-field ${invalid ? "number-field--invalid" : ""}`}
      onChange={(event) => {
        const texto = event.target.value;
        onChange(texto === "" ? NaN : Number(texto));
      }}
      type="number"
      value={Number.isNaN(value) ? "" : value}
    />
  );
}