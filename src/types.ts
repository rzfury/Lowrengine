export type C2D = CanvasRenderingContext2D;

export type Point = {
  x: number,
  y: number
};

export type Rect = {
  top: number,
  bottom: number,
  left: number,
  right: number
};

export type KeyEventHandler = (e: KeyboardEvent) => void;
