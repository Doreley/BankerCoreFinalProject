import { nombreRecurso } from "../../logic/banquero";
import type { Matriz } from "../../logic/tipos";
import { NumberField } from "../ui/NumberField";

type MatrixTableProps = {
  titulo: string;
  descripcion: string;
  valores: Matriz;
  m: number;
  calculado?: boolean; // true = solo lectura (Need)
  tieneError?: (proceso: number, recurso: number) => boolean;
  onCambiar?: (proceso: number, recurso: number, valor: number) => void;
};

/** Tarjeta con una matriz (una fila por proceso, una columna por recurso). */
export function MatrixTable({ titulo, descripcion, valores, m, calculado = false, tieneError, onCambiar }: MatrixTableProps) {
  const columnas: number[] = [];
  for (let j = 0; j < m; j++) columnas.push(j);

  return (
    <section className="matrix-card">
      <div className="card-heading">
        <div>
          <h3>{titulo}</h3>
          <p>{descripcion}</p>
        </div>
        {calculado && <span className="calculated-tag">Calculado</span>}
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Proceso</th>
              {columnas.map((j) => (
                <th key={j}>R{nombreRecurso(j)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {valores.map((fila, i) => (
              <tr key={i}>
                <th>P{i}</th>
                {fila.map((valor, j) => (
                  <td key={j}>
                    {calculado ? (
                      <span className={`readonly-value ${valor < 0 ? "readonly-value--negative" : ""}`}>
                        {Number.isNaN(valor) ? "–" : valor}
                      </span>
                    ) : (
                      <NumberField
                        invalid={tieneError ? tieneError(i, j) : false}
                        label={`${titulo}, proceso ${i}, recurso ${nombreRecurso(j)}`}
                        onChange={(nuevo) => onCambiar?.(i, j, nuevo)}
                        value={valor}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}