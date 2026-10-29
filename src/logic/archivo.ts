import type { Matriz, Sistema, Vector } from "./tipos";
 
/** Lo que devuelve la lectura del archivo: el sistema leído o la lista de errores. */
export type ResultadoArchivo = {
  sistema: Sistema | null;
  errores: string[];
};
 
/** Convierte una línea como "7 5 3" o "7, 5, 3" en el vector [7, 5, 3]. */
function leerNumeros(linea: string): Vector {
  const partes = linea.split(/[\s,]+/); // separa por espacios, tabulaciones o comas
  const numeros: Vector = [];
  for (const parte of partes) {
    if (parte !== "") {
      numeros.push(Number(parte));
    }
  }
  return numeros;
}
 
export function leerArchivo(texto: string): ResultadoArchivo {
  const errores: string[] = [];
  let available: Vector = [];
  const max: Matriz = [];
  const allocation: Matriz = [];
  let seccion = ""; // sección en la que vamos leyendo
 
  // ---- Paso 1: leer el archivo línea por línea ----
  const lineas = texto.split("\n");
 
  for (let k = 0; k < lineas.length; k++) {
    const linea = lineas[k].trim(); // quita espacios y saltos de línea sobrantes
    const numeroLinea = k + 1;
 
    // Línea vacía o comentario: se ignora
    if (linea === "" || linea.startsWith("#")) {
      continue;
    }
 
    // ¿Es el título de una sección?
    const titulo = linea.toUpperCase();
    if (titulo === "AVAILABLE" || titulo === "MAX" || titulo === "ALLOCATION") {
      seccion = titulo;
      continue;
    }
 
    // Números antes de cualquier título
    if (seccion === "") {
      errores.push(`Línea ${numeroLinea}: los números deben ir debajo de AVAILABLE, MAX o ALLOCATION.`);
      continue;
    }
 
    // Revisar que la línea solo tenga números
    const numeros = leerNumeros(linea);
    let todosSonNumeros = true;
    for (const valor of numeros) {
      if (Number.isNaN(valor)) {
        todosSonNumeros = false;
      }
    }
    if (!todosSonNumeros) {
      errores.push(`Línea ${numeroLinea}: "${linea}" tiene algo que no es un número.`);
      continue;
    }
 
    // Guardar los números en su sección
    if (seccion === "AVAILABLE") {
      if (available.length > 0) {
        errores.push(`Línea ${numeroLinea}: AVAILABLE debe tener una sola línea.`);
      } else {
        available = numeros;
      }
    } else if (seccion === "MAX") {
      max.push(numeros);
    } else {
      allocation.push(numeros);
    }
  }
 
  // ---- Paso 2: revisar que estén las tres secciones ----
  if (available.length === 0) errores.push("Falta la sección AVAILABLE.");
  if (max.length === 0) errores.push("Falta la sección MAX.");
  if (allocation.length === 0) errores.push("Falta la sección ALLOCATION.");
 
  if (errores.length > 0) {
    return { sistema: null, errores: errores };
  }
 
  // ---- Paso 3: revisar los tamaños ----
  const n = max.length; // procesos = filas de MAX
  const m = available.length; // recursos = valores de AVAILABLE
 
  // Mismos límites que en la sección 01 (Define el escenario)
  if (n < 2 || n > 8) {
    errores.push(`Debe haber entre 2 y 8 procesos (MAX tiene ${n} filas).`);
  }
  if (m < 1 || m > 5) {
    errores.push(`Debe haber entre 1 y 5 recursos (AVAILABLE tiene ${m} valores).`);
  }
  if (allocation.length !== n) {
    errores.push(`MAX tiene ${n} filas pero ALLOCATION tiene ${allocation.length}.`);
  }
 
  for (let i = 0; i < max.length; i++) {
    if (max[i].length !== m) {
      errores.push(`MAX, fila de P${i}: tiene ${max[i].length} valores y deben ser ${m}.`);
    }
  }
  for (let i = 0; i < allocation.length; i++) {
    if (allocation[i].length !== m) {
      errores.push(`ALLOCATION, fila de P${i}: tiene ${allocation[i].length} valores y deben ser ${m}.`);
    }
  }
 
  if (errores.length > 0) {
    return { sistema: null, errores: errores };
  }
 
  // ---- Paso 4: todo bien, armar el sistema ----
  return {
    sistema: { n: n, m: m, available: available, max: max, allocation: allocation },
    errores: [],
  };
}
 