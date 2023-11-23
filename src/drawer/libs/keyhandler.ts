import { KeyEventHandler } from "../../types";
import { DrawMap } from "./drawmap";

type KeyHandleState = {
  registeredKey: string,
  pressed: boolean
}

class KeyHandler {
  public state: { [key: string]: KeyHandleState } = {
    UP: {
      registeredKey: 'ArrowUp',
      pressed: false
    },
    DOWN: {
      registeredKey: 'ArrowDown',
      pressed: false
    },
    LEFT: {
      registeredKey: 'ArrowLeft',
      pressed: false
    },
    RIGHT: {
      registeredKey: 'ArrowRight',
      pressed: false
    },
    ESCAPE: {
      registeredKey: 'Escape',
      pressed: false
    }
  };

  constructor(drawMap: DrawMap, additionalDownHandle?: Optional<KeyEventHandler>, additionalUpHandle?: Optional<KeyEventHandler>) {
    window.addEventListener('keydown', (e) => {
      if (document.activeElement !== drawMap.optName && document.activeElement !== drawMap.optMultiCName) {
        if (!e.ctrlKey) e.preventDefault();

        this.KeyDownHandle(e);
        additionalDownHandle && additionalDownHandle(e);
      }
    });
    window.addEventListener('keyup', (e) => {
      if (document.activeElement !== drawMap.optName && document.activeElement !== drawMap.optMultiCName) {
        if (!e.ctrlKey) e.preventDefault();

        this.KeyUpHandle(e);
        additionalUpHandle && additionalUpHandle(e);
      }
    });
  }

  IsPressed(keyStateName: string) {
    const keyName = keyStateName.toUpperCase();
    if (this.state.hasOwnProperty(keyName)) {
      return this.state[keyName].pressed;
    }
    else {
      console.error(`"${keyStateName}" is undefined in keyState.`);
      return false;
    }
  }

  KeyDownHandle(event: KeyboardEvent) {
    for (let key in this.state) {
      if (this.state[key].registeredKey == event.key) {
        this.state[key].pressed = true;
      }
    }
  }

  KeyUpHandle(event: KeyboardEvent) {
    for (let key in this.state) {
      if (this.state[key].registeredKey == event.key) {
        this.state[key].pressed = false;
      }
    }
  }

  RegisterKey(keyStateName: string, keyCode: string) {
    const keyName = keyStateName.toUpperCase();
    if (this.state.hasOwnProperty(keyName)) {
      console.error(`"${keyStateName}" is already exists in keyState`);
      return false;
    }
    else {
      Object.assign(this.state, {
        [keyName]: {
          registeredKey: keyCode,
          pressed: false
        }
      });
      return this.state[keyName];
    }
  }

  UnregisterKey(keyStateName: string) {
    const keyName = keyStateName.toUpperCase();
    if (this.state.hasOwnProperty(keyName)) {
      delete this.state[keyName];
    }
    else {
      console.error(`"${keyStateName}" is undefined on keyState.`);
    }
  }
}

export { KeyHandler };
