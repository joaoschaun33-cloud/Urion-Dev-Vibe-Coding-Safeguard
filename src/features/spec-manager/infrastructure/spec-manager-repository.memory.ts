import type { ISpecManagerRepository } from '../domain/spec-manager-repository.interface';
import type { SpecDocument } from '../domain/spec-manager';

export class InMemorySpecManagerRepository implements ISpecManagerRepository {
  private items: Map<string, SpecDocument> = new Map();

  async save(spec: SpecDocument): Promise<SpecDocument> {
    this.items.set(spec.id, spec);
    return Promise.resolve(spec);
  }

  async findById(id: string): Promise<SpecDocument | null> {
    return Promise.resolve(this.items.get(id) ?? null);
  }

  async findAll(): Promise<SpecDocument[]> {
    return Promise.resolve(Array.from(this.items.values()));
  }

  clear(): void {
    this.items.clear();
  }
}
