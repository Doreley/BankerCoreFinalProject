import { SectionHeading } from "../layout/SectionHeading";
import { Button } from "../ui/Button";
import type { ChangeEvent } from "react";
import { Icon } from "../ui/Icon";
import { Stepper } from "../ui/Stepper";

export type EscenarioId = "libro" | "inseguro" | "circular" | "vacio" | "archivo";

type ConfiguracionProps = {
  n: number;
  m: number;
  escenarioActivo: EscenarioId | null;
  onCambiarTamano: (n: number, m: number) => void;
  onCargarEscenario: (id: EscenarioId) => void;
    erroresArchivo: string[];
  onCargarArchivo: (texto: string) => void;
};

/** Sección 01: número de procesos, número de recursos y casos rápidos. */
export function ConfiguracionSection({ n, m, escenarioActivo, onCambiarTamano, onCargarEscenario, erroresArchivo, onCargarArchivo }: ConfiguracionProps) {
  const clasePreset = (id: EscenarioId) => `preset ${escenarioActivo === id ? "preset--active" : ""}`;

  // Cuando el usuario elige un archivo: se lee su texto y se le pasa a App
  function alElegirArchivo(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    archivo.text().then((texto) => onCargarArchivo(texto));
    evento.target.value = ""; // permite volver a elegir el mismo archivo
  }
  return (
    <section className="workspace-section">
      <SectionHeading numero="01" titulo="Define el escenario" descripcion="Elige cuántos procesos y tipos de recursos vas a analizar." />

      <div className="configuration-grid">
        <Stepper helper="Entre 2 y 8 procesos" label="Número de procesos" max={8} min={2} value={n} onChange={(valor) => onCambiarTamano(valor, m)} />
        <Stepper helper="Entre 1 y 5 recursos" label="Tipos de recursos" max={5} min={1} value={m} onChange={(valor) => onCambiarTamano(n, valor)} />
      </div>

      <div className="presets">
        <span className="presets__label">Casos rápidos</span>
        <Button className={clasePreset("libro")} onClick={() => onCargarEscenario("libro")}>
          <span className="preset__dot preset__dot--safe" />
          Estado seguro
        </Button>
        <Button className={clasePreset("inseguro")} onClick={() => onCargarEscenario("inseguro")}>
          <span className="preset__dot preset__dot--unsafe" />
          Estado inseguro
        </Button>
        <Button className={clasePreset("circular")} onClick={() => onCargarEscenario("circular")}>
          <span className="preset__dot preset__dot--unsafe" />
          Espera circulars
        </Button>
        <Button className={clasePreset("vacio")} onClick={() => onCargarEscenario("vacio")}>
          <Icon name="refresh" size={15} />
          Vaciar todo
        </Button>
        <label className={`button ${clasePreset("archivo")}`}>
          <Icon name="upload" size={15} />
          Cargar archivo .txt
          <input accept=".txt" hidden onChange={alElegirArchivo} type="file" />
        </label>
      </div>

      {erroresArchivo.length > 0 && (
        <div className="validation-message">
          <Icon name="info" size={18} />
          <div>
            <strong>No se pudo cargar el archivo:</strong>
            <ul>
              {erroresArchivo.map((error, k) => (
                <li key={k}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}