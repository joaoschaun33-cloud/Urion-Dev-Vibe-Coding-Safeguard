/**
 * 🛠️ No-Code & Low-Code Security Scanner Engine
 *
 * Analisa artefatos declarativos (n8n Workflows, Make.com Blueprints,
 * OpenAPI Specs, Docker-Compose & CI/CD YAMLs).
 *
 * Regras aplicadas:
 * - N8N_HARDCODED_SECRET: Chaves API ou credenciais gravadas em nós n8n.
 * - MAKE_EXPOSED_TOKEN: Tokens de autenticação expostos em blueprints Make.
 * - OPENAPI_MISSING_SECURITY: Endpoints sem esquema de segurança definido.
 * - YAML_HARDCODED_SECRET: Credenciais em arquivos YAML/JSON.
 */

import parseYaml from 'yaml';

export interface NoCodeFinding {
  ruleId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  fileType: 'N8N_WORKFLOW' | 'MAKE_BLUEPRINT' | 'OPENAPI_SPEC' | 'GENERIC_DECLARATIVE';
  location: string;
  message: string;
  recommendation: string;
}

export interface NoCodeScanResult {
  isSafe: boolean;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  findings: NoCodeFinding[];
}

const SECRET_PATTERNS = [
  /api[_-]?key\s*[:=]\s*['"][^'"]{8,}['"]/i,
  /bearer\s+[a-zA-Z0-9_.-]{20,}/i,
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /secret[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
  /ghp_[a-zA-Z0-9]{36}/,
  /sk_live_[a-zA-Z0-9]{24}/,
];

export class NoCodeArtifactScanner {
  /**
   * Analisa o conteúdo de um artefato em formato string (JSON ou YAML)
   */
  public scan(content: string, fileName = 'artifact.json'): NoCodeScanResult {
    const findings: NoCodeFinding[] = [];
    let parsed: unknown = null;
    let isYaml = false;

    try {
      if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
        parsed = parseYaml.parse(content);
        isYaml = true;
      } else {
        parsed = JSON.parse(content);
      }
    } catch {
      // Se não for JSON válido, tenta parsear como YAML
      try {
        parsed = parseYaml.parse(content);
        isYaml = true;
      } catch {
        // Não é estrutura declarativa válida
        return this.buildResult([
          {
            ruleId: 'INVALID_DECLARATIVE_FORMAT',
            severity: 'LOW',
            fileType: 'GENERIC_DECLARATIVE',
            location: fileName,
            message: 'O arquivo não é um JSON ou YAML válido.',
            recommendation: 'Verifique a sintaxe do arquivo de configuração.',
          },
        ]);
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      return this.buildResult([]);
    }

    const obj = parsed as Record<string, unknown>;

    // 1. Detecção de Workflow n8n
    if (Array.isArray(obj.nodes) && obj.connections) {
      this.scanN8nWorkflow(obj.nodes as Array<Record<string, unknown>>, findings, fileName);
    }

    // 2. Detecção de Blueprint Make.com
    if (Array.isArray(obj.modules) || (obj.name && obj.flow)) {
      this.scanMakeBlueprint(obj, findings, fileName);
    }

    // 3. Detecção de OpenAPI Spec
    if (obj.openapi || obj.swagger) {
      this.scanOpenApiSpec(obj, findings, fileName);
    }

    // 4. Scan genérico de segredos em texto/valores
    this.scanGenericSecrets(content, findings, fileName, isYaml);

    return this.buildResult(findings);
  }

  private scanN8nWorkflow(
    nodes: Array<Record<string, unknown>>,
    findings: NoCodeFinding[],
    fileName: string
  ): void {
    for (const node of nodes) {
      const nodeName = (node.name as string | undefined) ?? 'Node desconhecido';
      const parameters = JSON.stringify(node.parameters);

      for (const pattern of SECRET_PATTERNS) {
        if (pattern.test(parameters)) {
          findings.push({
            ruleId: 'N8N_HARDCODED_SECRET',
            severity: 'CRITICAL',
            fileType: 'N8N_WORKFLOW',
            location: `${fileName} -> Node: "${nodeName}"`,
            message: `Credencial ou chave API hardcoded detectada no nó n8n "${nodeName}".`,
            recommendation:
              'Remova a chave do nó e utilize as Credenciais seguras gerenciadas do n8n ou variáveis de ambiente ($env).',
          });
          break;
        }
      }
    }
  }

  private scanMakeBlueprint(
    blueprint: Record<string, unknown>,
    findings: NoCodeFinding[],
    fileName: string
  ): void {
    const serialized = JSON.stringify(blueprint);
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(serialized)) {
        findings.push({
          ruleId: 'MAKE_EXPOSED_TOKEN',
          severity: 'CRITICAL',
          fileType: 'MAKE_BLUEPRINT',
          location: `${fileName} -> Blueprint Make.com`,
          message: 'Token de autenticação sensível detectado no blueprint do Make.com.',
          recommendation: 'Substitua os tokens hardcoded por conexões de credenciais do Make.com.',
        });
        break;
      }
    }
  }

  private scanOpenApiSpec(
    spec: Record<string, unknown>,
    findings: NoCodeFinding[],
    fileName: string
  ): void {
    const paths = (spec.paths as Record<string, unknown> | undefined) ?? {};
    const hasGlobalSecurity = Boolean(spec.security);

    if (!hasGlobalSecurity) {
      findings.push({
        ruleId: 'OPENAPI_MISSING_GLOBAL_SECURITY',
        severity: 'MEDIUM',
        fileType: 'OPENAPI_SPEC',
        location: `${fileName} -> Spec OpenAPI`,
        message: 'A especificação OpenAPI não possui esquema de segurança global configurado.',
        recommendation:
          'Defina a chave "security" na raiz da especificação OpenAPI com Bearer JWT ou OAuth2.',
      });
    }

    for (const [pathKey, pathObj] of Object.entries(paths)) {
      if (typeof pathObj === 'object' && pathObj !== null) {
        const methods = pathObj as Record<string, unknown>;
        for (const [method, details] of Object.entries(methods)) {
          if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
            const op = details as Record<string, unknown>;
            if (!hasGlobalSecurity && !op.security) {
              findings.push({
                ruleId: 'OPENAPI_UNPROTECTED_ENDPOINT',
                severity: 'HIGH',
                fileType: 'OPENAPI_SPEC',
                location: `${fileName} -> ${method.toUpperCase()} ${pathKey}`,
                message: `O endpoint ${method.toUpperCase()} ${pathKey} não possui controle de autenticação.`,
                recommendation: 'Adicione "security" no endpoint ou configure autenticação global.',
              });
            }
          }
        }
      }
    }
  }

  private scanGenericSecrets(
    rawContent: string,
    findings: NoCodeFinding[],
    fileName: string,
    isYaml: boolean
  ): void {
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(rawContent)) {
        // Evita duplicar se já foi pego nos scanners específicos
        const exists = findings.some(
          (f) => f.ruleId.includes('SECRET') || f.ruleId.includes('TOKEN')
        );
        if (!exists) {
          findings.push({
            ruleId: isYaml ? 'YAML_HARDCODED_SECRET' : 'JSON_HARDCODED_SECRET',
            severity: 'CRITICAL',
            fileType: 'GENERIC_DECLARATIVE',
            location: fileName,
            message:
              'Possível credencial ou segredo em texto claro encontrado no arquivo de configuração.',
            recommendation:
              'Utilize variáveis de ambiente em vez de gravar segredos diretamente no arquivo.',
          });
        }
        break;
      }
    }
  }

  private buildResult(findings: NoCodeFinding[]): NoCodeScanResult {
    const criticalCount = findings.filter((f) => f.severity === 'CRITICAL').length;
    const highCount = findings.filter((f) => f.severity === 'HIGH').length;
    const mediumCount = findings.filter((f) => f.severity === 'MEDIUM').length;
    const lowCount = findings.filter((f) => f.severity === 'LOW').length;

    return {
      isSafe: criticalCount === 0 && highCount === 0,
      totalFindings: findings.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      findings,
    };
  }
}
