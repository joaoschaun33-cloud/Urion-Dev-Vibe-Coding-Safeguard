import { AwilixContainer, asClass } from 'awilix';
import { PrismaSecurityAuditRepository } from './infrastructure/security-audit-repository.prisma';
import { CreateSecurityAuditUseCase } from './application/create-security-audit';
import { SecurityAuditController } from './presentation/security-audit-controller';

export function registerSecurityAuditModule(container: AwilixContainer): void {
  container.register({
    securityAuditRepository: asClass(PrismaSecurityAuditRepository).singleton(),
    createSecurityAuditUseCase: asClass(CreateSecurityAuditUseCase).singleton(),
    securityAuditController: asClass(SecurityAuditController).singleton(),
  });
}
