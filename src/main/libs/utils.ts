import { Point } from "../../types";

export const GAME_DIMENSION: Point = {
  x: 84,
  y: 48
} as const;

export const COLOR = {
  Dark: '#43523d',
  Light: '#c7f0d8',
} as const;

export const DRAWMAP = {
  numbers: [
    [[0, 0, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 0, 0]],
    [[1, 0, 1], [0, 0, 1], [1, 0, 1], [1, 0, 1], [0, 0, 0]],
    [[0, 0, 0], [1, 1, 0], [0, 0, 0], [0, 1, 1], [0, 0, 0]],
    [[0, 0, 0], [1, 1, 0], [0, 0, 0], [1, 1, 0], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 0], [0, 0, 0], [1, 1, 0], [1, 1, 0]],
    [[0, 0, 0], [0, 1, 1], [0, 0, 0], [1, 1, 0], [0, 0, 0]],
    [[0, 0, 0], [0, 1, 1], [0, 0, 0], [0, 1, 0], [0, 0, 0]],
    [[0, 0, 0], [1, 1, 0], [1, 1, 0], [1, 1, 0], [1, 1, 0]],
    [[0, 0, 0], [0, 1, 0], [0, 0, 0], [0, 1, 0], [0, 0, 0]],
    [[0, 0, 0], [0, 1, 0], [0, 0, 0], [1, 1, 0], [0, 0, 0]]
  ],
} as const;

export function getElementById<T>(id: string): T {
  return document.getElementById(id) as T;
}

export function cloneObject<T = object>(a: T): T {
  return Object.assign({}, a);
}

export function compareObject(a: object, b: object) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function cast<T>(a: unknown) {
  return a as unknown as T;
}
