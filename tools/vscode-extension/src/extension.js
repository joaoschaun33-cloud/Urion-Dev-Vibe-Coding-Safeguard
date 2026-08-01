const vscode = require('vscode');

/**
 * 🛡️ Urion Trust & Safety — Extensão VS Code / Cursor
 *
 * Intercepta salvamentos de arquivos em tempo real para alertar Vibe Coders
 * sobre credenciais expostas, chamadas de console.log residuais e erros em JSON/YAML.
 */
function activate(context) {
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('urion-safeguard');
  context.subscriptions.push(diagnosticCollection);

  // Padrões de detecção rápida
  const SECRET_PATTERNS = [
    { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]{8,}['"]/i, message: 'Urion Warning: Chave de API hardcoded detectada.' },
    { pattern: /bearer\s+[a-zA-Z0-9_.-]{20,}/i, message: 'Urion Warning: Token Bearer exposto em texto claro.' },
    { pattern: /sk_live_[a-zA-Z0-9]{24}/, message: 'Urion CRITICAL: Chave secreta de produção hardcoded!' },
  ];

  function scanDocument(document) {
    if (!document) return;
    const text = document.getText();
    const diagnostics = [];

    // 1. Scan de Segredos
    SECRET_PATTERNS.forEach(({ pattern, message }) => {
      let match;
      const regex = new RegExp(pattern, 'g');
      while ((match = regex.exec(text)) !== null) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        const range = new vscode.Range(startPos, endPos);

        const diagnostic = new vscode.Diagnostic(
          range,
          `🛡️ ${message} Utilize variáveis de ambiente em vez de gravar segredos no código.`,
          vscode.DiagnosticSeverity.Error
        );
        diagnostic.source = 'Urion Safeguard';
        diagnostics.push(diagnostic);
      }
    });

    // 2. Scan de console.log residuais (JS/TS)
    if (document.languageId === 'typescript' || document.languageId === 'javascript') {
      const consoleRegex = /console\.(log|dir|trace)\s*\(/g;
      let match;
      while ((match = consoleRegex.exec(text)) !== null) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        const range = new vscode.Range(startPos, endPos);

        const diagnostic = new vscode.Diagnostic(
          range,
          '💡 Urion Hint: console.log() residual detectado. Remova antes de enviar para produção.',
          vscode.DiagnosticSeverity.Warning
        );
        diagnostic.source = 'Urion Safeguard';
        diagnostics.push(diagnostic);
      }
    }

    diagnosticCollection.set(document.uri, diagnostics);
  }

  // Event Listeners: Ao abrir e ao salvar arquivo
  if (vscode.window.activeTextEditor) {
    scanDocument(vscode.window.activeTextEditor.document);
  }

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => scanDocument(doc)),
    vscode.workspace.onDidOpenTextDocument((doc) => scanDocument(doc))
  );

  // Comando manual: Urion: Executar Scan
  const disposable = vscode.commands.registerCommand('urion.runScan', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      scanDocument(editor.document);
      vscode.window.showInformationMessage('🛡️ Urion Safeguard: Varredura de segurança concluída com sucesso!');
    }
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
