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
    // 순회 중 수정 방지를 위해 복사본 생성
    const snapshot = Array.from(this.getInstance().entities);
    snapshot.forEach(callback);
  }

  static filter(predicate: (entity: ActiveEntity) => boolean): ActiveEntity[] {
    return Array.from(this.getInstance().entities).filter(predicate);
  }

  static map<T>(mapper: (entity: ActiveEntity) => T): T[] {
    return Array.from(this.getInstance().entities).map(mapper);
  }

  static clear(): void {
    this.getInstance().entities.clear();
  }

  static size(): number {
    return this.getInstance().entities.size;
  }
}
