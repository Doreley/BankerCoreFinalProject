import type {
  Diagnostico,
  ErrorValidacion,
  Faltante,
  Matriz,
  PasoSeguridad,
  ResultadoSeguridad,
  ResultadoSolicitud,
  Sistema,
  Vector,
} from "./tipos";

export function calcularNeed(max: Matriz, allocation: Matriz): Matriz {
  const need: Matriz = [];

  for (let i = 0; i < max.length; i++) {
    const fila: number[] = [];

    for (let j = 0; j < max[i].length; j++) {
      fila.push(max[i][j] - allocation[i][j]);
    }

    need.push(fila);
  }

  return need;
}

export function esMenorOIgual(a: Vector, b: Vector): boolean {
  for (let j = 0; j < a.length; j++) {
    if (a[j] > b[j]) {
      return false; 
    }
  }
  return true; 
}

export function sumarVectores(a: Vector, b: Vector): Vector {
  const resultado: Vector = [];
  for (let j = 0; j < a.length; j++) {
    resultado.push(a[j] + b[j]);
  }
  return resultado;
}

//Nombre del recurso según su posición
export function nombreRecurso(j: number): string {
  return String.fromCharCode(65 + j);
}

//Revisa que un valor sea un número entero mayor o igual a 0
function esEnteroValido(valor: number): boolean {
  return Number.isInteger(valor) && valor >= 0;
}

//Explica por qué un valor no es válido. 
function describirProblema(valor: number): string {
  if (Number.isNaN(valor)) return "está vacío";
  if (valor < 0) return "es negativo";
  return "no es un número entero";
}

export function validarDatos(sistema: Sistema): ErrorValidacion[] {
  const errores: ErrorValidacion[] = [];

  //Revisar el vector Available
  for (let j = 0; j < sistema.m; j++) {
    const valor = sistema.available[j];
    if (!esEnteroValido(valor)) {
      errores.push({
        matriz: "available",
        proceso: -1,
        recurso: j,
        mensaje: `Available de ${nombreRecurso(j)} ${describirProblema(valor)}.`,
      });
    }
  }

  //Revisar Max y Allocation 
  for (let i = 0; i < sistema.n; i++) {
    for (let j = 0; j < sistema.m; j++) {
      const max = sistema.max[i][j];
      const asignado = sistema.allocation[i][j];

      if (!esEnteroValido(max)) {
        errores.push({
          matriz: "max",
          proceso: i,
          recurso: j,
          mensaje: `Max de P${i} en ${nombreRecurso(j)} ${describirProblema(max)}.`,
        });
      }

      if (!esEnteroValido(asignado)) {
        errores.push({
          matriz: "allocation",
          proceso: i,
          recurso: j,
          mensaje: `Allocation de P${i} en ${nombreRecurso(j)} ${describirProblema(asignado)}.`,
        });
      }

      //Allocation no puede superar a Max (solo si los dos valores son válidos)
      if (esEnteroValido(max) && esEnteroValido(asignado) && asignado > max) {
        errores.push({
          matriz: "allocation",
          proceso: i,
          recurso: j,
          mensaje: `P${i} tiene asignado ${asignado} de ${nombreRecurso(j)}, pero su máximo es ${max}.`,
        });
      }
    }
  }

  return errores;
}

export function algoritmoSeguridad(sistema: Sistema): ResultadoSeguridad {
  const need = calcularNeed(sistema.max, sistema.allocation);

  // ---- Paso 1: preparar Work y Finish ----
  let work: Vector = sistema.available.slice(); // copia de Available
  const finish: boolean[] = [];
  for (let i = 0; i < sistema.n; i++) {
    finish.push(false);
  }

  const secuencia: number[] = [];
  const pasos: PasoSeguridad[] = [];
  let iteracion = 1;
  let encontrado = true;

  // Se repite mientras falten procesos y en la vuelta anterior alguno haya terminado
  while (encontrado && secuencia.length < sistema.n) {
    encontrado = false;

    // ---- Paso 2: buscar un proceso que pueda terminar, empezando en P0 
    for (let i = 0; i < sistema.n; i++) {
      if (finish[i]) {
        continue; // este proceso ya terminó, pasamos al siguiente
      }

      const workAntes = work;
      const puedeTerminar = esMenorOIgual(need[i], work);

      // ---- Paso 3: el proceso termina y devuelve lo que tenía 
      if (puedeTerminar) {
        work = sumarVectores(work, sistema.allocation[i]);
        finish[i] = true;
        secuencia.push(i);
      }

      // Guardamos lo que pasó para mostrarlo en pantalla
      pasos.push({
        iteracion: iteracion,
        proceso: i,
        need: need[i],
        workAntes: workAntes,
        puedeTerminar: puedeTerminar,
        workDespues: work,
        finish: finish.slice(), // copia de cómo quedó Finish
      });

      if (puedeTerminar) {
        encontrado = true;
        break; // volvemos a buscar desde P0
      }
    }

    iteracion++;
  }

  // ---- Paso 4: ¿todos terminaron? ----
  const bloqueados: number[] = [];
  for (let i = 0; i < sistema.n; i++) {
    if (!finish[i]) {
      bloqueados.push(i);
    }
  }

  return {
    seguro: bloqueados.length === 0,
    secuencia: secuencia,
    bloqueados: bloqueados,
    workFinal: work,
    pasos: pasos,
  };
}

// Resta dos vectores posición por posición
export function restarVectores(a: Vector, b: Vector): Vector {
  const resultado: Vector = [];
  for (let j = 0; j < a.length; j++) {
    resultado.push(a[j] - b[j]);
  }
  return resultado;
}

/** Copia una matriz fila por fila, para no modificar la original. */
function copiarMatriz(matriz: Matriz): Matriz {
  const copia: Matriz = [];
  for (let i = 0; i < matriz.length; i++) {
    copia.push(matriz[i].slice());
  }
  return copia;
}

export function solicitarRecursos(
  sistema: Sistema,
  proceso: number,
  request: Vector,
): ResultadoSolicitud {
  const nombre = "P" + proceso;
  const need = calcularNeed(sistema.max, sistema.allocation);

  // Revisar que la solicitud tenga números válidos
  for (let j = 0; j < sistema.m; j++) {
    if (!esEnteroValido(request[j])) {
      return {
        estado: "error",
        mensaje: `La solicitud de ${nombreRecurso(j)} ${describirProblema(request[j])}.`,
        sistemaNuevo: null,
        seguridad: null,
      };
    }
  }

  // ---- Paso 1: Request <= Need[i] ----
  if (!esMenorOIgual(request, need[proceso])) {
    return {
      estado: "error",
      mensaje: `${nombre} pide más de lo que declaró como máximo (su Need es [${need[proceso].join(", ")}]).`,
      sistemaNuevo: null,
      seguridad: null,
    };
  }

  // ---- Paso 2: Request <= Available ----
  if (!esMenorOIgual(request, sistema.available)) {
    return {
      estado: "esperar",
      mensaje: `No hay suficientes recursos libres (Available es [${sistema.available.join(", ")}]). ${nombre} debe esperar.`,
      sistemaNuevo: null,
      seguridad: null,
    };
  }

  // ---- Paso 3: asignación provisional (sobre una copia) ----
  const provisional: Sistema = {
    n: sistema.n,
    m: sistema.m,
    available: restarVectores(sistema.available, request),
    max: copiarMatriz(sistema.max),
    allocation: copiarMatriz(sistema.allocation),
  };
  provisional.allocation[proceso] = sumarVectores(provisional.allocation[proceso], request);

  // ---- Paso 4: ¿el estado provisional es seguro? ----
  const seguridad = algoritmoSeguridad(provisional);

  if (seguridad.seguro) {
    return {
      estado: "concedida",
      mensaje: `Solicitud concedida. El sistema sigue en estado seguro.`,
      sistemaNuevo: provisional,
      seguridad: seguridad,
    };
  }

  return {
    estado: "rechazada",
    mensaje: `Solicitud rechazada: el sistema quedaría en estado inseguro. ${nombre} debe esperar.`,
    sistemaNuevo: provisional,
    seguridad: seguridad,
  };
}

/**
 * EXTRA 1: TODAS LAS SECUENCIAS SEGURAS
 * El algoritmo de seguridad encuentra UNA secuencia, pero puede haber varias.
 * Esta función las busca todas probando cada camino posible (backtracking):
 *   - Elige un proceso que pueda terminar con el Work actual.
 *   - Simula que termina y sigue buscando con el Work nuevo.
 *   - Al regresar, deshace la elección y prueba con el siguiente proceso.
 */
export function todasLasSecuencias(sistema: Sistema): number[][] {
  const need = calcularNeed(sistema.max, sistema.allocation);
  const secuencias: number[][] = [];
  const actual: number[] = []; // secuencia que se está armando
  const finish: boolean[] = [];
  for (let i = 0; i < sistema.n; i++) {
    finish.push(false);
  }

  function buscar(work: Vector) {
    // Si ya están todos los procesos, encontramos una secuencia completa
    if (actual.length === sistema.n) {
      secuencias.push(actual.slice());
      return;
    }

    for (let i = 0; i < sistema.n; i++) {
      if (!finish[i] && esMenorOIgual(need[i], work)) {
        // Probar: Pi termina
        finish[i] = true;
        actual.push(i);

        buscar(sumarVectores(work, sistema.allocation[i]));

        // Deshacer para probar con otro proceso
        finish[i] = false;
        actual.pop();
      }
    }
  }

  buscar(sistema.available.slice());
  return secuencias;
}

/**
 * EXTRA 2: DIAGNÓSTICO DE UN ESTADO INSEGURO
 * Explica por qué el estado es inseguro y cómo se podría arreglar:
 *   1. Para cada proceso bloqueado calcula cuánto le falta (Need - Work).
 *   2. Calcula cuántos recursos habría que agregar a Available para que el
 *      sistema sea seguro: le da lo que falta al proceso bloqueado al que
 *      le falta menos, vuelve a probar, y repite hasta que sea seguro.
 */
export function diagnosticar(sistema: Sistema): Diagnostico {
  const need = calcularNeed(sistema.max, sistema.allocation);
  let resultado = algoritmoSeguridad(sistema);

  // 1. Lo que le falta a cada proceso bloqueado
  const faltantes: Faltante[] = [];
  for (const proceso of resultado.bloqueados) {
    faltantes.push({
      proceso: proceso,
      need: need[proceso],
      falta: calcularFaltante(need[proceso], resultado.workFinal),
    });
  }

  // 2. Recursos extra necesarios para que el sistema sea seguro
  let recursosExtra: Vector = [];
  for (let j = 0; j < sistema.m; j++) {
    recursosExtra.push(0);
  }

  while (!resultado.seguro) {
    // Buscar el proceso bloqueado al que le falta menos en total
    let menorFalta: Vector = [];
    let menorTotal = Infinity;
    for (const proceso of resultado.bloqueados) {
      const falta = calcularFaltante(need[proceso], resultado.workFinal);
      let total = 0;
      for (let j = 0; j < falta.length; j++) {
        total += falta[j];
      }
      if (total < menorTotal) {
        menorTotal = total;
        menorFalta = falta;
      }
    }

    // Agregar lo que le falta y volver a probar
    recursosExtra = sumarVectores(recursosExtra, menorFalta);
    resultado = algoritmoSeguridad({
      n: sistema.n,
      m: sistema.m,
      available: sumarVectores(sistema.available, recursosExtra),
      max: sistema.max,
      allocation: sistema.allocation,
    });
  }

  return {
    faltantes: faltantes,
    recursosExtra: recursosExtra,
    secuenciaConExtra: resultado.secuencia,
  };
}

// Cuánto le falta a un proceso
function calcularFaltante(need: Vector, work: Vector): Vector {
  const falta: Vector = [];
  for (let j = 0; j < need.length; j++) {
    if (need[j] > work[j]) {
      falta.push(need[j] - work[j]);
    } else {
      falta.push(0);
    }
  }
  return falta;
}