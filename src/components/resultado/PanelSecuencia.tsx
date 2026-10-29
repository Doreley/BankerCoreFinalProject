import { Icon } from "../ui/Icon";
import { SecuenciaChips } from "./SecuenciaChips";

type PanelSecuenciaProps = {
  secuencia: number[];
  seguro: boolean;
};

/** Secuencia segura sugerida (o el progreso alcanzado si es inseguro). */
export function PanelSecuencia({ secuencia, seguro }: PanelSecuenciaProps) {
  return (
    <div className="sequence-panel">
      <div className="sequence-panel__heading">
        <span>
          <Icon name="spark" size={16} />
        </span>
        <div>
          <strong>{seguro ? "Secuencia segura sugerida" : "Progreso alcanzado"}</strong>
          <small>
            {seguro ? "Orden en que los procesos pueden completarse" : "Procesos que alcanzaron a terminar antes del bloqueo"}
          </small>
        </div>
      </div>
      <SecuenciaChips secuencia={secuencia} />
    </div>
  );
}
