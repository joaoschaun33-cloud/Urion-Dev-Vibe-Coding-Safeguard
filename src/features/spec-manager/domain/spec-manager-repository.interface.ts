import type { SpecDocument } from './spec-manager.js';

export interface ISpecManagerRepository {
  save(spec: SpecDocument): Promise<SpecDocument>;
  findById(id: string): Promise<SpecDocument | null>;
  findAll(): Promise<SpecDocument[]>;
}
