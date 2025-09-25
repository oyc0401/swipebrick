import type { Position } from "../GameState";
import { Entity } from "./Entity";

export abstract class ActiveEntity extends Entity {
  constructor(id: string) {
    super(id);
  }

  public setPosition(position: Position): void {
    this.physicsComponent.setPosition(position.x, position.y);
    this.updateGraphics();
  }

  public getPosition(): Position {
    return this.physicsComponent.getPosition();
  }

  public updateGraphics(): void {
    const position = this.physicsComponent.getPosition();
    this.renderComponent.updatePosition(position.x, position.y);
  }
}
