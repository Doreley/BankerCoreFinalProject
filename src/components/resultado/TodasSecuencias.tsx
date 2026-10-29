import { useState } from "react";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";

type TodasSecuenciasProps = {
  secuencias: number[][];
  sugerida: number[];
};

const MOSTRAR_AL_INICIO = 6;

/** EXTRA: las demás secuencias seguras que existen, además de la sugerida. */
export function TodasSecuencias({ secuencias, sugerida }: TodasSecuenciasProps) {
  const [verTodas, setVerTodas] = useState(false);

  // Quitamos la sugerida de la lista, porque ya se muestra arriba
  const textoSugerida = sugerida.join(",");
  const otras: number[][] = [];
  for (const secuencia of secuencias) {
    if (secuencia.join(",") !== textoSugerida) {
      otras.push(secuencia);
    }
  }

  // Si la sugerida es la única, no hay nada más que mostrar
  if (otras.length === 0) return null;

  const visibles = verTodas ? otras : otras.slice(0, MOSTRAR_AL_INICIO);

  return (
    <div className="extra-card">
      <div className="extra-card__heading">
        <span className="extra-card__icon">
          <Icon name="list" size={16} />
        </span>
        <div>
          <strong>Otras secuencias seguras posibles</strong>
          <small>
            En total hay {secuencias.length} secuencias seguras. Cualquiera de estos órdenes también permite que todos
            los procesos terminen.
          </small>
        </div>
      </div>

      <ol className="sequence-list">
        {visibles.map((secuencia, k) => (
          <li key={k}>
            <span className="sequence-list__number">{k + 1}</span>
            <span>{secuencia.map((p) => "P" + p).join(" → ")}</span>
          </li>
        ))}
      </ol>

      {otras.length > MOSTRAR_AL_INICIO && (
        <Button className="recalculate-button" onClick={() => setVerTodas(!verTodas)}>
          {verTodas ? "Ver menos" : `Ver todas (${otras.length})`}
        </Button>
      )}
    </div>
  );
}