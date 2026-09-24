import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { afterEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const blueprintAutoPath = path.resolve(here, '../../../../bin/lib/blueprint-auto.cjs');

describe('blueprint (CLI) e 100% local', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('grava o arquivo localmente e nao abre nenhuma conexao de rede', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'urion-bp-'));
    try {
      fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify({ name: 'meu-app-secreto' }));

      const httpsSpy = vi.spyOn(https, 'request');
      const httpSpy = vi.spyOn(http, 'request');
      const connectSpy = vi.spyOn(net, 'connect');
      vi.spyOn(console, 'log').mockImplementation(() => undefined);
      vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

      const { runBlueprintAuto } = require(blueprintAutoPath) as {
        runBlueprintAuto: (p: string) => Promise<{ localPath: string }>;
      };
      const result = await runBlueprintAuto(tmp);

      expect(result.localPath.startsWith(path.join(tmp, '.urion', 'blueprints'))).toBe(true);
      expect(fs.existsSync(result.localPath)).toBe(true);
      expect(httpsSpy).not.toHaveBeenCalled();
      expect(httpSpy).not.toHaveBeenCalled();
      expect(connectSpy).not.toHaveBeenCalled();

      const saved = fs.readFileSync(result.localPath, 'utf8');
      expect(saved).not.toContain('meu-app-secreto');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('o modulo nao importa https/http/net (guarda contra regressao)', () => {
    const source = fs.readFileSync(blueprintAutoPath, 'utf8');
    expect(source).not.toMatch(/require\(\s*['"](?:node:)?(?:https?|net|tls)['"]\s*\)/);
    expect(source).not.toContain('urion.dev');
  });
});
