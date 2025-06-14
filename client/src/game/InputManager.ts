export class InputManager {
  private pressedKeys: Set<string> = new Set();
  private justPressedKeys: Set<string> = new Set();
  private justReleasedKeys: Set<string> = new Set();
  private virtualInputs: Set<string> = new Set();
  private boundHandleKeyDown?: (e: KeyboardEvent) => void;
  private boundHandleKeyUp?: (e: KeyboardEvent) => void;

  initialize() {
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleKeyUp = this.handleKeyUp.bind(this);
    window.addEventListener('keydown', this.boundHandleKeyDown);
    window.addEventListener('keyup', this.boundHandleKeyUp);
    
    // Prevent default behavior for game keys
    window.addEventListener('keydown', (e) => {
      const gameKeys = [
        'Space',
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'KeyW',
        'KeyA',
        'KeyS',
        'KeyD',
        'KeyJ',
        'KeyK',
        'ShiftLeft',
        'ShiftRight',
      ];
      if (gameKeys.includes(e.code)) {
        e.preventDefault();
      }
    });
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (!this.pressedKeys.has(event.code)) {
      this.justPressedKeys.add(event.code);
    }
    this.pressedKeys.add(event.code);
  }

  private handleKeyUp(event: KeyboardEvent) {
    this.pressedKeys.delete(event.code);
    this.justReleasedKeys.add(event.code);
  }

  update() {
    // Clear just pressed/released keys after each frame
    this.justPressedKeys.clear();
    this.justReleasedKeys.clear();
  }

  // Virtual input methods for mobile controls
  setVirtualInput(keyCode: string, pressed: boolean) {
    if (pressed) {
      if (!this.pressedKeys.has(keyCode) && !this.virtualInputs.has(keyCode)) {
        this.justPressedKeys.add(keyCode);
      }
      this.pressedKeys.add(keyCode);
      this.virtualInputs.add(keyCode);
    } else {
      this.pressedKeys.delete(keyCode);
      this.virtualInputs.delete(keyCode);
      this.justReleasedKeys.add(keyCode);
    }
  }

  isKeyPressed(keyCode: string): boolean {
    return this.pressedKeys.has(keyCode);
  }

  isKeyJustPressed(keyCode: string): boolean {
    return this.justPressedKeys.has(keyCode);
  }

  isKeyJustReleased(keyCode: string): boolean {
    return this.justReleasedKeys.has(keyCode);
  }

  destroy() {
    if (this.boundHandleKeyDown) {
      window.removeEventListener('keydown', this.boundHandleKeyDown);
    }
    if (this.boundHandleKeyUp) {
      window.removeEventListener('keyup', this.boundHandleKeyUp);
    }
  }
}
