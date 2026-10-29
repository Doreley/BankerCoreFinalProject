import { nombreRecurso, restarVectores } from "../../logic/banquero";
import type { PasoSeguridad } from "../../logic/tipos";
import { Icon } from "../ui/Icon";

/** "necesita 7 de A y hay 3": lo que le falta al proceso en ese paso. */
function textoFaltante(paso: PasoSeguridad): string {
  const partes: string[] = [];
  for (let j = 0; j < paso.need.length; j++) {
    if (paso.need[j] > paso.workAntes[j]) {
      partes.push(`necesita ${paso.need[j]} de ${nombreRecurso(j)} y hay ${paso.workAntes[j]}`);
    }
  }
  return partes.join("; ");
}

/** Detalle de ejecución: cada vez que el algoritmo evaluó un proceso. */
export function ListaPasos({ pasos }: { pasos: PasoSeguridad[] }) {
  const iteraciones = pasos.length > 0 ? pasos[pasos.length - 1].iteracion : 0;

  return (
    <>
      <div className="steps-heading">
        <div>
          <h3>Detalle de ejecución</h3>
          <p>Qué proceso se evalúa, si cumple Need ≤ Work y cómo cambia el vector Work.</p>
        </div>
        <span>
          {pasos.length} evaluaciones · {iteraciones} iteraciones
        </span>
      </div>

      <div className="steps-list">
        {pasos.map((paso, k) =>
          paso.puedeTerminar ? (
            <div className="execution-step" key={k}>
              <span className="execution-step__number">{k + 1}</span>
              <div className="execution-step__process">
                <strong>P{paso.proceso}</strong>
                <span>
                  Iteración {paso.iteracion} · Need [{paso.need.join(", ")}] ≤ Work: puede finalizar
                </span>
              </div>
              <div className="vector">
                <small>Work inicial</small>
                <strong>[{paso.workAntes.join(", ")}]</strong>
              </div>
              <Icon name="arrow" size={16} />
              <div className="vector vector--released">
                <small>Libera</small>
                <strong>+ [{restarVectores(paso.workDespues, paso.workAntes).join(", ")}]</strong>
              </div>
              <Icon name="arrow" size={16} />
              <div className="vector vector--final">
                <small>Nuevo Work</small>
                <strong>[{paso.workDespues.join(", ")}]</strong>
              </div>
            </div>
          ) : (
            <div className="execution-step execution-step--wait" key={k}>
              <span className="execution-step__number">{k + 1}</span>
              <div className="execution-step__process">
                <strong>P{paso.proceso}</strong>
                <span>
                  Iteración {paso.iteracion} · debe esperar: {textoFaltante(paso)}
                </span>
              </div>
              <div className="vector vector--need">
                <small>Need</small>
                <strong>[{paso.need.join(", ")}]</strong>
              </div>
              <span className="vector-compare">&gt;</span>
              <div className="vector">
                <small>Work</small>
                <strong>[{paso.workAntes.join(", ")}]</strong>
              </div>
            </div>
          ),
        )}
      </div>
    </>
  );
}
