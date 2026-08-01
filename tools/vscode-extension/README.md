# 🧩 Extensão Urion Safeguard para VS Code & Cursor

> **Assistente Defensivo em Tempo Real:** Escaneia e orienta Vibe Coders, Makers No-Code e desenvolvedores acelerados por IA diretamente no editor.

---

## ⚡ Recursos da Extensão:

1. **Varredura em Tempo de Digitação e Salvamento:**
   - Detecta chaves de API expostas, tokens Bearer e segredos hardcoded antes do commit.
   - Destaca `console.log()` residuais em arquivos TypeScript e JavaScript com dicas empáticas.
2. **Comando Integrado:**
   - Execute `Ctrl+Shift+P` (ou `Cmd+Shift+P` no Mac) e digite `Urion: Executar Scan` para varrer o arquivo ativo.
3. **Integração com o Urion Verified:**
   - Comunica com o backend do Urion Safeguard para validar conformidade FSD e Dogma Zero.

---

## 🚀 Como Testar / Instalar Localmente:

1. Abra a pasta `tools/vscode-extension` no VS Code ou Cursor.
2. Pressione `F5` para abrir uma nova janela de desenvolvimento de extensões (**Extension Development Host**).
3. Abra qualquer arquivo `.ts`, `.js`, `.json` ou `.yaml` e salve para ver os diagnósticos de segurança em tempo real!
