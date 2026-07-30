import type { ISpecManagerRepository } from '../domain/spec-manager-repository.interface.js';
import { SpecDocument } from '../domain/spec-manager.js';
import type { CreateSpecDocumentDTO } from './dto/create-spec-manager.dto.js';
import {
  toSpecDocumentResponseDTO,
  type SpecDocumentResponseDTO,
} from './dto/spec-manager-response.dto.js';

export class CreateSpecDocumentUseCase {
  constructor(private readonly repository: ISpecManagerRepository) {}

  async execute(dto: CreateSpecDocumentDTO): Promise<SpecDocumentResponseDTO> {
    const spec = SpecDocument.create({
      title: dto.title,
      filePath: dto.filePath,
      acceptanceCriteriaCount: dto.acceptanceCriteriaCount,
    });

    const saved = await this.repository.save(spec);
    return toSpecDocumentResponseDTO(saved);
  }
}
