// src/features/blueprint-hub/domain/blueprint-hub-repository.interface.ts

import { BlueprintEntity, CreateBlueprintInput } from './blueprint-hub';

export interface IBlueprintHubRepository {
  save(blueprintId: string, input: CreateBlueprintInput): Promise<BlueprintEntity>;
  findById(blueprintId: string): Promise<BlueprintEntity | null>;
  listRecent(limit?: number): Promise<BlueprintEntity[]>;
}
