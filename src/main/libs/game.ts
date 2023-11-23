import { Point } from "../../types";
import { KeyHandler } from "./keyhandler";
import { COLOR, GAME_DIMENSION, getElementById } from "./utils";

class Game {
  public canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;
  public input: KeyHandler;

  public invert: boolean = false;

  public Initialize: (game: Game) => void = () => { };
  public Update: (game: Game) => void = () => { };
  public Renderer: (game: Game) => void = () => { };

  public static Instance: Game;

  constructor() {
    this.canvas = getElementById('canvas');
    this.context = this.canvas.getContext('2d')!;

    this.input = new KeyHandler();
  }

  public Init = () => {
    window.addEventListener('resize', Game.Instance.onWindowResize);

    this.Initialize(this);
    this._Renderer();
    this._Updater();
  }

  public Unload = () => {
    window.removeEventListener('resize', Game.Instance.onWindowResize);
  }

  public _Updater = () => {
    this.Update(this);

    setTimeout(this._Updater, 1);
  }

  public _Renderer = () => {
    this.ClearCanvas();
    this.FillCanvas(COLOR.Light);

    this.Renderer(this);

    window.requestAnimationFrame(Game.Instance._Renderer);
  }

  public DrawPixel(pos: Point, colorType: typeof COLOR[keyof typeof COLOR]) {
    const fixedX = Math.floor(pos.x);
    const fixedY = Math.floor(pos.y);

    let color = this.ProcessColor(colorType);
    let pixel = this.GetPixelSize();

    this.context.fillStyle = color;
    this.context.fillRect(pixel.w * fixedX, pixel.h * fixedY, pixel.w, pixel.h);
  }
  
  public DrawDMap(map: number[][], pos: Point, offset?: Point) {
    const _offset = offset ?? { x: 0, y: 0 };
    map.forEach((row, iy) => {
      row.forEach((v, ix) => {
        const drawPos: Point = {
          x: pos.x + ix + _offset.x,
          y: pos.y + iy + _offset.y,
        };
        this.DrawPixel(drawPos, v === 0 ? COLOR.Dark : COLOR.Light);
      });
  });
  }

  public FillCanvas = (colorType: typeof COLOR[keyof typeof COLOR]) => {
    const color = this.ProcessColor(colorType);
    const { w, h } = this.GetCanvasSize();

    this.context.fillStyle = color;
    this.context.fillRect(0, 0, w, h);
  }

  public ClearCanvas = () => {
    const { w, h } = this.GetCanvasSize();
    this.context.clearRect(0, 0, w, h);
  }

  public ProcessColor = (colorType: typeof COLOR[keyof typeof COLOR]) => {
    return this.invert
      ? (colorType === COLOR.Dark ? COLOR.Light : COLOR.Dark)
      : colorType;
  }

  public GetPixelSize = () => {
    let dim = this.GetCanvasSize();
    return {
      w: dim.w / GAME_DIMENSION.x,
      h: dim.h / GAME_DIMENSION.y,
    }
  }

  public GetCanvasSize = () => {
    return {
      w: this.canvas.clientWidth,
      h: this.canvas.clientHeight
    }
  }

  public onWindowResize = (event: UIEvent) => {

  }
}

export default Game;
