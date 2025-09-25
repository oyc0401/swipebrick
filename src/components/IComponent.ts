import type { Graphics } from "pixi.js";
import type { Body } from "matter-js";

export interface IComponent {
  update?(deltaTime: number): void;
  destroy(): void;
}

export interface IRenderComponent extends IComponent {
  getGraphics(): Graphics;
  updatePosition(x: number, y: number): void;
}

export interface IPhysicsComponent extends IComponent {
  getBody(): Body;
  setPosition(x: number, y: number): void;
  getPosition(): { x: number; y: number };
}
