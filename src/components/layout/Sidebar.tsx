import { Icon, type IconName } from "../ui/Icon";

export type SeccionId = "configuration" | "matrices" | "results" | "request";

const SECCIONES: { id: SeccionId; icono: IconName; titulo: string; detalle: string }[] = [
  { id: "configuration", icono: "grid", titulo: "Configuración", detalle: "Procesos y recursos" },
  { id: "matrices", icono: "database", titulo: "Matrices", detalle: "Asignación y máximos" },
  { id: "results", icono: "chart", titulo: "Análisis", detalle: "Estado y secuencia" },
  { id: "request", icono: "send", titulo: "Solicitud", detalle: "Simular un Request" },
];

type SidebarProps = {
  activa: SeccionId;
  onNavegar: (id: SeccionId) => void;
};

/** Menú lateral con las secciones de la página. */
export function Sidebar({ activa, onNavegar }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__label">Simulación</div>
      <nav>
        {SECCIONES.map((seccion) => (
          <a
            className={`nav-item ${activa === seccion.id ? "nav-item--active" : ""}`}
            href={`#${seccion.id}`}
            key={seccion.id}
            onClick={() => onNavegar(seccion.id)}
          >
            <Icon name={seccion.icono} />
            <span>
              <strong>{seccion.titulo}</strong>
              <small>{seccion.detalle}</small>
            </span>
          </a>
        ))}
      </nav>
    </aside>
  );
}