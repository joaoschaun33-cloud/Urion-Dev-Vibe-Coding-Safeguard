import { Request, Response } from 'express';
import { CreateSecurityAuditUseCase } from '../application/create-security-audit';
import { ISecurityAuditRepository } from '../domain/security-audit';
import { createSecurityAuditSchema } from './security-audit-dto';

export class SecurityAuditController {
  constructor(
    private readonly createSecurityAuditUseCase: CreateSecurityAuditUseCase,
    private readonly securityAuditRepository: ISecurityAuditRepository
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const dto = createSecurityAuditSchema.parse(req.body);
    const audit = await this.createSecurityAuditUseCase.execute(dto);
    res.status(201).json(audit);
  }

  async list(_req: Request, res: Response): Promise<void> {
    const audits = await this.securityAuditRepository.findAll();
    res.status(200).json(audits);
  }
}
