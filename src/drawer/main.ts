import { DrawMap } from './libs/drawmap';
import './style.css';

declare global {
  interface Window {
    __3310F_DrawMap: DrawMap,
    __3310F_DrawMap_DeleteDrawMapFromObject: (name: string) => void
    __3310F_DrawMap_CopyFromDrawMap: (name: string) => void
  }
}

function app() {
  DrawMap.Instance = new DrawMap();
  window.__3310F_DrawMap = DrawMap.Instance;
  window.__3310F_DrawMap_DeleteDrawMapFromObject = DrawMap.DeleteDrawMapFromObject;
  window.__3310F_DrawMap_CopyFromDrawMap = DrawMap.CopyFromDrawMap;

  document.getElementById("switch-color-btn-1")!.addEventListener('click', () => {
    DrawMap.SwitchDrawingColor();
  });
  document.getElementById("switch-color-btn-2")!.addEventListener('click', () => {
    DrawMap.SwitchDrawingColor();
  });
  document.getElementById("draw-rect")!.addEventListener('click', (e) => {
    DrawMap.ToggleDrawRect(e.target);
  });
  document.getElementById("draw-border")!.addEventListener('click', (e) => {
    DrawMap.ShowDrawBorder(e.target);
  });
  document.getElementById("toggle-multi")!.addEventListener('click', (e) => {
    DrawMap.ToggleMultiMode(e.target);
  });
  document.getElementById("on-generate-draw-map")!.addEventListener('click', () => {
    DrawMap.GenerateDrawMap();
  });
  document.getElementById("add-new")!.addEventListener('click', () => {
    DrawMap.AssignDrawMapToObject();
  });
  document.getElementById("on-generate-multi")!.addEventListener('click', () => {
    DrawMap.GenerateDrawMap();
  });
  document.getElementById("opt-name")!.addEventListener('change', (e) => {
    DrawMap.EditName(e.target);
  });
}
app();
