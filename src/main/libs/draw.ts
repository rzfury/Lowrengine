import Game from "./game";

type C2D = CanvasRenderingContext2D;

class Draw {
  public static DrawPixel = (context: C2D) => {
    
  }

  public static FillCanvas = (context: C2D, fillColor: string) => {
    context.fillStyle = fillColor;
    context.fillRect(0, 0, Game.Canvas.width, Game.Canvas.height);
  }

  public static Clear = (context: C2D) => {
    context.clearRect(0, 0, Game.Canvas.width, Game.Canvas.height);
  }
}

export { Draw };
