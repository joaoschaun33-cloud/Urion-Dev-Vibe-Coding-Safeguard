// src/features/blueprint-hub/application/create-blueprint.ts

import crypto from 'crypto';
import { CreateBlueprintInput, BlueprintEntity } from '../domain/blueprint-hub';
import { IBlueprintHubRepository } from '../domain/blueprint-hub-repository.interface';

export interface CreateBlueprintResponse {
  success: boolean;
  id: string;
  url: string;
  data: BlueprintEntity;
}

export class CreateBlueprintUseCase {
  constructor(private readonly blueprintHubRepository: IBlueprintHubRepository) {}

  async execute(input: CreateBlueprintInput): Promise<CreateBlueprintResponse> {
    const projectName = input.project.name;

    // Gerar ID unico curto para o blueprint (ex: bp-9a8b7c6d)
    const hash = crypto
      .createHash('sha256')
      .update(`${projectName}-${String(Date.now())}-${String(Math.random())}`)
      .digest('hex')
      .slice(0, 8);

    const blueprintId = `bp-${hash}`;

    const saved = await this.blueprintHubRepository.save(blueprintId, input);

    return {
      success: true,
      id: blueprintId,
      url: `https://api.urion.dev/blueprints/${blueprintId}`,
      data: saved,
    };
  }
}
