import type { SpecDocument, SpecStatus } from '../../domain/spec-manager';

export interface SpecDocumentResponseDTO {
  id: string;
  title: string;
  filePath: string;
  status: SpecStatus;
  acceptanceCriteriaCount: number;
  isValidated: boolean;
  createdAt: string;
}

export function toSpecDocumentResponseDTO(spec: SpecDocument): SpecDocumentResponseDTO {
  return {
    id: spec.id,
    title: spec.title,
    filePath: spec.filePath,
    status: spec.status,
    acceptanceCriteriaCount: spec.acceptanceCriteriaCount,
    isValidated: spec.isValidated,
    createdAt: spec.createdAt.toISOString(),
  };
}
