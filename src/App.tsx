import { useState } from "react";
import { leerArchivo } from "./logic/archivo";

// Lógica
import { algoritmoSeguridad, calcularNeed, diagnosticar, solicitarRecursos, todasLasSecuencias, validarDatos } from "./logic/banquero";
import { cambiarCelda, cambiarTamano, copiarSistema, sistemaVacio } from "./logic/editar";
import { ejemploLibro, esperaCircular, inseguroLibro } from "./logic/escenarios";
import type { Analisis, Sistema, SolicitudEvaluada, Vector } from "./logic/tipos";

// Vistas
import { ConfiguracionSection, type EscenarioId } from "./components/datos/ConfiguracionSection";
import { MatricesSection } from "./components/datos/MatricesSection";
import { Footer } from "./components/layout/Footer";
import { Hero } from "./components/layout/Hero";
import { Sidebar, type SeccionId } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { ResultadoSection } from "./components/resultado/ResultadoSection";
import { SolicitudSection } from "./components/solicitud/SolicitudSection";

function App() {
  // ---------------- Estado ----------------
  const [sistema, setSistema] = useState<Sistema>(() => copiarSistema(ejemploLibro));
  const [escenarioActivo, setEscenarioActivo] = useState<EscenarioId | null>("libro");
  const [analisis, setAnalisis] = useState<Analisis | null>(null);
  const [solicitud, setSolicitud] = useState<SolicitudEvaluada | null>(null);
  const [seccionActiva, setSeccionActiva] = useState<SeccionId>("configuration");
  const [erroresArchivo, setErroresArchivo] = useState<string[]>([]);

  // ---------------- Valores calculados ----------------
  const need = calcularNeed(sistema.max, sistema.allocation);
  const errores = validarDatos(sistema);

  // Cada vez que cambian los datos, los resultados anteriores ya no sirven
  function actualizarSistema(nuevo: Sistema, escenario: EscenarioId | null) {
    setSistema(nuevo);
    setEscenarioActivo(escenario);
    setAnalisis(null);
    setSolicitud(null);
    setErroresArchivo([]);
  }

  // ---------------- Acciones ----------------
  function cargarEscenario(id: EscenarioId) {
    if (id === "libro") actualizarSistema(copiarSistema(ejemploLibro), id);
    else if (id === "inseguro") actualizarSistema(copiarSistema(inseguroLibro), id);
    else if (id === "circular") actualizarSistema(copiarSistema(esperaCircular), id);
    else actualizarSistema(sistemaVacio(3, 3), id);
  }

  function analizar() {
    if (errores.length > 0) return;
    const seguridad = algoritmoSeguridad(sistema);
    setAnalisis({
      seguridad: seguridad,
      secuencias: todasLasSecuencias(sistema),
      diagnostico: seguridad.seguro ? null : diagnosticar(sistema),
    });
    setSeccionActiva("results");
    setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 50);
  }

   function cargarArchivo(texto: string) {
    const resultado = leerArchivo(texto);
    if (resultado.sistema === null) {
      setErroresArchivo(resultado.errores); // el archivo tiene errores: los datos actuales no cambian
      return;
    }
    actualizarSistema(resultado.sistema, "archivo");
  }

  function evaluarSolicitud(proceso: number, request: Vector) {
    setSolicitud({ proceso, request, resultado: solicitarRecursos(sistema, proceso, request) });
  }

  function aplicarSolicitud() {
    if (solicitud?.resultado.sistemaNuevo) {
      actualizarSistema(solicitud.resultado.sistemaNuevo, null);
    }
  }

  // ---------------- Vista ----------------
  return (
    <div className="app-shell">
      <Topbar />
      <Sidebar activa={seccionActiva} onNavegar={setSeccionActiva} />

      <main>
        <Hero />

        <ConfiguracionSection
          n={sistema.n}
          m={sistema.m}
          escenarioActivo={escenarioActivo}
          onCambiarTamano={(n, m) => actualizarSistema(cambiarTamano(sistema, n, m), null)}
          onCargarEscenario={cargarEscenario}
          erroresArchivo={erroresArchivo}
          onCargarArchivo={cargarArchivo}
        />

        <MatricesSection
          sistema={sistema}
          need={need}
          errores={errores}
          onCambiarCelda={(matriz, i, j, valor) => actualizarSistema(cambiarCelda(sistema, matriz, i, j, valor), null)}
          onAnalizar={analizar}
        />

        <ResultadoSection analisis={analisis} onRecalcular={analizar} />

        <SolicitudSection
          key={`${sistema.n}-${sistema.m}`}
          sistema={sistema}
          need={need}
          datosValidos={errores.length === 0}
          evaluada={solicitud}
          onEvaluar={evaluarSolicitud}
          onAplicar={aplicarSolicitud}
        />
      </main>

      <Footer />
    </div>
  );
}

export default App;