import Game from './libs/game';
import './style.css';

function app() {
  Game.CreateGame();

  window.onunload = () => {
    window._3310F_GAME.Unload();
  }
}
app();
