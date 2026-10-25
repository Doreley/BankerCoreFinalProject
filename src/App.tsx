import { useMemo, useState, type ReactNode } from "react";
import "./App.css";

type Matrix = number[][];
type Scenario = {
  processes: number;
  resources: number;
  available: number[];
  allocation: Matrix;
  max: Matrix;
};

type SafetyStep = {
  process: number;
  before: number[];
  released: number[];
  after: number[];
};

type SafetyResult = {
  safe: boolean;
  sequence: number[];
  steps: SafetyStep[];
  blocked: number[];
};

const classicScenario: Scenario = {
  processes: 5,
  resources: 3,
  available: [3, 3, 2],
  allocation: [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2],
  ],
  max: [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3],
  ],
};

const unsafeScenario: Scenario = {
  processes: 4,
  resources: 3,
  available: [0, 0, 1],
  allocation: [
    [1, 0, 1],
    [1, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
  max: [
    [2, 1, 1],
    [1, 2, 1],
    [2, 1, 2],
    [1, 2, 1],
  ],
};

const emptyScenario: Scenario = {
  processes: 3,
  resources: 3,
  available: [0, 0, 0],
  allocation: Array.from({ length: 3 }, () => [0, 0, 0]),
  max: Array.from({ length: 3 }, () => [0, 0, 0]),
};

const resourceName = (index: number) => String.fromCharCode(65 + index);

function Icon({
  name,
  size = 20,
}: {
  name:
    | "grid"
    | "database"
    | "chart"
    | "shield"
    | "spark"
    | "check"
    | "arrow"
    | "info"
    | "refresh"
    | "chevron";
  size?: number;
}) {
  const paths: Record<string, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
        <path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V10" />
        <path d="M10 20V4" />
        <path d="M16 20v-7" />
        <path d="M22 20H2" />
      </>
    ),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
    spark: (
      <>
        <path d="m12 3-1.2 4.2a5.2 5.2 0 0 1-3.6 3.6L3 12l4.2 1.2a5.2 5.2 0 0 1 3.6 3.6L12 21l1.2-4.2a5.2 5.2 0 0 1 3.6-3.6L21 12l-4.2-1.2a5.2 5.2 0 0 1-3.6-3.6L12 3Z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m14 7 5 5-5 5" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <path d="M12 8h.01" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M4 17v-5h5" />
        <path d="M7 19a8 8 0 0 0 13-7" />
        <path d="M17 5A8 8 0 0 0 4 12" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
  };

  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name]}
    </svg>
  );
}

function Button({
  children,
  className = "",
  onClick,
  disabled = false,
  type = "button",
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  ariaLabel?: string;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={`button ${className}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}

function NumberField({
  value,
  label,
  onChange,
  invalid = false,
}: {
  value: number;
  label: string;
  onChange: (value: number) => void;
  invalid?: boolean;
}) {
  return (
    <input
      aria-label={label}
      className={`number-field ${invalid ? "number-field--invalid" : ""}`}
      min="0"
      onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
      type="number"
      value={value}
    />
  );
}

function Stepper({
  label,
  value,
  helper,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  helper: string;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="stepper-card">
      <div>
        <span className="field-label">{label}</span>
        <span className="field-helper">{helper}</span>
      </div>
      <div className="stepper">
        <Button
          ariaLabel={`Reducir ${label}`}
          className="stepper__button"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          −
        </Button>
        <span className="stepper__value">{value}</span>
        <Button
          ariaLabel={`Aumentar ${label}`}
          className="stepper__button"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          +
        </Button>
      </div>
    </div>
  );
}

function MatrixTable({
  title,
  caption,
  values,
  resourceCount,
  onChange,
  compare,
  readOnly = false,
}: {
  title: string;
  caption: string;
  values: Matrix;
  resourceCount: number;
  onChange?: (row: number, column: number, value: number) => void;
  compare?: Matrix;
  readOnly?: boolean;
}) {
  return (
    <section className="matrix-card">
      <div className="card-heading">
        <div>
          <h3>{title}</h3>
          <p>{caption}</p>
        </div>
        {readOnly && <span className="calculated-tag">Calculado</span>}
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Proceso</th>
              {Array.from({ length: resourceCount }, (_, index) => (
                <th key={index}>R{resourceName(index)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {values.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <th>P{rowIndex}</th>
                {row.map((value, columnIndex) => {
                  const invalid =
                    compare !== undefined &&
                    value > compare[rowIndex][columnIndex];
                  return (
                    <td key={columnIndex}>
                      {readOnly ? (
                        <span className="readonly-value">{value}</span>
                      ) : (
                        <NumberField
                          invalid={invalid}
                          label={`${title}, proceso ${rowIndex}, recurso ${resourceName(columnIndex)}`}
                          onChange={(nextValue) =>
                            onChange?.(rowIndex, columnIndex, nextValue)
                          }
                          value={value}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function copyScenario(scenario: Scenario): Scenario {
  return {
    ...scenario,
    available: [...scenario.available],
    allocation: scenario.allocation.map((row) => [...row]),
    max: scenario.max.map((row) => [...row]),
  };
}

function App() {
  const [scenario, setScenario] = useState<Scenario>(() =>
    copyScenario(classicScenario),
  );
  const [result, setResult] = useState<SafetyResult | null>(null);
  const [activeScenario, setActiveScenario] = useState("classic");

  const need = useMemo(
    () =>
      scenario.max.map((row, processIndex) =>
        row.map(
          (value, resourceIndex) =>
            value - scenario.allocation[processIndex][resourceIndex],
        ),
      ),
    [scenario],
  );

  const hasValidationErrors = need.some((row) =>
    row.some((value) => value < 0),
  );

  const updateSize = (key: "processes" | "resources", value: number) => {
    setResult(null);
    setActiveScenario("");
    setScenario((current) => {
      const processes = key === "processes" ? value : current.processes;
      const resources = key === "resources" ? value : current.resources;
      const resizeRow = (row: number[] = []) =>
        Array.from({ length: resources }, (_, index) => row[index] ?? 0);
      return {
        processes,
        resources,
        available: resizeRow(current.available),
        allocation: Array.from({ length: processes }, (_, index) =>
          resizeRow(current.allocation[index]),
        ),
        max: Array.from({ length: processes }, (_, index) =>
          resizeRow(current.max[index]),
        ),
      };
    });
  };

  const updateMatrix = (
    matrixName: "allocation" | "max",
    row: number,
    column: number,
    value: number,
  ) => {
    setResult(null);
    setActiveScenario("");
    setScenario((current) => ({
      ...current,
      [matrixName]: current[matrixName].map((matrixRow, rowIndex) =>
        rowIndex === row
          ? matrixRow.map((cell, columnIndex) =>
              columnIndex === column ? value : cell,
            )
          : matrixRow,
      ),
    }));
  };

  const loadScenario = (name: string, nextScenario: Scenario) => {
    setScenario(copyScenario(nextScenario));
    setActiveScenario(name);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const runSafetyAlgorithm = () => {
    if (hasValidationErrors) return;

    const work = [...scenario.available];
    const finish = Array(scenario.processes).fill(false);
    const sequence: number[] = [];
    const steps: SafetyStep[] = [];
    let progressed = true;

    while (sequence.length < scenario.processes && progressed) {
      progressed = false;
      for (let process = 0; process < scenario.processes; process += 1) {
        const canFinish =
          !finish[process] &&
          need[process].every(
            (required, resource) => required <= work[resource],
          );
        if (canFinish) {
          const before = [...work];
          scenario.allocation[process].forEach((value, resource) => {
            work[resource] += value;
          });
          finish[process] = true;
          sequence.push(process);
          steps.push({
            process,
            before,
            released: [...scenario.allocation[process]],
            after: [...work],
          });
          progressed = true;
        }
      }
    }

    setResult({
      safe: sequence.length === scenario.processes,
      sequence,
      steps,
      blocked: finish
        .map((isFinished, process) => (!isFinished ? process : -1))
        .filter((process) => process >= 0),
    });
    window.setTimeout(
      () =>
        document
          .getElementById("results")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50,
    );
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark">
            <Icon name="shield" size={22} />
          </span>
          <span className="brand__name">Banker Lab</span>
          <span className="brand__divider" />
          <span className="brand__subtitle">Simulador de seguridad</span>
        </div>
        <div className="topbar__status">
          <span className="status-dot" />
          Algoritmo del Banquero
        </div>
      </header>

      <aside className="sidebar">
        <div className="sidebar__label">Simulación</div>
        <nav>
          <a className="nav-item nav-item--active" href="#configuration">
            <Icon name="grid" />
            <span>
              <strong>Configuración</strong>
              <small>Procesos y recursos</small>
            </span>
          </a>
          <a className="nav-item" href="#matrices">
            <Icon name="database" />
            <span>
              <strong>Matrices</strong>
              <small>Asignación y máximos</small>
            </span>
          </a>
          <a className="nav-item" href="#results">
            <Icon name="chart" />
            <span>
              <strong>Análisis</strong>
              <small>Estado y secuencia</small>
            </span>
          </a>
        </nav>
        <div className="sidebar__note">
          <Icon name="info" size={18} />
          <div>
            <strong>¿Cómo funciona?</strong>
            <p>
              El algoritmo busca una secuencia donde todos los procesos puedan
              finalizar sin interbloqueos.
            </p>
          </div>
        </div>
      </aside>

      <main>
        <section className="hero" id="configuration">
          <div>
            <span className="eyebrow">
              <Icon name="spark" size={15} />
              Simulador interactivo
            </span>
            <h1>Analiza la seguridad de tu sistema</h1>
            <p>
              Configura los recursos, completa las matrices y descubre si tu
              sistema puede ejecutar todos sus procesos de forma segura.
            </p>
          </div>
          <div className="hero__visual" aria-hidden="true">
            <span className="orbit orbit--one" />
            <span className="orbit orbit--two" />
            <span className="hero__shield">
              <Icon name="shield" size={38} />
              <span className="hero__check">
                <Icon name="check" size={14} />
              </span>
            </span>
          </div>
        </section>

        <section className="workspace-section">
          <div className="section-heading">
            <div className="section-number">01</div>
            <div>
              <h2>Define el escenario</h2>
              <p>Elige cuántos procesos y tipos de recursos vas a analizar.</p>
            </div>
          </div>

          <div className="configuration-grid">
            <Stepper
              helper="Entre 2 y 8 procesos"
              label="Número de procesos"
              max={8}
              min={2}
              onChange={(value) => updateSize("processes", value)}
              value={scenario.processes}
            />
            <Stepper
              helper="Entre 1 y 5 recursos"
              label="Tipos de recursos"
              max={5}
              min={1}
              onChange={(value) => updateSize("resources", value)}
              value={scenario.resources}
            />
          </div>

          <div className="presets">
            <span className="presets__label">Casos rápidos</span>
            <Button
              className={`preset ${activeScenario === "classic" ? "preset--active" : ""}`}
              onClick={() => loadScenario("classic", classicScenario)}
            >
              <span className="preset__dot preset__dot--safe" />
              Ejemplo clásico
            </Button>
            <Button
              className={`preset ${activeScenario === "unsafe" ? "preset--active" : ""}`}
              onClick={() => loadScenario("unsafe", unsafeScenario)}
            >
              <span className="preset__dot preset__dot--unsafe" />
              Estado inseguro
            </Button>
            <Button
              className="preset"
              onClick={() => loadScenario("empty", emptyScenario)}
            >
              <Icon name="refresh" size={15} />
              Vaciar todo
            </Button>
          </div>
        </section>

        <section className="workspace-section" id="matrices">
          <div className="section-heading">
            <div className="section-number">02</div>
            <div>
              <h2>Distribuye los recursos</h2>
              <p>
                Ingresa valores enteros positivos. La necesidad se calcula
                automáticamente.
              </p>
            </div>
          </div>

          <section className="available-card">
            <div className="card-heading">
              <div>
                <h3>Recursos disponibles</h3>
                <p>Instancias libres de cada recurso en este momento.</p>
              </div>
              <span className="vector-tag">Vector Available</span>
            </div>
            <div className="resource-row">
              {scenario.available.map((value, index) => (
                <label className="resource-field" key={index}>
                  <span>Recurso {resourceName(index)}</span>
                  <NumberField
                    label={`Recurso disponible ${resourceName(index)}`}
                    onChange={(nextValue) => {
                      setResult(null);
                      setActiveScenario("");
                      setScenario((current) => ({
                        ...current,
                        available: current.available.map((cell, cellIndex) =>
                          cellIndex === index ? nextValue : cell,
                        ),
                      }));
                    }}
                    value={value}
                  />
                </label>
              ))}
            </div>
          </section>

          <div className="matrix-grid">
            <MatrixTable
              caption="Recursos asignados actualmente."
              compare={scenario.max}
              onChange={(row, column, value) =>
                updateMatrix("allocation", row, column, value)
              }
              resourceCount={scenario.resources}
              title="Matriz Allocation"
              values={scenario.allocation}
            />
            <MatrixTable
              caption="Demanda máxima de cada proceso."
              onChange={(row, column, value) =>
                updateMatrix("max", row, column, value)
              }
              resourceCount={scenario.resources}
              title="Matriz Max"
              values={scenario.max}
            />
            <MatrixTable
              caption="Max − Allocation"
              readOnly
              resourceCount={scenario.resources}
              title="Matriz Need"
              values={need.map((row) => row.map((value) => Math.max(0, value)))}
            />
          </div>

          {hasValidationErrors && (
            <div className="validation-message">
              <Icon name="info" size={18} />
              Allocation no puede superar a Max. Revisa los campos resaltados
              antes de analizar.
            </div>
          )}

          <div className="analyze-bar">
            <div className="analyze-bar__copy">
              <span className="analyze-bar__icon">
                <Icon name="shield" />
              </span>
              <div>
                <strong>Todo listo para el análisis</strong>
                <span>
                  Comprobaremos si existe una secuencia de ejecución segura.
                </span>
              </div>
            </div>
            <Button
              className="primary-button"
              disabled={hasValidationErrors}
              onClick={runSafetyAlgorithm}
            >
              Analizar sistema
              <Icon name="arrow" size={18} />
            </Button>
          </div>
        </section>

        <section className="results-section" id="results">
          <div className="section-heading">
            <div className="section-number">03</div>
            <div>
              <h2>Resultado del análisis</h2>
              <p>
                Estado global, secuencia sugerida y evolución de los recursos.
              </p>
            </div>
          </div>

          {!result ? (
            <div className="empty-result">
              <span className="empty-result__icon">
                <Icon name="chart" size={28} />
              </span>
              <h3>Aún no hay resultados</h3>
              <p>
                Completa las matrices y selecciona “Analizar sistema” para
                comenzar.
              </p>
            </div>
          ) : (
            <div className={`result-card ${result.safe ? "" : "result-card--unsafe"}`}>
              <div className="result-summary">
                <div className="result-summary__icon">
                  <Icon name={result.safe ? "check" : "info"} size={28} />
                </div>
                <div>
                  <span className="result-kicker">
                    {result.safe ? "Análisis completado" : "Atención requerida"}
                  </span>
                  <h2>
                    Sistema {result.safe ? "en estado seguro" : "en estado inseguro"}
                  </h2>
                  <p>
                    {result.safe
                      ? "Todos los procesos pueden finalizar sin producir un interbloqueo."
                      : `No existe una secuencia que permita finalizar todos los procesos. Bloqueados: ${result.blocked.map((process) => `P${process}`).join(", ")}.`}
                  </p>
                </div>
                <Button className="recalculate-button" onClick={runSafetyAlgorithm}>
                  <Icon name="refresh" size={16} />
                  Recalcular
                </Button>
              </div>

              {result.sequence.length > 0 && (
                <div className="sequence-panel">
                  <div className="sequence-panel__heading">
                    <span>
                      <Icon name="spark" size={16} />
                    </span>
                    <div>
                      <strong>
                        {result.safe ? "Secuencia segura sugerida" : "Progreso alcanzado"}
                      </strong>
                      <small>
                        Orden en que los procesos pueden completarse
                      </small>
                    </div>
                  </div>
                  <div className="sequence">
                    {result.sequence.map((process, index) => (
                      <div className="sequence__item" key={process}>
                        <span>P{process}</span>
                        {index < result.sequence.length - 1 && (
                          <Icon name="chevron" size={17} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="steps-heading">
                <div>
                  <h3>Detalle de ejecución</h3>
                  <p>Cómo se libera el vector Work en cada paso.</p>
                </div>
                <span>{result.steps.length} iteraciones</span>
              </div>

              <div className="steps-list">
                {result.steps.map((step, index) => (
                  <div className="execution-step" key={step.process}>
                    <span className="execution-step__number">{index + 1}</span>
                    <div className="execution-step__process">
                      <strong>P{step.process}</strong>
                      <span>puede finalizar</span>
                    </div>
                    <div className="vector">
                      <small>Work inicial</small>
                      <strong>[{step.before.join(", ")}]</strong>
                    </div>
                    <Icon name="arrow" size={16} />
                    <div className="vector vector--released">
                      <small>Libera</small>
                      <strong>+ [{step.released.join(", ")}]</strong>
                    </div>
                    <Icon name="arrow" size={16} />
                    <div className="vector vector--final">
                      <small>Nuevo Work</small>
                      <strong>[{step.after.join(", ")}]</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <footer>
        <span>Banker Lab</span>
        <p>Simulación visual del Algoritmo del Banquero</p>
        <small>Sistemas Operativos · Proyecto universitario</small>
      </footer>
    </div>
  );
}

export default App;
