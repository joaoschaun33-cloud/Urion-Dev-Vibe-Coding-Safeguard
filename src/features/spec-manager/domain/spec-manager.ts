import crypto from 'node:crypto';

export type SpecStatus = 'DRAFT' | 'APPROVED' | 'OUTDATED';

export interface SpecDocumentProps {
  id?: string;
  title: string;
  filePath: string;
  status?: SpecStatus;
  acceptanceCriteriaCount: number;
  isValidated?: boolean;
  createdAt?: Date;
}

export class SpecDocument {
  readonly id: string;
  readonly title: string;
  readonly filePath: string;
  readonly status: SpecStatus;
  readonly acceptanceCriteriaCount: number;
  readonly isValidated: boolean;
  readonly createdAt: Date;

  private constructor(props: SpecDocumentProps) {
    this.id = props.id ?? crypto.randomUUID();
    this.title = props.title;
    this.filePath = props.filePath;
    this.status = props.status ?? 'DRAFT';
    this.acceptanceCriteriaCount = props.acceptanceCriteriaCount;
    this.isValidated = props.isValidated ?? props.acceptanceCriteriaCount > 0;
    this.createdAt = props.createdAt ?? new Date();
  }

  static create(props: Omit<SpecDocumentProps, 'id' | 'createdAt' | 'isValidated'>): SpecDocument {
    if (!props.title || props.title.trim().length === 0) {
      throw new Error('Spec title is required');
    }

    if (!props.filePath || props.filePath.trim().length === 0) {
      throw new Error('Spec filePath is required');
    }

    return new SpecDocument(props);
  }

  approve(): SpecDocument {
    return new SpecDocument({
      ...this,
      status: 'APPROVED',
      isValidated: true,
    });
  }

  markOutdated(): SpecDocument {
    return new SpecDocument({
      ...this,
      status: 'OUTDATED',
    });
  }
}
