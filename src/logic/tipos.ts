export type Vector = number[];

export type Matriz = number[][];

export type Sistema = {
  n: number; // número de procesos
  m: number; // número de tipos de recurso
  available: Vector; // recursos libres
  max: Matriz; // demanda máxima de cada proceso
  allocation: Matriz; 
};

export type ErrorValidacion = {
  matriz: "available" | "max" | "allocation"; // ubicacion del error
  proceso: number; // fila del error 
  recurso: number; // columna del error
  mensaje: string; // explicación usuario
};

export type PasoSeguridad = {
  iteracion: number; // número de iteración
  proceso: number; // proceso evaluado (0 = P0, 1 = P1, ...)
  need: Vector; // Need del proceso
  workAntes: Vector; // Work en el momento de evaluarlo
  puedeTerminar: boolean; // ¿Need <= Work?
  workDespues: Vector; // Work después (igual a workAntes si no pudo terminar)
  finish: boolean[]; // cómo quedó el vector Finish después de este paso
};

/** Resultado completo del algoritmo de seguridad. */
export type ResultadoSeguridad = {
  seguro: boolean; // true = estado seguro
  secuencia: number[]; // orden en que terminaron los procesos
  bloqueados: number[]; // procesos que no pudieron terminar
  workFinal: Vector; // Work al terminar el algoritmo
  pasos: PasoSeguridad[]; // detalle paso a paso
};

export type ResultadoSolicitud = {
  estado: "concedida" | "rechazada" | "esperar" | "error";
  mensaje: string; // explicación para el usuario
  sistemaNuevo: Sistema | null; // cómo quedaría el sistema si se concede
  seguridad: ResultadoSeguridad | null; // algoritmo de seguridad sobre ese estado
};

/** Lo que le falta a un proceso bloqueado para poder terminar. */
export type Faltante = {
  proceso: number;
  need: Vector; // lo que necesita
  falta: Vector; // cuánto le falta de cada recurso
};

/** Diagnóstico de un estado inseguro. */
export type Diagnostico = {
  faltantes: Faltante[]; // un elemento por cada proceso bloqueado
  recursosExtra: Vector; // cuánto habría que agregar a Available
  secuenciaConExtra: number[]; // secuencia segura si se agregaran esos recursos
};