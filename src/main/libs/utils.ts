export const COLOR = {
  Dark: '#43523d',
  Light: '#c7f0d8',
} as const;

export function cloneObject<T = object>(a: T): T {
  return Object.assign({}, a);
}

export function compareObject(a: object, b: object) {
  return JSON.stringify(a) === JSON.stringify(b);
}
