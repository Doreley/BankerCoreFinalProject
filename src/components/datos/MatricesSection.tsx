import { nombreRecurso } from "../../logic/banquero";
import type { ErrorValidacion, Matriz, Sistema } from "../../logic/tipos";
import { SectionHeading } from "../layout/SectionHeading";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { NumberField } from "../ui/NumberField";
import { MatrixTable } from "./MatrixTable";

type MatrizEditable = "available" | "max" | "allocation";

type MatricesProps = {
  sistema: Sistema;
  need: Matriz;
  errores: ErrorValidacion[];
  onCambiarCelda: (matriz: MatrizEditable, proceso: number, recurso: number, valor: number) => void;
  onAnalizar: () => void;
};

/** Sección 02: Available, Allocation, Max, Need y el botón de analizar. */
export function MatricesSection({ sistema, need, errores, onCambiarCelda, onAnalizar }: MatricesProps) {
  // ¿Hay un error en esta celda? (se usa para pintarla de rojo)
  function tieneError(matriz: MatrizEditable, proceso: number, recurso: number): boolean {
    for (const error of errores) {
      if (error.matriz === matriz && error.proceso === proceso && error.recurso === recurso) {
        return true;
      }
    }
    return false;
  }

  const hayErrores = errores.length > 0;

  return (
    <section className="workspace-section" id="matrices">
      <SectionHeading
        numero="02"
        titulo="Distribuye los recursos"
        descripcion="Ingresa valores enteros positivos. La necesidad se calcula automáticamente."
      />

      <section className="available-card">
        <div className="card-heading">
          <div>
            <h3>Recursos disponibles</h3>
            <p>Instancias libres de cada recurso en este momento.</p>
          </div>
          <span className="vector-tag">Vector Available</span>
        </div>
        <div className="resource-row">
          {sistema.available.map((valor, j) => (
            <label className="resource-field" key={j}>
              <span>Recurso {nombreRecurso(j)}</span>
              <NumberField
                invalid={tieneError("available", -1, j)}
                label={`Recurso disponible ${nombreRecurso(j)}`}
                onChange={(nuevo) => onCambiarCelda("available", -1, j, nuevo)}
                value={valor}
              />
            </label>
          ))}
        </div>
      </section>

      <div className={`matrix-grid ${sistema.m > 3 ? "matrix-grid--wide" : ""}`}>
        <MatrixTable
          titulo="Matriz Allocation"
          descripcion="Recursos asignados actualmente."
          valores={sistema.allocation}
          m={sistema.m}
          tieneError={(i, j) => tieneError("allocation", i, j)}
          onCambiar={(i, j, valor) => onCambiarCelda("allocation", i, j, valor)}
        />
        <MatrixTable
          titulo="Matriz Max"
          descripcion="Demanda máxima de cada proceso."
          valores={sistema.max}
          m={sistema.m}
          tieneError={(i, j) => tieneError("max", i, j)}
          onCambiar={(i, j, valor) => onCambiarCelda("max", i, j, valor)}
        />
        <MatrixTable titulo="Matriz Need" descripcion="Max − Allocation" valores={need} m={sistema.m} calculado />
      </div>

      {hayErrores && (
        <div className="validation-message">
          <Icon name="info" size={18} />
          <div>
            <strong>
              {errores.length === 1 ? "Hay 1 dato por corregir" : `Hay ${errores.length} datos por corregir`} antes de analizar:
            </strong>
            <ul>
              {errores.slice(0, 5).map((error, k) => (
                <li key={k}>{error.mensaje}</li>
              ))}
              {errores.length > 5 && <li>y {errores.length - 5} más…</li>}
            </ul>
          </div>
        </div>
      )}

      <div className="analyze-bar">
        <div className="analyze-bar__copy">
          <span className="analyze-bar__icon">
            <Icon name="shield" />
          </span>
          <div>
            <strong>{hayErrores ? "Corrige los datos marcados" : "Todo listo para el análisis"}</strong>
            <span>Comprobaremos si existe una secuencia de ejecución segura.</span>
          </div>
        </div>
        <Button className="primary-button" disabled={hayErrores} onClick={onAnalizar}>
          Analizar sistema
          <Icon name="arrow" size={18} />
        </Button>
      </div>
    </section>
  );
}