import Game from './libs/game';
import './style.css';

declare global {
  interface Window {
    __3310F_GAME: Game;
  }
}

function app() {
  Game.Instance = new Game();
  window.__3310F_GAME = Game.Instance;

  Game.Instance.Renderer = (game: Game) => {

  }

  Game.Instance.Update = (game: Game) => {
    
  }

  Game.Instance.Init();

  window.onunload = () => {
    window.__3310F_GAME.Unload();
  }
}
app();
