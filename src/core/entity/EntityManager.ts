import type { ActiveEntity } from "./ActiveEntity";

export class EntityManager {
  private entities = new Set<ActiveEntity>();
  private static instance: EntityManager;

  private constructor() {}

  static getInstance(): EntityManager {
    if (!this.instance) {
      this.instance = new EntityManager();
    }
    return this.instance;
  }

  // 🚀 Static API - O(1) 최적화된 알고리즘
  static add(entity: ActiveEntity): void {
    this.getInstance().entities.add(entity); // O(1)
  }

  static remove(entity: ActiveEntity): boolean {
    return this.getInstance().entities.delete(entity); // O(1)
  }

  static forEach(callback: (entity: ActiveEntity) => void): void {
    this.getInstance().entities.forEach(callback); // O(N) - 어차피 필요
  }
}
