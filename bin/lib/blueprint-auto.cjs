// bin/lib/blueprint-auto.cjs
// Gera um blueprint LOCAL (.urion/blueprints/). Nao faz nenhuma requisicao de rede.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { analyzeProject } = require('./project-detector.cjs');
const {
  printHeader, printSuccess, printWarning,
  printStep, printSubStep, animatedProgress
} = require('./ui-kit.cjs');

function hashName(str, length = 8) {
  if (!str) return 'unknown';
  return crypto.createHash('sha256').update(String(str)).digest('hex').slice(0, length);
}

function anonymizeProjectData(analysis) {
  return {
    blueprintVersion: '2.0',
    generatedAt: new Date().toISOString(),
    project: {
      name: `project-${hashName(analysis.name, 8)}`,
      architecture: analysis.architecture,
      stack: analysis.stack,
      featureCount: analysis.features.length,
      features: analysis.features.map(f => `feature-${hashName(f, 8)}`),
      fileMetrics: {
        totalFiles: analysis.files.total,
        codeFiles: analysis.files.codeFiles,
        testFiles: analysis.files.testFiles,
        testRatio: analysis.files.codeFiles > 0 
          ? Math.round((analysis.files.testFiles / analysis.files.codeFiles) * 100) 
          : 0,
      },
      governance: {
        hasCursorRules: analysis.hasCursorRules,
        hasAgentsMd: analysis.hasAgentsMd,
        rulesCount: analysis.rulesCount,
        hasSnapshot: analysis.hasSnapshot,
      },
      gitMetrics: {
        commits: analysis.git.commits,
        hasRemote: !!analysis.git.remote,
      },
    },
  };
}

function generateLocalBlueprint(analysis) {
  const bp = anonymizeProjectData(analysis);
  const bpDir = path.join(analysis.path, '.urion', 'blueprints');
  if (!fs.existsSync(bpDir)) fs.mkdirSync(bpDir, { recursive: true });

  const filename = `blueprint-${Date.now()}.json`;
  const filepath = path.join(bpDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(bp, null, 2), 'utf8');
  return filepath;
}

async function runBlueprintAuto(projectPath) {
  printHeader('MODO BLUEPRINT — LOCAL', 'Nada sai da sua maquina');

  printStep(1, 3, 'Analise do projeto');
  await animatedProgress('Escaneando arquivos...', 800, 8);

  const analysis = analyzeProject(projectPath);

  printSubStep(`Arquitetura detectada: ${analysis.architecture}`, 'done');
  printSubStep(`Stack: ${analysis.stack.framework || 'Vanilla'} + ${analysis.stack.database || 'No DB'} + ${analysis.stack.frontend || 'No Frontend'}`, 'done');
  printSubStep(`Features: ${analysis.features.length} modulos`, 'done');
  printSubStep(`Testes: ${analysis.files.testFiles} arquivos`, 'done');
  printSubStep(`Total: ${analysis.files.total} arquivos analisados`, 'done');

  printStep(2, 3, 'Gerando blueprint local');
  // Nomes do projeto e das features viram hash SHA-256 truncado. Isso NAO e
  // anonimizacao forte: nomes comuns (ex.: "todo") sao recuperaveis por
  // dicionario. Por isso o arquivo so e gravado localmente, nunca enviado.
  const localPath = generateLocalBlueprint(analysis);
  printSubStep('Nome do projeto e das features: substituidos por hash (nao e anonimizacao forte)', 'done');

  printStep(3, 3, 'Blueprint salvo');
  printSuccess(`Arquivo local: ${localPath}`);
  printWarning('Nenhum dado foi enviado pela rede. Revise o arquivo antes de compartilhar com qualquer pessoa.');

  return { localPath };
}

module.exports = { runBlueprintAuto, anonymizeProjectData, generateLocalBlueprint, hashName };
