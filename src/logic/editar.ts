import type { Matriz, Sistema, Vector } from "./tipos";

function matrizEnCeros(filas: number, columnas: number): Matriz {
  const matriz: Matriz = [];
  for (let i = 0; i < filas; i++) {
    const fila: Vector = [];
    for (let j = 0; j < columnas; j++) {
      fila.push(0);
    }
    matriz.push(fila);
  }
  return matriz;
}

export function sistemaVacio(n: number, m: number): Sistema {
  return {
    n: n,
    m: m,
    available: matrizEnCeros(1, m)[0],
    max: matrizEnCeros(n, m),
    allocation: matrizEnCeros(n, m),
  };
}

export function copiarSistema(sistema: Sistema): Sistema {
  const copia = sistemaVacio(sistema.n, sistema.m);
  for (let j = 0; j < sistema.m; j++) {
    copia.available[j] = sistema.available[j];
  }
  for (let i = 0; i < sistema.n; i++) {
    for (let j = 0; j < sistema.m; j++) {
      copia.max[i][j] = sistema.max[i][j];
      copia.allocation[i][j] = sistema.allocation[i][j];
    }
  }
  return copia;
}

export function cambiarTamano(sistema: Sistema, n: number, m: number): Sistema {
  const nuevo = sistemaVacio(n, m);
  for (let j = 0; j < m; j++) {
    if (j < sistema.m) nuevo.available[j] = sistema.available[j];
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (i < sistema.n && j < sistema.m) {
        nuevo.max[i][j] = sistema.max[i][j];
        nuevo.allocation[i][j] = sistema.allocation[i][j];
      }
    }
  }
  return nuevo;
}

export function cambiarCelda(
  sistema: Sistema,
  matriz: "available" | "max" | "allocation",
  proceso: number,
  recurso: number,
  valor: number,
): Sistema {
  const nuevo = copiarSistema(sistema);
  if (matriz === "available") {
    nuevo.available[recurso] = valor;
  } else if (matriz === "max") {
    nuevo.max[proceso][recurso] = valor;
  } else {
    nuevo.allocation[proceso][recurso] = valor;
  }
  return nuevo;
}