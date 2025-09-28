import type { Graphics } from "pixi.js";

export interface IComponent {
  destroy(): void;
}

export interface IRenderComponent extends IComponent {
  getGraphics(): Graphics;
  updatePosition(x: number, y: number): void;
  setVisible(visible: boolean): void;
}

export interface IPhysicsComponent extends IComponent {
  getBody(): Matter.Body;
  setPosition(x: number, y: number): void;
  getPosition(): { x: number; y: number };
}
