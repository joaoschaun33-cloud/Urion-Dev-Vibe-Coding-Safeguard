import { describe, expect, it } from 'vitest';
import { ProjectHealth } from '../../domain/project-health.js';
import { CreateProjectHealthUseCase } from '../../application/create-project-health.js';
import { InMemoryProjectHealthRepository } from '../../infrastructure/project-health-repository.memory.js';

describe('ProjectHealth Domain & Application', () => {
  it('deve calcular score EXCELLENT para metricas perfeitas', () => {
    const health = ProjectHealth.create({
      projectName: 'MeuProjeto',
      metrics: {
        testsPassing: 10,
        totalTests: 10,
        mdcRulesActive: 5,
        architectureViolations: 0,
      },
    });

    expect(health.score).toBe(100);
    expect(health.status).toBe('EXCELLENT');
  });

  it('deve calcular score CRITICAL quando houver violacoes de arquitetura e testes falhando', () => {
    const health = ProjectHealth.create({
      projectName: 'ProjetoProblematico',
      metrics: {
        testsPassing: 2,
        totalTests: 10,
        mdcRulesActive: 0,
        architectureViolations: 3,
      },
    });

    expect(health.score).toBeLessThan(50);
    expect(health.status).toBe('CRITICAL');
  });

  it('deve salvar e retornar o relatório via CreateProjectHealthUseCase', async () => {
    const repo = new InMemoryProjectHealthRepository();
    const useCase = new CreateProjectHealthUseCase(repo);

    const result = await useCase.execute({
      projectName: 'AuditApp',
      metrics: {
        testsPassing: 8,
        totalTests: 10,
        mdcRulesActive: 4,
        architectureViolations: 0,
      },
    });

    expect(result.id).toBeDefined();
    expect(result.projectName).toBe('AuditApp');
    expect(result.score).toBe(92);
    expect(result.status).toBe('EXCELLENT');
  });
});
