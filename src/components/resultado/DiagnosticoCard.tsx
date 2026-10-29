import { nombreRecurso } from "../../logic/banquero";
import type { Diagnostico, Vector } from "../../logic/tipos";
import { Icon } from "../ui/Icon";
import { SecuenciaChips } from "./SecuenciaChips";

/** Convierte [1, 0, 2] en "1 de A, 2 de C" (omite los ceros). */
function textoRecursos(vector: Vector): string {
  const partes: string[] = [];
  for (let j = 0; j < vector.length; j++) {
    if (vector[j] > 0) partes.push(`${vector[j]} de ${nombreRecurso(j)}`);
  }
  return partes.join(", ");
}

/** EXTRA: explica por qué el estado es inseguro y cómo se arreglaría. */
export function DiagnosticoCard({ diagnostico }: { diagnostico: Diagnostico }) {
  return (
    <div className="extra-card extra-card--danger">
      <div className="extra-card__heading">
        <span className="extra-card__icon">
          <Icon name="info" size={16} />
        </span>
        <div>
          <strong>Diagnóstico del estado inseguro</strong>
          <small>Lo que le falta a cada proceso bloqueado para poder terminar.</small>
        </div>
      </div>

      <div className="diagnostic-list">
        {diagnostico.faltantes.map((f) => (
          <div className="diagnostic-item" key={f.proceso}>
            <strong>P{f.proceso}</strong>
            <span>
              Necesita <code>[{f.need.join(", ")}]</code> · le falta <b>{textoRecursos(f.falta)}</b>
            </span>
          </div>
        ))}
      </div>

      <div className="diagnostic-fix">
        <span>
          <b>Sugerencia:</b> con {textoRecursos(diagnostico.recursosExtra)} adicional en Available, el sistema sería seguro con
          esta secuencia:
        </span>
        <SecuenciaChips secuencia={diagnostico.secuenciaConExtra} />
      </div>
    </div>
  );
}
