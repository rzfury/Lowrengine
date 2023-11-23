import { COLOR, compareObject, getElementById } from "../../main/libs/utils";
import { Point, Rect } from "../../types";
import { KeyHandler } from "./keyhandler";

type ColorType = typeof COLOR[keyof typeof COLOR];

class DrawMap {
  public canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;
  public optColor: HTMLSpanElement;
  public optAutoFill: HTMLSpanElement;
  public optName: HTMLInputElement;
  public detailProps: HTMLDivElement;
  public optNormal: HTMLDivElement;
  public optMulti: HTMLDivElement;
  public optMultiCName: HTMLInputElement;
  public optDrawRect: HTMLInputElement;

  public drawBorder: boolean = false;
  public borderRect: Rect = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  };

  public isDrawingRect: boolean = false;
  public drawRect: boolean = false;
  public readyToDraw: boolean = false;
  public point1: Point = { x: 0, y: 0 };
  public point2: Point = { x: 0, y: 0 };

  public crosshairPos: Point = { x: 0, y: 0 };
  public drawCoords: Point[] = [];
  public colorCoords: number[] = [];

  public mouseClicked: boolean = false;
  public mouseMoveEvent: MouseEvent | null = null;
  public mouseClickEvent: MouseEvent | null = null;

  public currentColor: ColorType = COLOR.Dark;
  public autoFillColor: ColorType = COLOR.Light;
  public autoFillColorId: number = 1;

  public multiMode: boolean = false;
  public tempObjects: object = {};

  public static Keyboard: KeyHandler;
  public static Instance: DrawMap;

  public static get Canvas() {
    return DrawMap.Instance.canvas;
  }

  public static get Context() {
    return DrawMap.Instance.context;
  }

  constructor() {
    this.canvas = getElementById('drawmap-canvas');
    this.context = this.canvas.getContext('2d')!;
    this.optColor = getElementById('opt-color-draw');
    this.optAutoFill = getElementById('opt-color-autofill');
    this.optName = getElementById('opt-name');
    this.optNormal = getElementById('opt-normal-mode');
    this.optMulti = getElementById('opt-multi-mode');
    this.optMultiCName = getElementById('opt-drawmap-name');
    this.optDrawRect = getElementById('draw-rect');
    this.detailProps = getElementById('detail-props');

    this.canvas.addEventListener('mousemove', (e) => this.ControlMouseCrosshair(e), false);
    this.canvas.addEventListener('mousedown', (e) => {
      this.mouseClicked = true;
      this.mouseClickEvent = e;
      if (this.isDrawingRect) {
        this.borderRect = { top: 0, left: 0, right: 0, bottom: 0 };
        this.drawRect = true;
        this.readyToDraw = true;
      } else {
        this.AddPixel(e);
        this.RemovePixel(e);
      }
    }, false);
    this.canvas.addEventListener('mouseup', (e) => {
      this.mouseClicked = false;
      this.mouseClickEvent = e;
      this.drawRect = false;
      this.FillDrawingRect();
    }, false);
    this.canvas.addEventListener('contextmenu', (e) => { e.preventDefault() }, false);
    this.canvas.oncontextmenu = this.RemovePixel;

    DrawMap.Keyboard = new KeyHandler(this, this.ManualKeyDownHandler);

    this.Render();
    this.Update();
  }

  public Render = () => {
    this.context.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

    this.DrawDrawingCoords();
    this.DrawBorderRectangle();
    this.DrawMouseCrossHair();

    requestAnimationFrame(this.Render);
  }

  public Update = () => {
    this.optColor.style.backgroundColor = this.currentColor;
    this.optAutoFill.style.backgroundColor = this.autoFillColor;

    const borderWidth = this.borderRect.right - this.borderRect.left + 1;
    const borderHeight = this.borderRect.bottom - this.borderRect.top + 1;
    const detailBorderRect = ` Rect:[ T:${this.borderRect.top} B:${this.borderRect.bottom} L:${this.borderRect.left} R:${this.borderRect.right} | W:${borderWidth} H:${borderHeight} ]`;
    const detailBorderAll = ` Draw:[ T:${this.borderRect.top} B:${this.borderRect.bottom} L:${this.borderRect.left} R:${this.borderRect.right} | W:${borderWidth} H:${borderHeight} ]`;
    this.detailProps.innerHTML = `X:${Math.floor(this.crosshairPos.x / 10)} Y:${Math.floor(this.crosshairPos.y / 10)} Mode:${this.isDrawingRect ? 'RECTANGLE' : 'BRUSH'}${(this.isDrawingRect && this.drawRect ? detailBorderRect : detailBorderAll)}`;

    this.AddPixel(this.mouseMoveEvent!);
    this.RemovePixel(this.mouseMoveEvent!);
    this.DrawRect(this.mouseClickEvent!, this.mouseMoveEvent!);

    setTimeout(this.Update, 1);
  }

  public AddPixel = (event: MouseEvent) => {
    if (!this.mouseClicked || this.isDrawingRect) { return; }

    if (event.buttons === 1) {
      const { left, top } = this.canvas.getBoundingClientRect();
      const mousePos: Point = {
        x: Math.floor((event.clientX - left) / 10),
        y: Math.floor((event.clientY - top) / 10),
      };
      const pixelIndex = this.drawCoords.findIndex(coords => compareObject(coords, mousePos));

      if (pixelIndex >= 0) {
        if (this.colorCoords[pixelIndex] !== this.autoFillColorId) return;
        this.drawCoords[pixelIndex] = mousePos;
        this.colorCoords[pixelIndex] = this.colorToColorId(this.currentColor);
      }
      else {
        this.drawCoords.push(mousePos);
        this.colorCoords.push(this.colorToColorId(this.currentColor));
      }

      this.CalculateBorderRects();
    }
  }

  public RemovePixel = (event: MouseEvent) => {
    if (!this.mouseClicked || this.isDrawingRect) { return; }
    
    if (event.buttons === 2) {
      const { left, top } = this.canvas.getBoundingClientRect();
      const mousePos = {
        x: Math.floor((event.clientX - left) / 10),
        y: Math.floor((event.clientY - top) / 10),
      };
      
      const pixelIndex = this.drawCoords.findIndex(coords => compareObject(coords, mousePos));

      if (pixelIndex >= 0) {
        this.drawCoords.splice(pixelIndex, 1);
        this.colorCoords.splice(pixelIndex, 1);
      }

      this.CalculateBorderRects();
    }
  }

  public DrawRect = (clickEvent: MouseEvent, moveEvent: MouseEvent) => {
    if (!this.mouseClicked || !this.drawRect) { return; }

    if (moveEvent.button === 0) {
      const { left, top } = this.canvas.getBoundingClientRect();
      const mouseClickPos = {
        x: Math.floor((clickEvent.clientX - left) / 10),
        y: Math.floor((clickEvent.clientY - top) / 10),
      };
      const mousePos = {
        x: Math.floor((moveEvent.clientX - left) / 10),
        y: Math.floor((moveEvent.clientY - top) / 10),
      };

      this.point1 = mouseClickPos;
      this.point2 = mousePos;

      this.CalculateBorderRects();
    }
  }

  public FillDrawingRect = () => {
    if (this.isDrawingRect && this.readyToDraw) {
      const drawWidth = this.borderRect.right - this.borderRect.left + 1;
      const drawHeight = this.borderRect.bottom - this.borderRect.top + 1;

      for (let h = 0; h < drawHeight; h++) {
        for (let i = 0; i < drawWidth; i++) {
          const pos = {
            x: this.borderRect.left + i,
            y: this.borderRect.top + h,
          };
          const pixelIndex = this.drawCoords.findIndex(coords => compareObject(pos, coords));

          if (pixelIndex >= 0) {
            this.drawCoords[pixelIndex] = pos;
            this.colorCoords[pixelIndex] = this.colorToColorId(this.currentColor);
          }
          else {
            this.drawCoords.push(pos);
            this.colorCoords.push(this.colorToColorId(this.currentColor));
          }
        }
      }

      this.readyToDraw = false;

      this.CalculateBorderRects();
    }
  }

  public DrawMouseCrossHair = () => {
    const { x, y } = this.crosshairPos;

    this.context.strokeStyle = '#000';
    this.context.strokeRect(Math.floor(x / 10) * 10, Math.floor(y / 10) * 10, 10, 10);
  }

  public DrawBorderRectangle = () => {
    if ((this.drawCoords.length === 0 || !this.drawBorder) && (!this.isDrawingRect || !this.drawRect)) return;
    const { top, left, right, bottom } = this.borderRect;

    this.context.strokeStyle = '#000';
    this.context.strokeRect(Math.floor(left) * 10, Math.floor(top) * 10, Math.floor((right - left + 1)) * 10, Math.floor((bottom - top + 1)) * 10);
  }

  public DrawDrawingCoords = () => {
    this.drawCoords.forEach(({ x, y }, i) => {
      this.DrawPixel(x, y, this.colorCoords[i]);
    });
  }

  public DrawPixel = (x: number, y: number, colorType: number) => {
    let color = (colorType === 0) ? ('#43523d') : ('#c7f0d8');
    let pixel = { w: 10, h: 10 };

    this.context.fillStyle = color;
    this.context.fillRect(pixel.w * x, pixel.h * y, pixel.w, pixel.h);
  }

  public CalculateBorderRects = () => {
    if (this.isDrawingRect && this.drawRect) {
      this.borderRect = {
        top: this.point1.y,
        left: this.point1.x,
        right: this.point1.x,
        bottom: this.point1.y,
      };

      this.borderRect = {
        top: this.point2.y < this.borderRect.top ? this.point2.y : this.borderRect.top,
        left: this.point2.x < this.borderRect.left ? this.point2.x : this.borderRect.left,
        right: this.point2.x > this.borderRect.right ? this.point2.x : this.borderRect.right,
        bottom: this.point2.y > this.borderRect.bottom ? this.point2.y : this.borderRect.bottom,
      };
    }
    else {
      if (this.drawCoords.length === 0) return;
      const { x: dx, y: dy } = this.drawCoords[0];
      this.borderRect = {
        top: dy,
        left: dx,
        right: dx,
        bottom: dy,
      };

      this.drawCoords.forEach(pixel => {
        const { x, y } = pixel;
        this.borderRect = {
          top: y < this.borderRect.top ? y : this.borderRect.top,
          left: x < this.borderRect.left ? x : this.borderRect.left,
          right: x > this.borderRect.right ? x : this.borderRect.right,
          bottom: y > this.borderRect.bottom ? y : this.borderRect.bottom,
        };
      });
    }
  }

  public ControlMouseCrosshair = (event: MouseEvent) => {
    const { left, top } = this.canvas.getBoundingClientRect();
    const mousePos = {
      x: event.clientX - left,
      y: event.clientY - top
    };

    this.crosshairPos = mousePos;
    this.mouseMoveEvent = event;
  }

  public ManualKeyDownHandler = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === 'x') {
      DrawMap.SwitchDrawingColor();
    }
    else if (e.key.toLowerCase() === 'r') {
      this.isDrawingRect = !this.isDrawingRect;
      this.optDrawRect.checked = this.isDrawingRect;
    }
  }

  public static SwitchDrawingColor = () => {
    DrawMap.Instance.currentColor = DrawMap.Instance.currentColor === COLOR.Dark ? COLOR.Light : COLOR.Dark;
    DrawMap.Instance.autoFillColor = DrawMap.Instance.autoFillColor === COLOR.Dark ? COLOR.Light : COLOR.Dark;
    DrawMap.Instance.autoFillColorId = DrawMap.Instance.currentColor === COLOR.Dark ? 1 : 0;
  }

  public static GenerateDrawArray = () => {
    const drawWidth = DrawMap.Instance.borderRect.right - DrawMap.Instance.borderRect.left + 1;
    const drawHeight = DrawMap.Instance.borderRect.bottom - DrawMap.Instance.borderRect.top + 1;

    let drawArrays = new Array(drawHeight);
    for (let h = 0; h < drawArrays.length; h++) {
      const drawRow = new Array(drawWidth);
      for (let i = 0; i < drawRow.length; i++) {
        const pos = {
          x: DrawMap.Instance.borderRect.left + i,
          y: DrawMap.Instance.borderRect.top + h,
        };
        const pixelIndex = DrawMap.Instance.drawCoords.findIndex(coords => compareObject(pos, coords));
        drawRow[i] = pixelIndex >= 0
          ? DrawMap.Instance.colorCoords[pixelIndex]
          : DrawMap.Instance.autoFillColor === COLOR.Dark ? 0 : 1;
      }
      drawArrays[h] = drawRow;
    }

    return drawArrays;
  }

  public static GenerateDrawMap = () => {
    let texts = '', additional = '';
    const arrayOfObj = Object.entries(DrawMap.Instance.tempObjects).map(([_, value]) => {
      return value.drawMap;
    });

    if (DrawMap.Instance.multiMode) {
      texts = JSON.stringify(arrayOfObj).replace(/\"/g, '');
    } else {
      let drawArrays = DrawMap.GenerateDrawArray();
      texts = JSON.stringify(drawArrays).replace(/\"/g, '');
      additional = `\n\n// X Axis Offset = ${DrawMap.Instance.borderRect.left}\n// Y Axis Offset = ${DrawMap.Instance.borderRect.top}\n`;
    }

    const textFileAsBlob = new Blob([`const ${DrawMap.Instance.optName.value} = ${texts};${additional}`], { type: 'text/plain' });
    const downloadLink = document.createElement("a");
    downloadLink.download = DrawMap.Instance.optName.value + '.js';
    if (window.webkitURL != null) {
      downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    } else {
      downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    }

    downloadLink.onclick = () => { downloadLink.remove(); };
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);

    downloadLink.click();
  }

  public static AssignDrawMapToObject = () => {
    let keyName = DrawMap.Instance.optMultiCName.value;
    const drawMap = DrawMap.GenerateDrawArray();

    if (DrawMap.Instance.tempObjects.hasOwnProperty(keyName)) {
      let dupesCount = 1;
      while (DrawMap.Instance.tempObjects.hasOwnProperty(keyName)) {
        keyName = DrawMap.Instance.optMultiCName.value + dupesCount;
        dupesCount++;
      }
    }

    Object.assign(DrawMap.Instance.tempObjects, { [keyName]: {
      drawMap: drawMap,
      offset: {
        x: DrawMap.Instance.borderRect.left,
        y: DrawMap.Instance.borderRect.top,
      }
    } });

    DrawMap.Instance.drawCoords.length = 0;
    DrawMap.Instance.colorCoords.length = 0;

    DrawMap.ShowDrawMapObjDetail();
  }

  public static DeleteDrawMapFromObject = (keyName: string) => {
    //@ts-ignore
    delete DrawMap.Instance.tempObjects[keyName];

    DrawMap.ShowDrawMapObjDetail();
  }

  public static CopyFromDrawMap = (keyName: string) => {
    //@ts-ignore
    const obj: { drawMap: number[][], offset: Point } = DrawMap.Instance.tempObjects[keyName];
    
    for (let iy = 0; iy < obj.drawMap.length; iy++) {
      for (let ix = 0; ix < obj.drawMap[iy].length; ix++) {    
        if (obj.drawMap[iy][ix] === DrawMap.Instance.autoFillColorId) continue;

        const mousePos: Point = {
          x: obj.offset.x + ix,
          y: obj.offset.y + iy,
        };
        
        const pixelIndex = DrawMap.Instance.drawCoords.findIndex(coords => compareObject(coords, mousePos));
    
        if (pixelIndex >= 0) {
          DrawMap.Instance.drawCoords[pixelIndex] = mousePos;
          DrawMap.Instance.colorCoords[pixelIndex] = obj.drawMap[iy][ix];
        }
        else {
          DrawMap.Instance.drawCoords.push(mousePos);
          DrawMap.Instance.colorCoords.push(obj.drawMap[iy][ix]);
        }
      }
    }

    DrawMap.Instance.CalculateBorderRects();
  }

  public static ShowDrawMapObjDetail = () => {
    const optDetailDrawmap = document.getElementById('multi-mode-detail')!;

    let html = '';
    for (let key in DrawMap.Instance.tempObjects) {
      html += `<div id="opt-detail-${key}">`;
      html += `${key} - `;
      html += `<button class="btn-generate" onclick="window.__3310F_DrawMap_CopyFromDrawMap('${key}')">Copy</button>`;
      html += '&nbsp;';
      html += `<button class="btn-remove" onclick="window.__3310F_DrawMap_DeleteDrawMapFromObject('${key}')">Remove</button>`;
      html += '</div>';
    }
    optDetailDrawmap.innerHTML = html;
    optDetailDrawmap.scrollTop = optDetailDrawmap.scrollHeight;
  }

  public static ToggleDrawRect = (self: any) => {
    DrawMap.Instance.isDrawingRect = self.checked;
  }

  public static ToggleMultiMode = (self: any) => {
    DrawMap.Instance.multiMode = self.checked;
    if (DrawMap.Instance.multiMode) {
      DrawMap.Instance.optNormal.style.display = 'none';
      DrawMap.Instance.optMulti.style.display = 'initial';
    }
    else {
      DrawMap.Instance.optNormal.style.display = 'initial';
      DrawMap.Instance.optMulti.style.display = 'none';
    }
  }

  public static ShowDrawBorder(self: any) {
    DrawMap.Instance.drawBorder = self.checked;
  }

  public static EditName(self: any) {
    document.getElementById('opt-filename')!.innerHTML = self.value;
  }

  colorToColorId(color: ColorType): number {
    return color === COLOR.Dark ? 0 : 1;
  }
}

export { DrawMap, COLOR }
