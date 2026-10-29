import type { Matriz, SolicitudEvaluada, Vector } from "../../logic/tipos";

type PasosProps = {
  evaluada: SolicitudEvaluada;
  need: Matriz;
  available: Vector;
};

type EstadoPaso = "ok" | "fallo" | "pendiente";

/** Los 4 pasos del algoritmo de solicitud, marcando hasta dónde llegó. */
export function PasosSolicitud({ evaluada, need, available }: PasosProps) {
  const { proceso, request, resultado } = evaluada;
  const estado = resultado.estado;

  // ¿Todos los valores de la solicitud son enteros >= 0?
  let requestValido = true;
  for (const valor of request) {
    if (!Number.isInteger(valor) || valor < 0) requestValido = false;
  }
  if (!requestValido) return null; // el mensaje de arriba ya explica el error

  // Hasta qué paso llegó según el resultado
  const paso1: EstadoPaso = estado === "error" ? "fallo" : "ok";
  const paso2: EstadoPaso = estado === "error" ? "pendiente" : estado === "esperar" ? "fallo" : "ok";
  const paso3: EstadoPaso = estado === "concedida" || estado === "rechazada" ? "ok" : "pendiente";
  const paso4: EstadoPaso = estado === "concedida" ? "ok" : estado === "rechazada" ? "fallo" : "pendiente";

  const req = `[${request.join(", ")}]`;
  const nuevo = resultado.sistemaNuevo;

  const pasos: { estado: EstadoPaso; titulo: string; detalle: string }[] = [
    { estado: paso1, titulo: "Request ≤ Need", detalle: `${req} ≤ Need[P${proceso}] [${need[proceso].join(", ")}]` },
    { estado: paso2, titulo: "Request ≤ Available", detalle: `${req} ≤ Available [${available.join(", ")}]` },
    {
      estado: paso3,
      titulo: "Asignación provisional",
      detalle: nuevo
        ? `Available = [${nuevo.available.join(", ")}] · Allocation[P${proceso}] = [${nuevo.allocation[proceso].join(", ")}]`
        : "Available − Request · Allocation + Request",
    },
    {
      estado: paso4,
      titulo: "Algoritmo de seguridad",
      detalle: resultado.seguridad
        ? resultado.seguridad.seguro
          ? `Seguro: ${resultado.seguridad.secuencia.map((p) => "P" + p).join(" → ")}`
          : `Inseguro: bloqueados ${resultado.seguridad.bloqueados.map((p) => "P" + p).join(", ")}`
        : "¿El estado provisional es seguro?",
    },
  ];

  const etiqueta = { ok: "Cumple", fallo: "No cumple", pendiente: "No se evaluó" };

  return (
    <div className="steps-list request-steps">
      {pasos.map((paso, k) => (
        <div className={`request-step request-step--${paso.estado}`} key={k}>
          <span className="execution-step__number">{k + 1}</span>
          <div className="execution-step__process">
            <strong>{paso.titulo}</strong>
            <span>{paso.detalle}</span>
          </div>
          <span className="request-step__status">{etiqueta[paso.estado]}</span>
        </div>
      ))}
    </div>
  );
}