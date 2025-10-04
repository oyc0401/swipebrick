import type { Container } from "pixi.js";

export interface IComponent {
  destroy(): void;
}

export interface IRenderComponent extends IComponent {
  getGraphics(): Container;
  setPosition(x: number, y: number): void;
  setVisible(visible: boolean): void;
}

export interface IPhysicsComponent extends IComponent {
  getBody(): Matter.Body;
  setPosition(x: number, y: number): void;
  getPosition(): { x: number; y: number };
}
