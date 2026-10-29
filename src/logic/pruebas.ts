import type { Sistema } from "./tipos";
import type { ResultadoSeguridad } from "./tipos";
import {
  algoritmoSeguridad,
  calcularNeed,
  diagnosticar,
  esMenorOIgual,
  solicitarRecursos,
  sumarVectores,
  todasLasSecuencias,
  validarDatos,
} from "./banquero";

// Ejemplo
const ejemplo: Sistema = {
  n: 5,
  m: 3,
  available: [3, 3, 2],
  max: [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3],
  ],
  allocation: [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2],
  ],
};

console.log("Prueba 1: calcularNeed");
console.table(calcularNeed(ejemplo.max, ejemplo.allocation));

console.log("Prueba 2: esMenorOIgual");
console.log("Need P1 [1,2,2] <= Work [3,3,2] ?", esMenorOIgual([1, 2, 2], [3, 3, 2])); // true
console.log("Need P0 [7,4,3] <= Work [3,3,2] ?", esMenorOIgual([7, 4, 3], [3, 3, 2])); // false
console.log("Iguales [3,3,2] <= [3,3,2] ?", esMenorOIgual([3, 3, 2], [3, 3, 2])); // true

console.log("Prueba 3: sumarVectores");
console.log("Work [3,3,2] + Allocation P1 [2,0,0] =", sumarVectores([3, 3, 2], [2, 0, 0])); // [5, 3, 2]

console.log("Prueba 4: validarDatos");

// a) El ejemplo no tiene errores
console.log("Ejemplo correcto:", validarDatos(ejemplo)); // []

// b) Un ejemplo con errores 
const conErrores: Sistema = {
  n: 2,
  m: 2,
  available: [1, -2], // B es negativo
  max: [
    [3, 2],
    [2, 2.5], // decimal
  ],
  allocation: [
    [5, 1], // 5 es mayor que su Max (3)
    [NaN, 0], // vacío
  ],
};
const errores = validarDatos(conErrores);
console.log(`Se encontraron ${errores.length} errores:`); // 4
for (const error of errores) {
  console.log("-", error.mensaje);
}

function mostrarResultado(resultado: ResultadoSeguridad) {
  const filas = [];
  for (const paso of resultado.pasos) {
    filas.push({
      Iteración: paso.iteracion,
      Proceso: "P" + paso.proceso,
      Need: paso.need.join(", "),
      Work: paso.workAntes.join(", "),
      "¿Need <= Work?": paso.puedeTerminar ? "Sí" : "No",
      "Work después": paso.workDespues.join(", "),
    });
  }
  console.table(filas);

  if (resultado.seguro) {
    console.log("ESTADO SEGURO");
    console.log("Secuencia segura:", resultado.secuencia.map((i) => "P" + i).join(" → "));
  } else {
    console.log("ESTADO INSEGURO");
    console.log("Bloqueados:", resultado.bloqueados.map((i) => "P" + i).join(", "));
  }
  console.log("Work final:", resultado.workFinal);
}

console.log("Prueba 5: algoritmoSeguridad con el ejemplo del libro");
mostrarResultado(algoritmoSeguridad(ejemplo));

console.log("Prueba 6: algoritmoSeguridad con un estado inseguro");
const inseguro: Sistema = {
  n: 5,
  m: 3,
  available: [1, 1, 1],
  max: [
    [3, 2, 2],
    [3, 2, 1],
    [2, 2, 4],
    [6, 1, 2],
    [2, 3, 5],
  ],
  allocation: [
    [1, 0, 1],
    [2, 1, 0],
    [0, 1, 2],
    [1, 1, 1],
    [1, 0, 0],
  ],
};
mostrarResultado(algoritmoSeguridad(inseguro));

console.log("Prueba 7: solicitarRecursos (ejemplos del libro)");

// a) P1 pide [1, 0, 2] → debe concederse
const solicitud1 = solicitarRecursos(ejemplo, 1, [1, 0, 2]);
console.log("P1 pide [1,0,2]:", solicitud1.estado, "-", solicitud1.mensaje);
console.log("   Available queda en:", solicitud1.sistemaNuevo?.available);

// Las siguientes se hacen DESPUÉS de conceder la de P1
if (solicitud1.sistemaNuevo) {
  const despues = solicitud1.sistemaNuevo;

  // b) P4 pide [3, 3, 0] → no hay recursos libres, debe esperar
  const solicitud2 = solicitarRecursos(despues, 4, [3, 3, 0]);
  console.log("P4 pide [3,3,0]:", solicitud2.estado, "-", solicitud2.mensaje);

  // c) P0 pide [0, 2, 0] → hay recursos, pero el estado sería inseguro
  const solicitud3 = solicitarRecursos(despues, 0, [0, 2, 0]);
  console.log("P0 pide [0,2,0]:", solicitud3.estado, "-", solicitud3.mensaje);
}

// d) P3 pide [1, 0, 0] → su Need es [0, 1, 1], pide más de lo que declaró
const solicitud4 = solicitarRecursos(ejemplo, 3, [1, 0, 0]);
console.log("P3 pide [1,0,0]:", solicitud4.estado, "-", solicitud4.mensaje);

// El sistema original no debe haber cambiado
console.log("Available original sigue igual:", ejemplo.available); // [3, 3, 2]

console.log("Prueba 8: todasLasSecuencias");
const secuencias = todasLasSecuencias(ejemplo);
console.log(`El ejemplo del libro tiene ${secuencias.length} secuencias seguras:`); // 16
for (const secuencia of secuencias) {
  console.log("  " + secuencia.map((i) => "P" + i).join(" → "));
}
console.log("El estado inseguro tiene:", todasLasSecuencias(inseguro).length, "secuencias"); // 0

console.log("Prueba 9: diagnosticar");
const diagnostico = diagnosticar(inseguro);
for (const f of diagnostico.faltantes) {
  console.log(`P${f.proceso} necesita [${f.need.join(", ")}] y le falta [${f.falta.join(", ")}]`);
}
console.log("Recursos extra para que sea seguro:", diagnostico.recursosExtra); // [1, 0, 0]
console.log("Secuencia con esos recursos:", diagnostico.secuenciaConExtra.map((i) => "P" + i).join(" → "));