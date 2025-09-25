import type { ActiveEntity } from "./ActiveEntity";

export class EntityManager {
  private entities: ActiveEntity[] = [];
  private static instance: EntityManager;

  private constructor() {}

  static getInstance(): EntityManager {
    if (!this.instance) {
      this.instance = new EntityManager();
    }
    return this.instance;
  }

  // 🚀 Static API - 간편한 사용자 경험
  static add(entity: ActiveEntity): void {
    this.getInstance().addEntity(entity);
  }

  static remove(entity: ActiveEntity): boolean {
    return this.getInstance().removeEntity(entity);
  }

  static removeById(entityId: string): boolean {
    return this.getInstance().removeEntityById(entityId);
  }

  static find(entityId: string): ActiveEntity | undefined {
    return this.getInstance().getEntity(entityId);
  }

  static forEach(callback: (entity: ActiveEntity) => void): void {
    this.getInstance().getAllEntities().forEach(callback);
  }

  static filter<T extends ActiveEntity>(
    predicate: (entity: ActiveEntity) => entity is T
  ): T[];
  static filter(predicate: (entity: ActiveEntity) => boolean): ActiveEntity[];
  static filter(predicate: (entity: ActiveEntity) => boolean): ActiveEntity[] {
    return this.getInstance().getAllEntities().filter(predicate);
  }

  static map<T>(callback: (entity: ActiveEntity) => T): T[] {
    return this.getInstance().getAllEntities().map(callback);
  }

  static count(): number {
    return this.getInstance().getEntityCount();
  }

  static clear(): void {
    this.getInstance().clear();
  }

  static findByType<T>(type: new (...args: any[]) => T): T[] {
    return this.getInstance().findEntitiesByType(type);
  }

  static debug(): void {
    this.getInstance().debugInfo();
  }

  public addEntity(entity: ActiveEntity): void {
    this.entities.push(entity);
  }

  public removeEntity(entity: ActiveEntity): boolean {
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
      return true;
    }
    return false;
  }

  public removeEntityById(entityId: string): boolean {
    const index = this.entities.findIndex((entity) => entity.id === entityId);
    if (index > -1) {
      this.entities.splice(index, 1);
      return true;
    }
    return false;
  }

  public getEntity(entityId: string): ActiveEntity | undefined {
    return this.entities.find((entity) => entity.id === entityId);
  }

  public getAllEntities(): ActiveEntity[] {
    return this.entities;
  }

  public getEntityCount(): number {
    return this.entities.length;
  }

  public clear(): void {
    // 모든 엔티티 정리
    this.entities.forEach((entity) => {
      entity.destroy();
    });

    this.entities.length = 0;
  }

  public destroy(): void {
    this.clear();
    EntityManager.instance = undefined as any;
  }

  // 디버깅 및 개발용 유틸리티 메서드들
  public debugInfo(): void {
    console.log(`📊 EntityManager Status:`);
    console.log(`   Total entities: ${this.entities.length}`);
    console.log(
      `   Entity IDs:`,
      this.entities.map((e) => e.id)
    );
  }

  public findEntitiesByType<T>(type: new (...args: any[]) => T): T[] {
    return this.entities.filter((entity) => entity instanceof type) as T[];
  }

  public validateIntegrity(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // ID 중복 검사
    const ids = new Set<string>();
    for (const entity of this.entities) {
      if (ids.has(entity.id)) {
        errors.push(`Duplicate entity ID: ${entity.id}`);
      }
      ids.add(entity.id);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
