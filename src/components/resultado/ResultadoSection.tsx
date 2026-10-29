import type { Analisis } from "../../logic/tipos";
import { SectionHeading } from "../layout/SectionHeading";
import { Icon } from "../ui/Icon";
import { DiagnosticoCard } from "./DiagnosticoCard";
import { ListaPasos } from "./ListaPasos";
import { PanelSecuencia } from "./PanelSecuencia";
import { ResumenEstado } from "./ResumenEstado";
import { TodasSecuencias } from "./TodasSecuencias";

type ResultadoProps = {
  analisis: Analisis | null;
  onRecalcular: () => void;
};

/** Sección 03: resultado del algoritmo de seguridad. */
export function ResultadoSection({ analisis, onRecalcular }: ResultadoProps) {
  return (
    <section className="results-section" id="results">
      <SectionHeading
        numero="03"
        titulo="Resultado del análisis"
        descripcion="Estado global, secuencia sugerida y evolución de los recursos."
      />

      {analisis === null ? (
        <div className="empty-result">
          <span className="empty-result__icon">
            <Icon name="chart" size={28} />
          </span>
          <h3>Aún no hay resultados</h3>
          <p>Completa las matrices y selecciona “Analizar sistema” para comenzar.</p>
        </div>
      ) : (
        <div className={`result-card ${analisis.seguridad.seguro ? "" : "result-card--unsafe"}`}>
          <ResumenEstado seguridad={analisis.seguridad} onRecalcular={onRecalcular} />

          {analisis.seguridad.secuencia.length > 0 && (
            <PanelSecuencia secuencia={analisis.seguridad.secuencia} seguro={analisis.seguridad.seguro} />
          )}

          {analisis.seguridad.seguro && (
            <TodasSecuencias secuencias={analisis.secuencias} sugerida={analisis.seguridad.secuencia} />
          )}

          {analisis.diagnostico && <DiagnosticoCard diagnostico={analisis.diagnostico} />}

          <ListaPasos pasos={analisis.seguridad.pasos} />
        </div>
      )}
    </section>
  );
}