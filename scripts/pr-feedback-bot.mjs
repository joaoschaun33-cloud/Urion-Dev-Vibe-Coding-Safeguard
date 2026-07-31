import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/**
 * Script utilitário para formatar a saída do cursor-doctor
 * em um comentário amigável e empático no formato GitHub Markdown para PRs.
 */
function generatePRComment() {
  const doctorScript = path.join(ROOT, 'tools', 'cursor-doctor.js');
  let output = '';

  try {
    output = execSync(`node "${doctorScript}"`, { encoding: 'utf8' });
  } catch (err) {
    output = err.stdout || err.message;
  }

  const isHealthy = !output.includes('❌ ERROR') && !output.includes('REPOSITORIO NAO ESTA SAUDAVEL');

  const commentMarkdown = `## 🛡️ Urion Trust & Safety — Feedback de Qualidade no PR

Olá! Sou o **Urion Safeguard Bot**, seu assistente de qualidade Big Tech. 
Analisei as alterações deste Pull Request para garantir que seu código continue seguro, escalável e livre de alucinações de IA.

---

### 📊 Diagnóstico do Repositório:

${isHealthy ? '### 🟢 Status: **APROVADO (100% Saudável)**' : '### ⚠️ Status: **ATENÇÃO REQUERIDA**'}

\`\`\`text
${output.trim()}
\`\`\`

---

### 💡 Mensagem Empática para o Criador Vibe Coding:
${
  isHealthy
    ? '🎉 **Parabéns!** Seu código segue o Dogma Zero, possui arquitetura FSD desacoplada e passou por todas as auditorias de AST e Segurança. Você pode realizar o merge com a confiança de um engenheiro sênior!'
    : '⚠️ **Dica Amigável:** Identificamos pontos de atenção acima. Verifique os alertas antes de realizar o merge para manter seu projeto protegido contra débitos técnicos e vazamentos.'
}

---
*Protegido por Urion Trust & Safety for Creators* 🚀
`;

  const outputPath = path.join(ROOT, 'pr-comment.md');
  fs.writeFileSync(outputPath, commentMarkdown, 'utf8');
  console.log(`✅ Comentário do PR gerado com sucesso em ${outputPath}`);
}

generatePRComment();
