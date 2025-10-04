import type { Container } from "pixi.js";

export interface IComponent {
  destroy(): void;
  setPosition(x: number, y: number): void;
}

export interface IRenderComponent extends IComponent {
  getGraphics(): Container;
  setVisible(visible: boolean): void;
}

export interface IPhysicsComponent extends IComponent {
  getBody(): Matter.Body;
  getPosition(): { x: number; y: number };
}