import { Draw } from "./draw";

declare global {
  interface Window {
    _3310F_GAME: Game;
  }
}

class Game {
  public canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;

  public static Instance: Game;

  public static get Canvas() {
    return Game.Instance.canvas;
  }

  public static get Context() {
    return Game.Instance.context;
  }

  public static CreateGame(width: number = 600, height: number = 400) {
    Game.Instance = new Game(width, height);
  }

  constructor(width: number, height: number) {
    if(width == null || height == null) {
      throw 'Width and Height must be specified';
    }

    const appElement = document.getElementById('app')!;
    const canvas = document.createElement('canvas');

    this.canvas = canvas;
    canvas.width = width;
    canvas.height = height;

    this.context = canvas.getContext('2d')!;

    appElement.append(canvas);

    this.Init();
  }

  public Init = () => {
    window.addEventListener('resize', this.onWindowResize);

    this.Renderer();
    setInterval(() => {

    }, 1);
  }

  public Unload = () => {
    window.removeEventListener('resize', this.onWindowResize);
  }

  public Updater = () => {

  }

  public Renderer = () => {
    Draw.Clear(this.context);
    Draw.FillCanvas(this.context, 'black');

    window.requestAnimationFrame(this.Renderer);
  }

  private onWindowResize = (event: UIEvent) => {

  }
}

export default Game;
