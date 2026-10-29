import type { ResultadoSeguridad } from "../../logic/tipos";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";

type ResumenProps = {
  seguridad: ResultadoSeguridad;
  onRecalcular: () => void;
};

/** Franja superior del resultado: estado seguro (verde) o inseguro (rojo). */
export function ResumenEstado({ seguridad, onRecalcular }: ResumenProps) {
  const bloqueados = seguridad.bloqueados.map((p) => "P" + p).join(", ");

  return (
    <div className="result-summary">
      <div className="result-summary__icon">
        <Icon name={seguridad.seguro ? "check" : "info"} size={28} />
      </div>
      <div>
        <span className="result-kicker">{seguridad.seguro ? "Análisis completado" : "Atención requerida"}</span>
        <h2>Sistema {seguridad.seguro ? "en estado seguro" : "en estado inseguro"}</h2>
        <p>
          {seguridad.seguro
            ? "Todos los procesos pueden finalizar sin producir un interbloqueo."
            : `No existe una secuencia que permita finalizar todos los procesos. Bloqueados: ${bloqueados}. Hay riesgo de interbloqueo.`}
        </p>
      </div>
      <Button className="recalculate-button" onClick={onRecalcular}>
        <Icon name="refresh" size={16} />
        Recalcular
      </Button>
    </div>
  );
}
