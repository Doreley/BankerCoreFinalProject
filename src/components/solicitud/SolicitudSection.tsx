import { useState } from "react";
import { nombreRecurso } from "../../logic/banquero";
import type { Matriz, Sistema, SolicitudEvaluada, Vector } from "../../logic/tipos";
import { SectionHeading } from "../layout/SectionHeading";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { NumberField } from "../ui/NumberField";
import { PasosSolicitud } from "./PasosSolicitud";

type SolicitudProps = {
  sistema: Sistema;
  need: Matriz;
  datosValidos: boolean;
  evaluada: SolicitudEvaluada | null;
  onEvaluar: (proceso: number, request: Vector) => void;
  onAplicar: () => void;
};

const TITULOS = {
  concedida: "Solicitud concedida",
  rechazada: "Solicitud rechazada",
  esperar: "El proceso debe esperar",
  error: "Solicitud inválida",
};

/** Sección 04: simular que un proceso pide recursos. */
export function SolicitudSection({ sistema, need, datosValidos, evaluada, onEvaluar, onAplicar }: SolicitudProps) {
  // Datos del formulario (solo de la vista)
  const [proceso, setProceso] = useState(0);
  const [request, setRequest] = useState<Vector>(() => {
    const ceros: Vector = [];
    for (let j = 0; j < sistema.m; j++) ceros.push(0);
    return ceros;
  });

  function cambiarRequest(j: number, valor: number) {
    const copia = request.slice();
    copia[j] = valor;
    setRequest(copia);
  }

  const opcionesProceso: number[] = [];
  for (let i = 0; i < sistema.n; i++) opcionesProceso.push(i);

  const estado = evaluada?.resultado.estado;
  const claseResultado =
    estado === "concedida" ? "" : estado === "esperar" ? "result-card--warning" : "result-card--unsafe";

  return (
    <section className="workspace-section request-section" id="request">
      <SectionHeading
        numero="04"
        titulo="Simula una solicitud"
        descripcion="Un proceso pide recursos. Solo se conceden si el sistema sigue en estado seguro."
      />

      <section className="available-card">
        <div className="card-heading">
          <div>
            <h3>Nueva solicitud</h3>
            <p>
              Need[P{proceso}] = [{need[proceso]?.join(", ")}] · Available = [{sistema.available.join(", ")}]
            </p>
          </div>
          <span className="vector-tag">Vector Request</span>
        </div>
        <div className="resource-row request-row">
          <label className="resource-field">
            <span>Proceso</span>
            <select className="select-field" value={proceso} onChange={(e) => setProceso(Number(e.target.value))}>
              {opcionesProceso.map((i) => (
                <option key={i} value={i}>
                  P{i}
                </option>
              ))}
            </select>
          </label>
          {request.map((valor, j) => (
            <label className="resource-field" key={j}>
              <span>Pide de {nombreRecurso(j)}</span>
              <NumberField label={`Solicitud del recurso ${nombreRecurso(j)}`} value={valor} onChange={(nuevo) => cambiarRequest(j, nuevo)} />
            </label>
          ))}
          <Button className="primary-button request-button" disabled={!datosValidos} onClick={() => onEvaluar(proceso, request)}>
            Evaluar solicitud
            <Icon name="send" size={16} />
          </Button>
        </div>
      </section>

      {!datosValidos && <p className="request-hint">Corrige los datos de la sección 02 para poder evaluar solicitudes.</p>}

      {evaluada && (
        <div className={`result-card request-result ${claseResultado}`}>
          <div className="result-summary">
            <div className="result-summary__icon">
              <Icon name={estado === "concedida" ? "check" : "info"} size={28} />
            </div>
            <div>
              <span className="result-kicker">
                P{evaluada.proceso} pide [{evaluada.request.map((v) => (Number.isNaN(v) ? "–" : v)).join(", ")}]
              </span>
              <h2>{TITULOS[evaluada.resultado.estado]}</h2>
              <p>{evaluada.resultado.mensaje}</p>
            </div>
            {estado === "concedida" && (
              <Button className="primary-button" onClick={onAplicar}>
                Aplicar al sistema
                <Icon name="check" size={16} />
              </Button>
            )}
          </div>
          <PasosSolicitud evaluada={evaluada} need={need} available={sistema.available} />
        </div>
      )}
    </section>
  );
}