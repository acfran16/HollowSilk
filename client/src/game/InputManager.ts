export class InputManager {
  private pressedKeys: Set<string> = new Set();
  private justPressedKeys: Set<string> = new Set();
  private justReleasedKeys: Set<string> = new Set();

  initialize() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Prevent default behavior for game keys
    window.addEventListener('keydown', (e) => {
      const gameKeys = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyJ', 'KeyK', 'ShiftLeft'];
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
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
  }
}
