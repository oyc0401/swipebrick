export interface IComponent {
  update?(deltaTime: number): void;
  destroy(): void;
}

export interface IRenderComponent extends IComponent {
  getGraphics(): any; // PixiJS Graphics 객체
  updatePosition(x: number, y: number): void;
}

export interface IPhysicsComponent extends IComponent {
  getBody(): any; // Matter.js Body 객체
  setPosition(x: number, y: number): void;
  getPosition(): { x: number; y: number };
}
