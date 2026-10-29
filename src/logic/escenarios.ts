import type { Sistema } from "./tipos";

//ejemplo estado seguro 
export const ejemploLibro: Sistema = {
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

//estado inseguro 
export const inseguroLibro: Sistema = {
  n: 5,
  m: 3,
  available: [2, 1, 0],
  max: [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3],
  ],
  allocation: [
    [0, 3, 0],
    [3, 0, 2],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2],
  ],
};

export const esperaCircular: Sistema = {
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