import { Icon } from "../ui/Icon";

/** Muestra una secuencia como P1 > P3 > P0 ... */
export function SecuenciaChips({ secuencia }: { secuencia: number[] }) {
  return (
    <div className="sequence">
      {secuencia.map((proceso, k) => (
        <div className="sequence__item" key={proceso}>
          <span>P{proceso}</span>
          {k < secuencia.length - 1 && <Icon name="chevron" size={17} />}
        </div>
      ))}
    </div>
  );
}
