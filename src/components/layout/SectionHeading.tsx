type SectionHeadingProps = {
  numero: string;
  titulo: string;
  descripcion: string;
};

export function SectionHeading({ numero, titulo, descripcion }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <div className="section-number">{numero}</div>
      <div>
        <h2>{titulo}</h2>
        <p>{descripcion}</p>
      </div>
    </div>
  );
}